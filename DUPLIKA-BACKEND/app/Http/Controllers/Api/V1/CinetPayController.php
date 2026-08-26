<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CinetPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class CinetPayController extends Controller
{
    /**
     * Webhook CinetPay.
     */
    public function notify(
        Request $request,
        CinetPayService $cinetPay
    ): JsonResponse {
        /*
         * CinetPay recommande aussi de permettre GET
         * pour vérifier que l'URL est accessible.
         */
        if ($request->isMethod('get')) {
            return response()->json([
                'received' => true,
            ]);
        }

        $merchantTransactionId = (string)
            $request->input('merchant_transaction_id', '');

        $transactionId = (string)
            $request->input('transaction_id', '');

        $notifyToken = (string)
            $request->input('notify_token', '');

        /*
         * Le webhook doit contenir au minimum
         * notre identifiant marchand.
         */
        if ($merchantTransactionId === '') {
            Log::warning(
                'Webhook CinetPay sans merchant_transaction_id.',
                [
                    'transaction_id' => $transactionId,
                ]
            );

            /*
             * Réponse 200 volontaire :
             * on évite les retries infinis sur
             * une notification inutilisable.
             */
            return response()->json([
                'received' => true,
            ]);
        }

        $order = Order::query()
            ->where(
                'payment_transaction_id',
                $merchantTransactionId
            )
            ->first();

        if (! $order) {
            Log::warning(
                'Webhook CinetPay pour une transaction inconnue.',
                [
                    'merchant_transaction_id' =>
                        $merchantTransactionId,

                    'transaction_id' =>
                        $transactionId,
                ]
            );

            return response()->json([
                'received' => true,
            ]);
        }

        /*
         * Vérification du notify_token.
         *
         * On compare le token reçu avec celui
         * sauvegardé lors de l'initialisation.
         */
        if (
            filled($order->cinetpay_notify_token)
            && (
                $notifyToken === ''
                || ! hash_equals(
                    (string) $order->cinetpay_notify_token,
                    $notifyToken
                )
            )
        ) {
            Log::warning(
                'Notify token CinetPay invalide.',
                [
                    'order_reference' =>
                        $order->reference,

                    'merchant_transaction_id' =>
                        $merchantTransactionId,
                ]
            );

            return response()->json([
                'received' => true,
            ]);
        }

        /*
         * Si la commande est déjà payée,
         * le traitement est idempotent.
         */
        if (
            $order->status === 'payee'
            && $order->stock_decremented_at !== null
        ) {
            return response()->json([
                'received' => true,
            ]);
        }

        try {
            /*
             * IMPORTANT :
             * on ne fait jamais confiance au statut
             * contenu dans le webhook.
             *
             * synchronize() appelle :
             *
             * GET /v1/payment/{merchant_transaction_id}
             *
             * et utilise la réponse CinetPay comme
             * source de vérité.
             */
            $cinetPay->synchronize($order);
        } catch (Throwable $exception) {
            Log::error(
                'Échec de synchronisation du webhook CinetPay.',
                [
                    'order_reference' =>
                        $order->reference,

                    'merchant_transaction_id' =>
                        $merchantTransactionId,

                    'transaction_id' =>
                        $transactionId,

                    'exception' =>
                        $exception->getMessage(),
                ]
            );

            /*
             * La doc demande une réponse rapide.
             * Ici on répond quand même 200 :
             * la commande pourra être resynchronisée
             * via l'endpoint /sync.
             */
            return response()->json([
                'received' => true,
            ]);
        }

        return response()->json([
            'received' => true,
        ]);
    }

    /**
     * Synchronisation manuelle d'une commande.
     */
    public function synchronize(
        Request $request,
        Order $order,
        CinetPayService $cinetPay
    ): JsonResponse {
        abort_unless(
            $order->user_id === $request->user()->id,
            404
        );

        try {
            $order = $cinetPay->synchronize($order);
        } catch (Throwable $exception) {
            return response()->json([
                'message' =>
                    'Impossible de vérifier le paiement CinetPay pour le moment.',

                'error' =>
                    $exception->getMessage(),
            ], 502);
        }

        return response()->json([
            'data' => [
                'reference' =>
                    $order->reference,

                'status' =>
                    $order->status,

                'paymentStatus' =>
                    $order->payment_status,

                'paidAt' =>
                    $order->paid_at?->toISOString(),
            ],
        ]);
    }
}