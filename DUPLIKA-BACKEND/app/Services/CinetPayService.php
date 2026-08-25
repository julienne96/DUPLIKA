<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use UnexpectedValueException;

class CinetPayService
{
    private string $baseUrl;
    private string $apiKey;
    private string $apiPassword;

    public function __construct()
    {
        $this->baseUrl = rtrim(
            (string) config('services.cinetpay.base_url'),
            '/'
        );

        $this->apiKey =
            (string) config('services.cinetpay.api_key');

        $this->apiPassword =
            (string) config('services.cinetpay.api_password');
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification configuration
    |--------------------------------------------------------------------------
    */

    public function assertConfigured(): void
    {
        if (
            $this->baseUrl === '' ||
            $this->apiKey === '' ||
            $this->apiPassword === ''
        ) {
            throw new RuntimeException(
                'Configuration CinetPay incomplète.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | OAuth
    |--------------------------------------------------------------------------
    */

    public function getAccessToken(): string
    {
        $this->assertConfigured();

        return Cache::remember(
            'cinetpay_access_token',
            now()->addHours(23),
            function (): string {

                $response = Http::acceptJson()
                    ->asJson()
                    ->timeout(30)
                    ->post(
                        $this->baseUrl . '/v1/oauth/login',
                        [
                            'api_key' => $this->apiKey,
                            'api_password' => $this->apiPassword,
                        ]
                    );

                $data = $response->json();

                if ($response->failed()) {
                    throw new RuntimeException(
                        'CinetPay HTTP '
                        . $response->status()
                        . ' : '
                        . json_encode(
                            $data,
                            JSON_UNESCAPED_UNICODE |
                            JSON_UNESCAPED_SLASHES
                        )
                    );
                }

                if (
                    ($data['status'] ?? null) !== 'OK' ||
                    empty($data['access_token'])
                ) {
                    throw new RuntimeException(
                        'CinetPay n\'a pas retourné de jeton valide.'
                    );
                }

                return (string) $data['access_token'];
            }
        );
    }

    public function forgetAccessToken(): void
    {
        Cache::forget('cinetpay_access_token');
    }

    /*
    |--------------------------------------------------------------------------
    | Validation montant
    |--------------------------------------------------------------------------
    */

    public function assertSupportedAmount(int $amount): void
    {
        $minimum =
            (int) config('services.cinetpay.min_amount', 150);

        $maximum =
            (int) config(
                'services.cinetpay.max_amount',
                1500000
            );

        if ($amount <= 0) {
            throw new UnexpectedValueException(
                'Le montant du paiement doit être supérieur à zéro.'
            );
        }

        if ($amount < $minimum || $amount > $maximum) {
            throw new UnexpectedValueException(
                "Le montant doit être compris entre {$minimum} et {$maximum} XOF."
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Conversion du moyen de paiement DUPLIKA → CinetPay
    |--------------------------------------------------------------------------
    */

    public function paymentMethod(?string $method): ?string
    {
        return match ($method) {
            'tmoney' => 'TMONEY_TG',
            'flooz' => 'MOOV_TG',

            /*
             * Si le frontend envoie simplement "cinetpay",
             * aucune méthode n'est imposée.
             * CinetPay présentera les moyens disponibles.
             */
            'cinetpay', null => null,

            default => throw new UnexpectedValueException(
                'Moyen de paiement non supporté.'
            ),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Initialisation du paiement
    |--------------------------------------------------------------------------
    */

    public function initializePayment(Order $order): array
    {
        $this->assertConfigured();
        $this->assertSupportedAmount((int) $order->total);

        if (blank($order->payment_transaction_id)) {
            throw new UnexpectedValueException(
                'La commande ne possède pas d\'identifiant de transaction.'
            );
        }

        $token = $this->getAccessToken();

        $frontendUrl = rtrim(
            (string) config('services.cinetpay.frontend_url'),
            '/'
        );

        $backendUrl = rtrim(
            (string) config('services.cinetpay.backend_url'),
            '/'
        );

        if ($frontendUrl === '' || $backendUrl === '') {
            throw new RuntimeException(
                'Les URLs DUPLIKA ne sont pas configurées.'
            );
        }

        $payload = [
            'currency' => 'XOF',

            'merchant_transaction_id' =>
                $order->payment_transaction_id,

            'amount' => (int) $order->total,

            'lang' => 'fr',

            'designation' =>
                'Commande DUPLIKA ' . $order->reference,

            'client_email' =>
                $order->email,

            'client_phone_number' =>
                $this->normalizeTogoPhone($order->phone),

            'client_first_name' =>
                $order->first_name,

            'client_last_name' =>
                $order->last_name,

            'direct_pay' => false,

            'success_url' =>
                $frontendUrl
                . '/suivi?reference='
                . urlencode($order->reference),

            'failed_url' =>
                $frontendUrl
                . '/suivi?reference='
                . urlencode($order->reference),

            'notify_url' =>
                $backendUrl
                . '/api/v1/payments/cinetpay/notify',
        ];

        $method = $this->paymentMethod(
            $order->payment_method
        );

        if ($method !== null) {
            $payload['payment_method'] = $method;
        }

        $response = Http::acceptJson()
            ->asJson()
            ->withToken($token)
            ->timeout(30)
            ->post(
                $this->baseUrl . '/v1/payment',
                $payload
            );

        $data = $response->json();

        /*
         * Si le token a expiré côté CinetPay,
         * on l'efface pour le prochain appel.
         */
        if (
            ($data['status'] ?? null) === 'EXPIRED_TOKEN' ||
            ($data['status'] ?? null) === 'INVALID_TOKEN'
        ) {
            $this->forgetAccessToken();
        }

        if ($response->failed()) {
            throw new RuntimeException(
                'Initialisation CinetPay HTTP '
                . $response->status()
                . ' : '
                . json_encode(
                    $data,
                    JSON_UNESCAPED_UNICODE |
                    JSON_UNESCAPED_SLASHES
                )
            );
        }

        if (
            ($data['status'] ?? null) !== 'OK' ||
            empty($data['payment_url'])
        ) {
            throw new RuntimeException(
                'CinetPay n\'a pas retourné de lien de paiement valide.'
            );
        }

        /*
         * Sauvegarde des informations CinetPay.
         */
        $order->update([
            'cinetpay_transaction_id' =>
                $data['transaction_id'] ?? null,

            'cinetpay_notify_token' =>
                $data['notify_token'] ?? null,

            'cinetpay_payment_url' =>
                $data['payment_url'],

            'payment_status' =>
                $data['details']['status']
                ?? 'INITIATED',
        ]);

        return $data;
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification canonique du paiement
    |--------------------------------------------------------------------------
    */

    public function checkPayment(
        string $merchantTransactionId
    ): array {
        $token = $this->getAccessToken();

        $response = Http::acceptJson()
            ->withToken($token)
            ->timeout(30)
            ->get(
                $this->baseUrl
                . '/v1/payment/'
                . urlencode($merchantTransactionId)
            );

        $data = $response->json();

        if (
            ($data['status'] ?? null) === 'EXPIRED_TOKEN' ||
            ($data['status'] ?? null) === 'INVALID_TOKEN'
        ) {
            $this->forgetAccessToken();
        }

        if ($response->failed()) {
            throw new RuntimeException(
                'Vérification CinetPay HTTP '
                . $response->status()
                . ' : '
                . json_encode(
                    $data,
                    JSON_UNESCAPED_UNICODE |
                    JSON_UNESCAPED_SLASHES
                )
            );
        }

        return is_array($data) ? $data : [];
    }

    /*
    |--------------------------------------------------------------------------
    | Synchronisation commande
    |--------------------------------------------------------------------------
    */

    public function synchronize(Order $order): Order
    {
        if (blank($order->payment_transaction_id)) {
            throw new UnexpectedValueException(
                'La commande ne possède pas de transaction CinetPay.'
            );
        }

        $data = $this->checkPayment(
            $order->payment_transaction_id
        );

        /*
         * Protection supplémentaire :
         * l'identifiant retourné doit correspondre
         * à celui de notre commande.
         */
        $returnedMerchantId =
            (string) ($data['merchant_transaction_id'] ?? '');

        if (
            $returnedMerchantId !== '' &&
            ! hash_equals(
                (string) $order->payment_transaction_id,
                $returnedMerchantId
            )
        ) {
            throw new UnexpectedValueException(
                'La transaction retournée par CinetPay ne correspond pas à la commande.'
            );
        }

        return $this->applyVerification(
            $order,
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Application du statut
    |--------------------------------------------------------------------------
    */

    private function applyVerification(
        Order $order,
        array $data
    ): Order {
        return DB::transaction(
            function () use ($order, $data): Order {

                $lockedOrder = Order::query()
                    ->with('items')
                    ->lockForUpdate()
                    ->findOrFail($order->id);

                $paymentStatus = strtoupper(
                    (string) ($data['status'] ?? '')
                );

                if ($paymentStatus === '') {
                    throw new RuntimeException(
                        'CinetPay n\'a retourné aucun statut.'
                    );
                }

                $lockedOrder->payment_status =
                    $paymentStatus;

                $lockedOrder->payment_verified_at =
                    now();

                if (! empty($data['transaction_id'])) {
                    $lockedOrder->cinetpay_transaction_id =
                        (string) $data['transaction_id'];
                }

                /*
                 * Paiement confirmé.
                 */
                if ($paymentStatus === 'SUCCESS') {

                    if ($lockedOrder->status !== 'payee') {
                        $lockedOrder->status = 'payee';

                        if ($lockedOrder->paid_at === null) {
                            $lockedOrder->paid_at = now();
                        }
                    }

                    /*
                     * Le stock n'est décrémenté
                     * qu'une seule fois.
                     */
                    if (
                        $lockedOrder->stock_decremented_at
                        === null
                    ) {
                        foreach (
                            $lockedOrder->items as $item
                        ) {
                            $product = Product::query()
                                ->lockForUpdate()
                                ->find($item->product_id);

                            if (! $product) {
                                Log::warning(
                                    'Produit introuvable pendant la mise à jour du stock CinetPay.',
                                    [
                                        'order_reference' =>
                                            $lockedOrder->reference,

                                        'product_id' =>
                                            $item->product_id,
                                    ]
                                );

                                continue;
                            }

                            if (
                                $product->stock <
                                $item->quantity
                            ) {
                                Log::critical(
                                    'Stock insuffisant après paiement CinetPay.',
                                    [
                                        'order_reference' =>
                                            $lockedOrder->reference,

                                        'product_id' =>
                                            $product->id,

                                        'available_stock' =>
                                            $product->stock,

                                        'paid_quantity' =>
                                            $item->quantity,
                                    ]
                                );
                            }

                            $product->update([
                                'stock' => max(
                                    0,
                                    (int) $product->stock
                                    - (int) $item->quantity
                                ),
                            ]);
                        }

                        $lockedOrder->stock_decremented_at =
                            now();
                    }
                }

                /*
                 * Paiement encore en cours.
                 */
                elseif (
                    in_array(
                        $paymentStatus,
                        [
                            'INITIATED',
                            'PENDING',
                        ],
                        true
                    )
                ) {
                    if (
                        $lockedOrder->status !== 'payee'
                    ) {
                        $lockedOrder->status =
                            'en_attente_paiement';
                    }
                }

                /*
                 * Paiement terminé sans succès.
                 */
                elseif (
                    in_array(
                        $paymentStatus,
                        [
                            'FAILED',
                            'EXPIRED',
                        ],
                        true
                    )
                ) {
                    if (
                        $lockedOrder->status !== 'payee'
                    ) {
                        $lockedOrder->status =
                            'annulee';
                    }
                }

                $lockedOrder->save();

                return $lockedOrder->refresh();
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Téléphone togolais
    |--------------------------------------------------------------------------
    */

    private function normalizeTogoPhone(
        ?string $phone
    ): ?string {
        if ($phone === null || trim($phone) === '') {
            return null;
        }

        $phone = preg_replace(
            '/[^\d+]/',
            '',
            trim($phone)
        );

        if (str_starts_with($phone, '+228')) {
            return $phone;
        }

        if (str_starts_with($phone, '228')) {
            return '+' . $phone;
        }

        $phone = ltrim($phone, '0');

        return '+228' . $phone;
    }
}