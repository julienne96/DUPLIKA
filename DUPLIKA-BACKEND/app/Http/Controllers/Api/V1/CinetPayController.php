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
    public function notify(
        Request $request,
        CinetPayService $cinetPay
    ): JsonResponse {
        // CinetPay utilise GET uniquement pour vérifier que l'URL répond.
        if ($request->isMethod('get')) {
            return response()->json(['received' => true]);
        }

        if (! $cinetPay->hasValidWebhookSignature($request)) {
            return response()->json([
                'message' => 'Signature CinetPay invalide.',
            ], 401);
        }

        if (
            (string) $request->input('cpm_site_id') !==
            (string) config('services.cinetpay.site_id')
        ) {
            return response()->json([
                'message' => 'Site CinetPay invalide.',
            ], 401);
        }

        $transactionId = (string) $request->input('cpm_trans_id', '');

        $order = Order::query()
            ->where('payment_transaction_id', $transactionId)
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Transaction inconnue.',
            ], 404);
        }

        if ($order->status === 'payee') {
            return response()->json(['received' => true]);
        }

        try {
            $cinetPay->synchronize($order);
        } catch (Throwable $exception) {
            Log::error('Échec de synchronisation du webhook CinetPay.', [
                'order_reference' => $order->reference,
                'transaction_id' => $transactionId,
                'exception' => $exception,
            ]);

            return response()->json([
                'message' => 'Vérification CinetPay temporairement indisponible.',
            ], 503);
        }

        return response()->json(['received' => true]);
    }

    public function synchronize(
        Request $request,
        Order $order,
        CinetPayService $cinetPay
    ): JsonResponse {
        abort_unless($order->user_id === $request->user()->id, 404);

        $order = $cinetPay->synchronize($order);

        return response()->json([
            'data' => [
                'reference' => $order->reference,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
            ],
        ]);
    }
}
