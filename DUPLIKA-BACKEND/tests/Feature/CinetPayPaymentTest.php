<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CinetPayPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.cinetpay.api_key' => 'public-api-key',
            'services.cinetpay.site_id' => '12345',
            'services.cinetpay.secret_key' => 'webhook-secret',
            'services.cinetpay.notify_url' => 'https://api.duplika.test/api/v1/payments/cinetpay/notify',
            'services.cinetpay.mode' => 'PRODUCTION',
            'services.cinetpay.channels' => 'MOBILE_MONEY',
            'services.cinetpay.close_after_response' => true,
            'services.cinetpay.verification_url' => 'https://api-checkout.cinetpay.com/v2/payment/check',
        ]);
    }

    public function test_checkout_prepares_a_seamless_popup_without_exposing_secret_key(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/checkout', [
            'customer' => [
                'firstName' => 'Afi',
                'lastName' => 'Mensah',
                'email' => $user->email,
                'phone' => '90123456',
            ],
            'address' => [
                'line1' => 'Retrait boutique DUPLIKA',
                'city' => 'Lomé',
                'zoneId' => 'pickup',
            ],
            'shippingMethodId' => 'pickup',
            'paymentMethod' => 'cinetpay',
            'lines' => [[
                'productSlug' => $product->slug,
                'variantId' => (string) $product->id,
                'quantity' => 1,
            ]],
            'createAccount' => false,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.paymentMethod', 'cinetpay')
            ->assertJsonPath('data.cinetpay.apiKey', 'public-api-key')
            ->assertJsonPath('data.cinetpay.siteId', '12345')
            ->assertJsonPath('data.cinetpay.amount', 125000)
            ->assertJsonMissing(['secretKey' => 'webhook-secret']);

        $order = Order::query()->firstOrFail();

        $this->assertSame('cinetpay', $order->payment_provider);
        $this->assertSame('PENDING', $order->payment_status);
        $this->assertMatchesRegularExpression(
            '/^DPK[A-Z0-9]+$/',
            (string) $order->payment_transaction_id
        );
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_signed_notification_verifies_payment_and_decrements_stock_once(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createPendingOrder($user, $product);

        Http::fake([
            'https://api-checkout.cinetpay.com/v2/payment/check' => Http::response([
                'code' => '00',
                'message' => 'SUCCES',
                'data' => [
                    'amount' => '125000',
                    'currency' => 'XOF',
                    'status' => 'ACCEPTED',
                    'payment_method' => 'TmoneyTG',
                    'operator_id' => 'TM-123456',
                    'payment_date' => '2026-08-25 10:00:00',
                ],
            ], 200),
        ]);

        $payload = $this->webhookPayload($order);
        $token = hash_hmac(
            'sha256',
            implode('', array_values($payload)),
            'webhook-secret'
        );

        $this->withHeader('x-token', $token)
            ->post('/api/v1/payments/cinetpay/notify', $payload)
            ->assertOk();

        $order->refresh();

        $this->assertSame('payee', $order->status);
        $this->assertSame('ACCEPTED', $order->payment_status);
        $this->assertSame('TmoneyTG', $order->payment_provider_method);
        $this->assertNotNull($order->paid_at);
        $this->assertNotNull($order->stock_decremented_at);
        $this->assertSame(8, $product->fresh()->stock);

        // Une notification répétée ne doit jamais décrémenter le stock une seconde fois.
        $this->withHeader('x-token', $token)
            ->post('/api/v1/payments/cinetpay/notify', $payload)
            ->assertOk();

        $this->assertSame(8, $product->fresh()->stock);
    }

    public function test_notification_with_invalid_hmac_is_rejected(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct();
        $order = $this->createPendingOrder($user, $product);

        Http::fake();

        $this->withHeader('x-token', 'invalid-token')
            ->post(
                '/api/v1/payments/cinetpay/notify',
                $this->webhookPayload($order)
            )
            ->assertUnauthorized();

        Http::assertNothingSent();
        $this->assertSame('en_attente_paiement', $order->fresh()->status);
        $this->assertSame(10, $product->fresh()->stock);
    }

    private function createProduct(): Product
    {
        $category = Category::create([
            'name' => 'Perruques',
            'slug' => 'perruques',
            'is_active' => true,
        ]);

        return Product::create([
            'category_id' => $category->id,
            'name' => 'Produit CinetPay',
            'slug' => 'produit-cinetpay',
            'sku' => 'CINETPAY-001',
            'price' => 125000,
            'stock' => 10,
            'is_active' => true,
        ]);
    }

    private function createPendingOrder(User $user, Product $product): Order
    {
        $order = Order::create([
            'user_id' => $user->id,
            'reference' => 'DPK-TEST-001',
            'status' => 'en_attente_paiement',
            'first_name' => 'Afi',
            'last_name' => 'Mensah',
            'email' => $user->email,
            'phone' => '90123456',
            'address_line1' => 'Retrait boutique DUPLIKA',
            'city' => 'Lomé',
            'zone_id' => 'pickup',
            'zone_name' => 'Retrait à la boutique',
            'shipping_method_name' => 'Retrait à la boutique',
            'subtotal' => 125000,
            'discount' => 0,
            'shipping' => 0,
            'total' => 125000,
            'currency' => 'XOF',
            'payment_method' => 'cinetpay',
            'payment_provider' => 'cinetpay',
            'payment_transaction_id' => 'DPKTESTCINETPAY001',
            'payment_status' => 'PENDING',
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_slug' => $product->slug,
            'variant_id' => (string) $product->id,
            'name' => $product->name,
            'unit_price' => 125000,
            'quantity' => 2,
            'line_total' => 125000,
        ]);

        return $order;
    }

    /**
     * L'ordre des clés correspond exactement à celui défini par CinetPay pour le HMAC.
     *
     * @return array<string, string>
     */
    private function webhookPayload(Order $order): array
    {
        return [
            'cpm_site_id' => '12345',
            'cpm_trans_id' => (string) $order->payment_transaction_id,
            'cpm_trans_date' => '2026-08-25 10:00:00',
            'cpm_amount' => '125000',
            'cpm_currency' => 'XOF',
            'signature' => 'provider-signature',
            'payment_method' => 'TmoneyTG',
            'cel_phone_num' => '90123456',
            'cpm_phone_prefixe' => '228',
            'cpm_language' => 'fr',
            'cpm_version' => 'V4',
            'cpm_payment_config' => 'SINGLE',
            'cpm_page_action' => 'PAYMENT',
            'cpm_custom' => $order->reference,
            'cpm_designation' => 'Paiement commande',
            'cpm_error_message' => '',
        ];
    }
}
