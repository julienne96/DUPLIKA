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

        Product::create([
            'category_id' => $lace->id,
            'name' => 'Éclat — Lace frontale lisse',
            'slug' => 'perruque-lace-noir-lisse-eclat',
            'sku' => 'DPK-ECL',
            'short_description' => 'Lisse profond, lace HD invisible, densité 180 %.',
            'description' => 'Perruque lace frontale en cheveux naturels Remy.',
            'price' => 12500000,
            'stock' => 12,
            'low_stock_threshold' => 3,
            'image' => null,
            'is_new' => true,
            'is_active' => true,
            'rating_average' => 4.80,
            'rating_count' => 126,
            'published_at' => now(),
        ]);

        Product::create([
            'category_id' => $naturelles->id,
            'name' => 'Ambre — Bouclée volume',
            'slug' => 'perruque-bouclee-ambre',
            'sku' => 'DPK-AMB',
            'short_description' => 'Boucles rebondies châtain cuivré, effet volume immédiat.',
            'description' => 'Perruque bouclée en cheveux naturels.',
            'price' => 9800000,
            'compare_at_price' => 12500000,
            'stock' => 5,
            'low_stock_threshold' => 3,
            'image' => null,
            'is_new' => false,
            'is_active' => true,
            'rating_average' => 4.60,
            'rating_count' => 84,
            'published_at' => now(),
        ]);

        Product::create([
            'category_id' => $lace->id,
            'name' => 'Solstice — Blond miel ondulé',
            'slug' => 'perruque-blonde-solstice',
            'sku' => 'DPK-SOL',
            'short_description' => 'Ondulations souples, blond miel travaillé en dégradé.',
            'description' => 'Perruque ondulée blond miel en cheveux naturels.',
            'price' => 14200000,
            'stock' => 3,
            'low_stock_threshold' => 3,
            'image' => null,
            'is_new' => true,
            'is_active' => true,
            'rating_average' => 4.90,
            'rating_count' => 41,
            'published_at' => now(),
        ]);

        Product::create([
            'category_id' => $tissages->id,
            'name' => 'Onde Douce — Tissage 3 bundles',
            'slug' => 'tissage-naturel-onde-douce',
            'sku' => 'DPK-OND',
            'short_description' => 'Trois bundles assortis pour une pose sur mesure.',
            'description' => 'Tissage en cheveux naturels, trois bundles.',
            'price' => 6500000,
            'stock' => 14,
            'low_stock_threshold' => 3,
            'image' => null,
            'is_new' => false,
            'is_active' => true,
            'rating_average' => 4.50,
            'rating_count' => 58,
            'published_at' => now(),
        ]);

        Product::create([
            'category_id' => $accessoires->id,
            'name' => 'Colle lace tenue longue 38 ml',
            'slug' => 'colle-lace-tenue-longue',
            'sku' => 'DPK-COL',
            'short_description' => 'Tenue jusqu’à 4 semaines, sans latex, waterproof.',
            'description' => 'Colle spécialement destinée aux poses de lace.',
            'price' => 1200000,
            'stock' => 40,
            'low_stock_threshold' => 5,
            'image' => null,
            'is_active' => true,
            'rating_average' => 4.40,
            'rating_count' => 212,
            'published_at' => now(),
        ]);

        Product::create([
            'category_id' => $accessoires->id,
            'name' => 'Bonnet satin nuit',
            'slug' => 'bonnet-satin-nuit',
            'sku' => 'DPK-BON',
            'short_description' => 'Protège vos pièces pendant la nuit et limite les frisottis.',
            'description' => 'Bonnet en satin à taille unique ajustable.',
            'price' => 750000,
            'stock' => 3,
            'low_stock_threshold' => 5,
            'image' => null,
            'is_active' => true,
            'rating_average' => 4.70,
            'rating_count' => 96,
            'published_at' => now(),
        ]);

        Product::create([
            'category_id' => $accessoires->id,
            'name' => 'Soin hydratant boucles 200 ml',
            'slug' => 'soin-hydratant-boucles',
            'sku' => 'DPK-SOI',
            'short_description' => 'Redéfinit les boucles et prolonge la vie de vos pièces.',
            'description' => 'Soin hydratant destiné à l’entretien des cheveux.',
            'price' => 1450000,
            'compare_at_price' => 1800000,
            'stock' => 22,
            'low_stock_threshold' => 5,
            'image' => null,
            'is_active' => true,
            'rating_average' => 4.60,
            'rating_count' => 73,
            'published_at' => now(),
        ]);

        Product::create([
            'category_id' => $accessoires->id,
            'name' => 'Brosse démêlante douce',
            'slug' => 'brosse-demelante-douce',
            'sku' => 'DPK-BRO',
            'short_description' => 'Picots souples, démêle sans arracher les nœuds.',
            'description' => 'Brosse à picots souples pour cheveux humides ou secs.',
            'price' => 620000,
            'stock' => 0,
            'low_stock_threshold' => 5,
            'image' => null,
            'is_active' => true,
            'rating_average' => 4.30,
            'rating_count' => 34,
            'published_at' => now(),
        ]);
    }
}