<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer' => ['required', 'array'],
            'customer.firstName' => ['required', 'string', 'max:120'],
            'customer.lastName' => ['required', 'string', 'max:120'],
            'customer.email' => ['required', 'email', 'max:190'],
            'customer.phone' => ['required', 'string', 'max:50'],

            'address' => ['required', 'array'],
            'address.line1' => ['required', 'string', 'max:255'],
            'address.line2' => ['nullable', 'string', 'max:255'],
            'address.city' => ['required', 'string', 'max:120'],
            'address.zoneId' => ['required', 'in:pickup,delivery'],
            'address.notes' => ['nullable', 'string', 'max:1000'],

            'shippingMethodId' => ['required', 'in:pickup,delivery'],

            'paymentMethod' => [
                'required',
                'in:tmoney,flooz',
            ],

            'lines' => ['required', 'array', 'min:1'],
            'lines.*.productSlug' => ['required', 'string'],
            'lines.*.variantId' => ['nullable', 'string'],
            'lines.*.quantity' => ['required', 'integer', 'min:1'],

            'createAccount' => ['nullable', 'boolean'],
        ]);

        /*
         * La route checkout est protégée par auth:sanctum.
         * On récupère donc l'utilisateur connecté avant
         * d'entrer dans la transaction.
         */
        $user = $request->user();

        $order = DB::transaction(function () use ($validated, $user) {

            $subtotal = 0;
            $preparedItems = [];

            /*
             * Recharge chaque produit depuis MySQL.
             * Le prix et le stock sont toujours contrôlés
             * côté backend.
             */
            foreach ($validated['lines'] as $line) {

                $product = Product::query()
                    ->where('slug', $line['productSlug'])
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->first();

                if (! $product) {
                    throw ValidationException::withMessages([
                        'lines' => [
                            "Un produit du panier n'est plus disponible.",
                        ],
                    ]);
                }

                $quantity = (int) $line['quantity'];

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'lines' => [
                            "Stock insuffisant pour {$product->name}. Stock disponible : {$product->stock}.",
                        ],
                    ]);
                }

                $unitPrice = (int) round(
                    (float) $product->price
                );

                $lineTotal =
                    $unitPrice * $quantity;

                $subtotal += $lineTotal;

                $preparedItems[] = [
                    'product' => $product,
                    'variant_id' =>
                        $line['variantId'] ?? null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $deliveryMode =
                $validated['shippingMethodId'];

            $shippingName =
                $deliveryMode === 'pickup'
                    ? 'Retrait à la boutique'
                    : 'Livraison à domicile';

            /*
             * Pour l'instant les frais de livraison
             * sont gérés séparément.
             */
            $shipping = 0;
            $discount = 0;
            $total = $subtotal;

            $reference =
                $this->generateReference();

            /*
             * Création de la commande.
             */
            $order = Order::create([
                'user_id' => $user->id,

                'reference' => $reference,

                'status' =>
                    'en_attente_paiement',

                'first_name' =>
                    $validated['customer']['firstName'],

                'last_name' =>
                    $validated['customer']['lastName'],

                'email' =>
                    $validated['customer']['email'],

                'phone' =>
                    $validated['customer']['phone'],

                'address_line1' =>
                    $validated['address']['line1'],

                'address_line2' =>
                    $validated['address']['line2']
                        ?? null,

                'city' =>
                    $validated['address']['city'],

                'zone_id' =>
                    $deliveryMode,

                'zone_name' =>
                    $shippingName,

                'delivery_notes' =>
                    $validated['address']['notes']
                        ?? null,

                'shipping_method_id' => null,

                'shipping_method_name' =>
                    $shippingName,

                'shipping_delay' =>
                    $deliveryMode === 'pickup'
                        ? 'Retrait selon disponibilité de la commande'
                        : 'À convenir avec le client',

                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping' => $shipping,
                'total' => $total,

                'currency' => 'XOF',

                /*
                 * Moyen choisi sur le checkout.
                 */
                'payment_method' =>
                    $validated['paymentMethod'],
            ]);

            /*
             * Création des lignes de commande.
             */
            foreach ($preparedItems as $item) {

                $product =
                    $item['product'];

                $order->items()->create([
                    'product_id' =>
                        $product->id,

                    'product_slug' =>
                        $product->slug,

                    'variant_id' =>
                        $item['variant_id'],

                    'name' =>
                        $product->name,

                    'variant_label' => null,

                    'image' =>
                        $product->image,

                    'unit_price' =>
                        $item['unit_price'],

                    'compare_at_price' =>
                        $product->compare_at_price !== null
                            ? (int) round(
                                (float) $product->compare_at_price
                            )
                            : null,

                    'quantity' =>
                        $item['quantity'],

                    'line_total' =>
                        $item['line_total'],
                ]);

                /*
                 * IMPORTANT :
                 * le stock n'est pas diminué ici.
                 *
                 * Il sera diminué uniquement
                 * après confirmation du paiement
                 * T-Money ou Flooz.
                 */
            }

            return $order;
        });

        return response()->json([
            'data' => [
                'reference' =>
                    $order->reference,

                'status' =>
                    $order->status,

                'paymentMethod' =>
                    $order->payment_method,

                /*
                 * Cette URL sera renseignée
                 * lors de l'intégration réelle
                 * de T-Money / Flooz.
                 */
                'paymentRedirectUrl' => null,
            ],
        ], 201);
    }

    private function generateReference(): string
    {
        do {
            $reference =
                'DPK-' .
                now()->format('ymd') .
                '-' .
                Str::upper(
                    Str::random(6)
                );
        } while (
            Order::where(
                'reference',
                $reference
            )->exists()
        );

        return $reference;
    }
}