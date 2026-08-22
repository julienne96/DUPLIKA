<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Insère les catégories DUPLIKA.
     */
    public function run(): void
    {
        Category::upsert(
            [
                [
                    'name' => 'Perruques lace',
                    'slug' => 'perruques-lace',
                    'description' => 'Lace frontal et closure, finitions invisibles et confort quotidien.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'name' => 'Perruques naturelles',
                    'slug' => 'perruques-naturelles',
                    'description' => 'Cheveux 100 % naturels, densité élevée et longévité maximale.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 2,
                ],
                [
                    'name' => 'Tissages & mèches',
                    'slug' => 'tissages',
                    'description' => 'Bundles et mèches à coudre pour composer votre coiffure sur mesure.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 3,
                ],
                [
                    'name' => 'Accessoires capillaires',
                    'slug' => 'accessoires',
                    'description' => 'Colles, bonnets, brosses et soins pour entretenir vos pièces.',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 4,
                ],
            ],
            ['slug'],
            [
                'name',
                'description',
                'image',
                'is_active',
                'sort_order',
                'updated_at',
            ]
        );
    }
}