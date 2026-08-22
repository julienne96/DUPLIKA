<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function quote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lines' => ['required', 'array'],
            'lines.*.productSlug' => ['required', 'string'],
            'lines.*.variantId' => ['required', 'string'],
            'lines.*.quantity' => ['required', 'integer', 'min:1'],
            'shipping_method_id' => ['nullable', 'string'],
        ]);

        $quoteLines = [];
        $warnings = [];
        $subtotal = 0;

        foreach ($validated['lines'] as $line) {
            $product = Product::query()
                ->where('slug', $line['productSlug'])
                ->where('is_active', true)
                ->first();

            if (! $product) {
                continue;
            }

            $requestedQuantity = (int) $line['quantity'];

            $availableQuantity = min(
                $requestedQuantity,
                max((int) $product->stock, 0)
            );

            if ($product->stock <= 0) {
                $warnings[] =
                    "{$product->name} est épuisé.";

                continue;
            }

            if ($requestedQuantity > $product->stock) {
                $warnings[] =
                    "La quantité de {$product->name} a été ajustée au stock disponible.";
            }

            $unitPrice = (float) $product->price;

            $lineTotal =
                $unitPrice * $availableQuantity;

            $quoteLines[] = [
                'productSlug' =>
                    $product->slug,

                /*
                 * Pour l'instant, DUPLIKA utilise
                 * le produit comme variante côté backend.
                 */
                'variantId' =>
                    $line['variantId'],

                'name' =>
                    $product->name,

                'variantLabel' =>
                    '',

                /*
                 * URL publique complète de l'image.
                 */
                'image' =>
                    $product->image
                        ? $request->getSchemeAndHttpHost()
                            . '/storage/'
                            . ltrim($product->image, '/')
                        : '',

                'unitPrice' =>
                    $unitPrice,

                'compareAtPrice' =>
                    $product->compare_at_price !== null
                        ? (float) $product->compare_at_price
                        : null,

                'quantity' =>
                    $availableQuantity,

                'lineTotal' =>
                    $lineTotal,

                'availableStock' =>
                    (int) $product->stock,
            ];

            $subtotal += $lineTotal;
        }

        /*
         * Les frais de livraison seront déterminés
         * lorsque le client choisira son mode
         * de réception.
         */
        $shipping = null;

        return response()->json([
            'data' => [
                'lines' =>
                    $quoteLines,

                'subtotal' =>
                    $subtotal,

                'discount' =>
                    0,

                'shipping' =>
                    $shipping,

                'total' =>
                    $subtotal,

                'currency' =>
                    'XOF',

                'warnings' =>
                    $warnings,
            ],
        ]);
    }
}