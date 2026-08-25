<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'reference',
        'status',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'zone_id',
        'zone_name',
        'delivery_notes',
        'shipping_method_id',
        'shipping_method_name',
        'shipping_delay',
        'subtotal',
        'discount',
        'shipping',
        'total',
        'currency',
        'tracking_number',
        'tracking_url',
        'carrier',
        'paid_at',
        'payment_method',
        'payment_provider',
        'payment_transaction_id',
        'payment_status',
        'payment_provider_method',
        'payment_operator_id',
        'payment_verified_at',
        'stock_decremented_at',
        'cinetpay_transaction_id',
        'cinetpay_notify_token',
        'cinetpay_payment_url',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'discount' => 'integer',
            'shipping' => 'integer',
            'total' => 'integer',
            'paid_at' => 'datetime',
            'payment_verified_at' => 'datetime',
            'stock_decremented_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }
}
