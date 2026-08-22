<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('wig_type', 100)->nullable()->after('description');
            $table->string('texture', 100)->nullable()->after('wig_type');
            $table->string('color', 100)->nullable()->after('texture');
            $table->string('length', 100)->nullable()->after('color');
            $table->string('style', 100)->nullable()->after('length');
            $table->string('occasion', 100)->nullable()->after('style');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'wig_type',
                'texture',
                'color',
                'length',
                'style',
                'occasion',
            ]);
        });
    }
};