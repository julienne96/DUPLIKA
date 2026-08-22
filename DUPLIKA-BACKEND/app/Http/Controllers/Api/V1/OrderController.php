<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Retourne les commandes de l'utilisateur connecté.
     */
    public function myOrders(Request $request): JsonResponse
    {
        $baseUrl = $request->getSchemeAndHttpHost();

        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->get()
            ->map(function (Order $order) use ($baseUrl) {
                return [
                    'reference' => $order->reference,
                    'status' => $order->status,
                    'createdAt' => $order->created_at->toISOString(),
                    'email' => $order->email,

                    'paymentMethod' => $order->payment_method,

                    'quote' => [
                        'lines' => $order->items
                            ->map(function ($item) use ($baseUrl) {
                                return [
                                    'productSlug' =>
                                        $item->product_slug,

                                    'variantId' =>
                                        $item->variant_id ?? '',

                                    'name' =>
                                        $item->name,

                                    'variantLabel' =>
                                        $item->variant_label ?? '',

                                    'image' =>
                                        $item->image
                                            ? $baseUrl
                                                . '/storage/'
                                                . ltrim($item->image, '/')
                                            : '',

                                    'unitPrice' =>
                                        (int) $item->unit_price,

                                    'compareAtPrice' =>
                                        $item->compare_at_price !== null
                                            ? (int) $item->compare_at_price
                                            : null,

                                    'quantity' =>
                                        (int) $item->quantity,

                                    'lineTotal' =>
                                        (int) $item->line_total,

                                    'availableStock' =>
                                        0,
                                ];
                            })
                            ->values(),

                        'subtotal' =>
                            (int) $order->subtotal,

                        'discount' =>
                            (int) $order->discount,

                        'shipping' =>
                            (int) $order->shipping,

                        'total' =>
                            (int) $order->total,

                        'currency' =>
                            $order->currency,

                        'warnings' =>
                            [],
                    ],

                    'customer' => [
                        'firstName' =>
                            $order->first_name,

                        'lastName' =>
                            $order->last_name,

                        'email' =>
                            $order->email,

                        'phone' =>
                            $order->phone ?? '',
                    ],

                    'address' => [
                        'line1' =>
                            $order->address_line1,

                        'line2' =>
                            $order->address_line2,

                        'city' =>
                            $order->city,

                        'zoneId' =>
                            $order->zone_id ?? '',

                        'zoneName' =>
                            $order->zone_name,

                        'notes' =>
                            $order->delivery_notes,
                    ],

                    'shipping' =>
                        $order->shipping_method_name
                            ? [
                                'methodName' =>
                                    $order->shipping_method_name,

                                'delay' =>
                                    $order->shipping_delay ?? '',
                            ]
                            : null,

                    'trackingNumber' =>
                        $order->tracking_number,

                    'trackingUrl' =>
                        $order->tracking_url,

                    'carrier' =>
                        $order->carrier,

                    'events' => [
                        [
                            'at' =>
                                $order->created_at->toISOString(),

                            'status' =>
                                $order->status,

                            'label' =>
                                'Commande enregistrée.',
                        ],
                    ],
                ];
            });

        return response()->json([
            'data' => $orders,
        ]);
    }

    /**
     * Retourne le détail d'une commande.
     */
    public function show(
        Request $request,
        string $reference
    ): JsonResponse {
        $baseUrl = $request->getSchemeAndHttpHost();

        $order = Order::query()
            ->with('items')
            ->where('reference', $reference)
            ->first();

        if (! $order) {
            return response()->json([
                'message' =>
                    'Commande introuvable.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'reference' =>
                    $order->reference,

                'status' =>
                    $order->status,

                'paymentMethod' =>
                    $order->payment_method,

                'customer' => [
                    'firstName' =>
                        $order->first_name,

                    'lastName' =>
                        $order->last_name,

                    'email' =>
                        $order->email,

                    'phone' =>
                        $order->phone,
                ],

                'address' => [
                    'line1' =>
                        $order->address_line1,

                    'line2' =>
                        $order->address_line2,

                    'city' =>
                        $order->city,

                    'zoneId' =>
                        $order->zone_id,

                    'zoneName' =>
                        $order->zone_name,

                    'notes' =>
                        $order->delivery_notes,
                ],

                'shipping' =>
                    $order->shipping_method_name
                        ? [
                            'methodName' =>
                                $order->shipping_method_name,

                            'delay' =>
                                $order->shipping_delay ?? '',
                        ]
                        : null,

                'quote' => [
                    'lines' =>
                        $order->items
                            ->map(function ($item) use ($baseUrl) {
                                return [
                                    'productSlug' =>
                                        $item->product_slug,

                                    'variantId' =>
                                        $item->variant_id ?? '',

                                    'name' =>
                                        $item->name,

                                    'variantLabel' =>
                                        $item->variant_label ?? '',

                                    'image' =>
                                        $item->image
                                            ? $baseUrl
                                                . '/storage/'
                                                . ltrim($item->image, '/')
                                            : '',

                                    'unitPrice' =>
                                        (int) $item->unit_price,

                                    'compareAtPrice' =>
                                        $item->compare_at_price !== null
                                            ? (int) $item->compare_at_price
                                            : null,

                                    'quantity' =>
                                        (int) $item->quantity,

                                    'lineTotal' =>
                                        (int) $item->line_total,

                                    'availableStock' =>
                                        0,
                                ];
                            })
                            ->values(),

                    'subtotal' =>
                        (int) $order->subtotal,

                    'discount' =>
                        (int) $order->discount,

                    'shipping' =>
                        (int) $order->shipping,

                    'total' =>
                        (int) $order->total,

                    'currency' =>
                        $order->currency,

                    'warnings' =>
                        [],
                ],

                'trackingNumber' =>
                    $order->tracking_number,

                'trackingUrl' =>
                    $order->tracking_url,

                'carrier' =>
                    $order->carrier,

                'createdAt' =>
                    $order->created_at?->toISOString(),

                'events' => [
                    [
                        'at' =>
                            $order->created_at?->toISOString(),

                        'status' =>
                            $order->status,

                        'label' =>
                            'Commande enregistrée.',
                    ],
                ],
            ],
        ]);
    }
}