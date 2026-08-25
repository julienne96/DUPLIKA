<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_provider', 30)
                ->nullable()
                ->after('payment_method');

            $table->string('payment_transaction_id', 80)
                ->nullable()
                ->unique()
                ->after('payment_provider');

            $table->string('payment_status', 50)
                ->nullable()
                ->after('payment_transaction_id');

            $table->string('payment_provider_method', 50)
                ->nullable()
                ->after('payment_status');

            $table->string('payment_operator_id', 120)
                ->nullable()
                ->after('payment_provider_method');

            $table->timestamp('payment_verified_at')
                ->nullable()
                ->after('payment_operator_id');

            $table->timestamp('stock_decremented_at')
                ->nullable()
                ->after('payment_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['payment_transaction_id']);
            $table->dropColumn([
                'payment_provider',
                'payment_transaction_id',
                'payment_status',
                'payment_provider_method',
                'payment_operator_id',
                'payment_verified_at',
                'stock_decremented_at',
            ]);
        });
    }
};
