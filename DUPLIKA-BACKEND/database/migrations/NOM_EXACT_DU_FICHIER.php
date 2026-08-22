<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->after('id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('line1')->after('user_id');
            $table->string('line2')->nullable()->after('line1');
            $table->string('city', 120)->after('line2');
            $table->string('zone_id', 120)->nullable()->after('city');
            $table->text('notes')->nullable()->after('zone_id');
            $table->boolean('is_default')->default(false)->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropForeign(['user_id']);

            $table->dropColumn([
                'user_id',
                'line1',
                'line2',
                'city',
                'zone_id',
                'notes',
                'is_default',
            ]);
        });
    }
};