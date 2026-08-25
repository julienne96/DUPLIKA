<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('cinetpay_transaction_id', 120)
                ->nullable()
                ->after('payment_transaction_id');

            $table->string('cinetpay_notify_token', 255)
                ->nullable()
                ->after('cinetpay_transaction_id');

            $table->text('cinetpay_payment_url')
                ->nullable()
                ->after('cinetpay_notify_token');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'cinetpay_transaction_id',
                'cinetpay_notify_token',
                'cinetpay_payment_url',
            ]);
        });
    }
};