<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use UnexpectedValueException;

class CinetPayService
{
    private const HMAC_FIELDS = [
        'cpm_site_id',
        'cpm_trans_id',
        'cpm_trans_date',
        'cpm_amount',
        'cpm_currency',
        'signature',
        'payment_method',
        'cel_phone_num',
        'cpm_phone_prefixe',
        'cpm_language',
        'cpm_version',
        'cpm_payment_config',
        'cpm_page_action',
        'cpm_custom',
        'cpm_designation',
        'cpm_error_message',
    ];

    public function assertConfigured(): void
    {
        $missing = collect([
            'api_key',
            'site_id',
            'secret_key',
            'notify_url',
        ])->filter(
            fn (string $key): bool => blank(config("services.cinetpay.{$key}"))
        );

        if ($missing->isNotEmpty()) {
            throw new RuntimeException(
                'CinetPay n\'est pas encore configuré sur le serveur.'
            );
        }
    }

    /**
     * Paramètres transmis au SDK Seamless officiel.
     * La Secret Key n'est jamais incluse dans cette réponse.
     *
     * @return array<string, mixed>
     */
    public function checkoutData(Order $order): array
    {
        $this->assertConfigured();
        $this->assertSupportedAmount((int) $order->total);

        return [
            'apiKey' => (string) config('services.cinetpay.api_key'),
            'siteId' => (string) config('services.cinetpay.site_id'),
            'notifyUrl' => (string) config('services.cinetpay.notify_url'),
            'mode' => (string) config('services.cinetpay.mode', 'PRODUCTION'),
            'closeAfterResponse' => (bool) config(
                'services.cinetpay.close_after_response',
                true
            ),
            'transactionId' => $order->payment_transaction_id,
            'amount' => (int) $order->total,
            'currency' => $order->currency,
            'channels' => (string) config(
                'services.cinetpay.channels',
                'MOBILE_MONEY'
            ),
            'description' => "Paiement commande {$order->reference}",
            'metadata' => $order->reference,
            'customer' => [
                'id' => (string) $order->user_id,
                'name' => $order->last_name,
                'surname' => $order->first_name,
                'email' => $order->email,
                'phone' => $order->phone ?? '',
                'address' => $order->address_line1,
                'city' => $order->city,
                'country' => 'TG',
            ],
        ];
    }

    public function assertSupportedAmount(int $amount): void
    {
        $minimum = (int) config('services.cinetpay.min_amount', 150);
        $maximum = (int) config('services.cinetpay.max_amount', 1500000);

        if ($amount <= 0 || $amount % 5 !== 0) {
            throw new UnexpectedValueException(
                'Le total CinetPay doit être positif et multiple de 5 XOF.'
            );
        }

        if ($amount < $minimum || $amount > $maximum) {
            throw new UnexpectedValueException(
                "Le total CinetPay doit être compris entre {$minimum} et {$maximum} XOF."
            );
        }
    }

    public function hasValidWebhookSignature(Request $request): bool
    {
        $secretKey = (string) config('services.cinetpay.secret_key');
        $receivedToken = (string) $request->header('x-token', '');

        if ($secretKey === '' || $receivedToken === '') {
            return false;
        }

        $signedData = collect(self::HMAC_FIELDS)
            ->map(fn (string $field): string => (string) $request->input($field, ''))
            ->implode('');

        $expectedToken = hash_hmac('sha256', $signedData, $secretKey);

        return hash_equals(
            strtolower($expectedToken),
            strtolower(trim($receivedToken))
        );
    }

    /**
     * Vérifie la transaction auprès de CinetPay, puis applique le résultat.
     *
     * @throws RequestException
     */
    public function synchronize(Order $order): Order
    {
        $this->assertConfigured();

        if (blank($order->payment_transaction_id)) {
            throw new UnexpectedValueException(
                'La commande ne possède pas de transaction CinetPay.'
            );
        }

        $response = Http::asJson()
            ->acceptJson()
            ->withUserAgent('DUPLIKA-CinetPay/1.0')
            ->timeout(15)
            ->retry(2, 300)
            ->post(
                (string) config('services.cinetpay.verification_url'),
                [
                    'apikey' => (string) config('services.cinetpay.api_key'),
                    'site_id' => (string) config('services.cinetpay.site_id'),
                    'transaction_id' => $order->payment_transaction_id,
                ]
            );

        $response->throw();

        $payload = $response->json();
        $data = is_array($payload) ? ($payload['data'] ?? null) : null;

        if (! is_array($data) || blank($data['status'] ?? null)) {
            throw new RuntimeException(
                'CinetPay a renvoyé une réponse de vérification invalide.'
            );
        }

        return $this->applyVerification($order, $data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function applyVerification(Order $order, array $data): Order
    {
        return DB::transaction(function () use ($order, $data): Order {
            $lockedOrder = Order::query()
                ->with('items')
                ->lockForUpdate()
                ->findOrFail($order->id);

            $verifiedAmount = (int) round((float) ($data['amount'] ?? 0));
            $verifiedCurrency = strtoupper((string) ($data['currency'] ?? ''));

            if (
                $verifiedAmount !== (int) $lockedOrder->total ||
                $verifiedCurrency !== strtoupper($lockedOrder->currency)
            ) {
                Log::warning('Montant CinetPay incohérent.', [
                    'order_reference' => $lockedOrder->reference,
                    'expected_amount' => (int) $lockedOrder->total,
                    'received_amount' => $verifiedAmount,
                    'expected_currency' => $lockedOrder->currency,
                    'received_currency' => $verifiedCurrency,
                ]);

                throw new UnexpectedValueException(
                    'Le montant vérifié par CinetPay ne correspond pas à la commande.'
                );
            }

            $paymentStatus = strtoupper((string) $data['status']);

            $lockedOrder->fill([
                'payment_status' => $paymentStatus,
                'payment_provider_method' => $data['payment_method'] ?? null,
                'payment_operator_id' => $data['operator_id'] ?? null,
                'payment_verified_at' => now(),
            ]);

            if ($paymentStatus === 'ACCEPTED' && $lockedOrder->status !== 'payee') {
                $lockedOrder->status = 'payee';
                $lockedOrder->paid_at = $this->paymentDate($data['payment_date'] ?? null);

                if ($lockedOrder->stock_decremented_at === null) {
                    foreach ($lockedOrder->items as $item) {
                        $product = Product::query()
                            ->lockForUpdate()
                            ->find($item->product_id);

                        if (! $product) {
                            continue;
                        }

                        if ($product->stock < $item->quantity) {
                            Log::critical('Stock insuffisant après paiement CinetPay.', [
                                'order_reference' => $lockedOrder->reference,
                                'product_id' => $product->id,
                                'available_stock' => $product->stock,
                                'paid_quantity' => $item->quantity,
                            ]);
                        }

                        $product->update([
                            'stock' => max(0, $product->stock - $item->quantity),
                        ]);
                    }

                    $lockedOrder->stock_decremented_at = now();
                }
            } elseif (
                in_array($paymentStatus, ['REFUSED', 'CANCELLED'], true) &&
                $lockedOrder->status !== 'payee'
            ) {
                $lockedOrder->status = 'annulee';
            }

            $lockedOrder->save();

            return $lockedOrder->refresh();
        });
    }

    private function paymentDate(mixed $value): Carbon
    {
        if (is_string($value) && trim($value) !== '') {
            try {
                return Carbon::parse($value);
            } catch (\Throwable) {
                // La date CinetPay est informative ; la vérification serveur fait autorité.
            }
        }

        return now();
    }
}
