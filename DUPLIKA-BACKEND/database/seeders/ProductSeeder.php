<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $lace = Category::where('slug', 'perruques-lace')->firstOrFail();
        $naturelles = Category::where('slug', 'perruques-naturelles')->firstOrFail();
        $tissages = Category::where('slug', 'tissages')->firstOrFail();
        $accessoires = Category::where('slug', 'accessoires')->firstOrFail();

        Product::updateOrCreate(
            ['slug' => 'perruque-lace-noir-lisse-eclat'],
            [
                'category_id' => $lace->id,
                'name' => 'Éclat — Lace frontale lisse',
                'sku' => 'DPK-ECL',
                'short_description' => 'Lisse profond, lace HD invisible, densité 180 %.',
                'description' => 'Perruque lace frontale en cheveux naturels Remy.',
                'price' => 125000,
                'stock' => 12,
                'low_stock_threshold' => 3,
                'image' => null,
                'is_new' => true,
                'is_active' => true,
                'rating_average' => 4.80,
                'rating_count' => 126,
                'published_at' => now(),
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'perruque-bouclee-ambre'],
            [
                'category_id' => $naturelles->id,
                'name' => 'Ambre — Bouclée volume',
                'sku' => 'DPK-AMB',
                'short_description' => 'Boucles rebondies châtain cuivré, effet volume immédiat.',
                'description' => 'Perruque bouclée en cheveux naturels.',
                'price' => 98000,
                'compare_at_price' => 125000,
                'stock' => 5,
                'low_stock_threshold' => 3,
                'image' => null,
                'is_new' => false,
                'is_active' => true,
                'rating_average' => 4.60,
                'rating_count' => 84,
                'published_at' => now(),
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'perruque-blonde-solstice'],
            [
                'category_id' => $lace->id,
                'name' => 'Solstice — Blond miel ondulé',
                'sku' => 'DPK-SOL',
                'short_description' => 'Ondulations souples, blond miel travaillé en dégradé.',
                'description' => 'Perruque ondulée blond miel en cheveux naturels.',
                'price' => 142000,
                'stock' => 3,
                'low_stock_threshold' => 3,
                'image' => null,
                'is_new' => true,
                'is_active' => true,
                'rating_average' => 4.90,
                'rating_count' => 41,
                'published_at' => now(),
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'tissage-naturel-onde-douce'],
            [
                'category_id' => $tissages->id,
                'name' => 'Onde Douce — Tissage 3 bundles',
                'sku' => 'DPK-OND',
                'short_description' => 'Trois bundles assortis pour une pose sur mesure.',
                'description' => 'Tissage en cheveux naturels, trois bundles.',
                'price' => 65000,
                'stock' => 14,
                'low_stock_threshold' => 3,
                'image' => null,
                'is_new' => false,
                'is_active' => true,
                'rating_average' => 4.50,
                'rating_count' => 58,
                'published_at' => now(),
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'colle-lace-tenue-longue'],
            [
                'category_id' => $accessoires->id,
                'name' => 'Colle lace tenue longue 38 ml',
                'sku' => 'DPK-COL',
                'short_description' => 'Tenue jusqu’à 4 semaines, sans latex, waterproof.',
                'description' => 'Colle spécialement destinée aux poses de lace.',
                'price' => 12000,
                'stock' => 40,
                'low_stock_threshold' => 5,
                'image' => null,
                'is_active' => true,
                'rating_average' => 4.40,
                'rating_count' => 212,
                'published_at' => now(),
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'bonnet-satin-nuit'],
            [
                'category_id' => $accessoires->id,
                'name' => 'Bonnet satin nuit',
                'sku' => 'DPK-BON',
                'short_description' => 'Protège vos pièces pendant la nuit et limite les frisottis.',
                'description' => 'Bonnet en satin à taille unique ajustable.',
                'price' => 7500,
                'stock' => 3,
                'low_stock_threshold' => 5,
                'image' => null,
                'is_active' => true,
                'rating_average' => 4.70,
                'rating_count' => 96,
                'published_at' => now(),
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'soin-hydratant-boucles'],
            [
                'category_id' => $accessoires->id,
                'name' => 'Soin hydratant boucles 200 ml',
                'sku' => 'DPK-SOI',
                'short_description' => 'Redéfinit les boucles et prolonge la vie de vos pièces.',
                'description' => 'Soin hydratant destiné à l’entretien des cheveux.',
                'price' => 14500,
                'compare_at_price' => 18000,
                'stock' => 22,
                'low_stock_threshold' => 5,
                'image' => null,
                'is_active' => true,
                'rating_average' => 4.60,
                'rating_count' => 73,
                'published_at' => now(),
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'brosse-demelante-douce'],
            [
                'category_id' => $accessoires->id,
                'name' => 'Brosse démêlante douce',
                'sku' => 'DPK-BRO',
                'short_description' => 'Picots souples, démêle sans arracher les nœuds.',
                'description' => 'Brosse à picots souples pour cheveux humides ou secs.',
                'price' => 6200,
                'stock' => 0,
                'low_stock_threshold' => 5,
                'image' => null,
                'is_active' => true,
                'rating_average' => 4.30,
                'rating_count' => 34,
                'published_at' => now(),
            ]
        );
    }
}