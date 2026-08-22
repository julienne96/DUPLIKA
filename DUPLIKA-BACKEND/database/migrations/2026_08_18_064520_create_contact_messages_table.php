<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();

            // Informations du visiteur
            $table->string('name', 150);
           $table->string('email', 190);
            $table->string('phone', 50)->nullable();

            // Contenu du message
            $table->string('subject', 255)->nullable();
            $table->text('message');

            // Gestion dans le back-office
            $table->string('status', 30)->default('nouveau');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('processed_at')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('email');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};