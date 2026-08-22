<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('reference', 50)->unique();

            $table->string('status', 50)
                ->default('en_attente_paiement');

            // Informations client
            $table->string('first_name', 120);
            $table->string('last_name', 120);
            $table->string('email', 190);
            $table->string('phone', 50)->nullable();

            // Adresse de livraison
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city', 120);
            $table->string('zone_id', 120)->nullable();
            $table->string('zone_name', 120)->nullable();
            $table->text('delivery_notes')->nullable();

            // Livraison
            $table->foreignId('shipping_method_id')
                ->nullable()
                ->constrained('shipping_methods')
                ->nullOnDelete();

            $table->string('shipping_method_name', 120)->nullable();
            $table->string('shipping_delay', 120)->nullable();

            // Montants en centimes
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('shipping')->default(0);
            $table->unsignedBigInteger('total')->default(0);

            $table->string('currency', 10)->default('XOF');

            // Suivi
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->string('carrier')->nullable();

            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('email');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};