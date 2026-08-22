<?php

namespace Database\Seeders;

use App\Models\Collection;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    /**
     * Insère les collections DUPLIKA.
     */
    public function run(): void
    {
        Collection::upsert(
            [
                [
                    'name' => 'Signature',
                    'slug' => 'signature',
                    'tagline' => 'Les pièces emblématiques DUPLIKA',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'name' => 'Bouclées',
                    'slug' => 'bouclees',
                    'tagline' => 'Volume et mouvement naturel',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 2,
                ],
                [
                    'name' => 'Lumière',
                    'slug' => 'lumiere',
                    'tagline' => 'Blonds et nuances éclaircies',
                    'image' => null,
                    'is_active' => true,
                    'sort_order' => 3,
                ],
            ],
            ['slug'],
            [
                'name',
                'tagline',
                'image',
                'is_active',
                'sort_order',
                'updated_at',
            ]
        );
    }
}