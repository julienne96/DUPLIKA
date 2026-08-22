<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingSeeder extends Seeder
{
    public function run(): void
    {
        $lome = ShippingZone::updateOrCreate(
            ['slug' => 'lome'],
            [
                'name' => 'Lomé',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $lome->methods()->updateOrCreate(
            ['name' => 'Livraison à domicile'],
            [
                'price' => 200000,
                'delay' => '24 à 48 h',
                'free_above' => 15000000,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $togo = ShippingZone::updateOrCreate(
            ['slug' => 'togo'],
            [
                'name' => 'Autres villes du Togo',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $togo->methods()->updateOrCreate(
            ['name' => 'Transporteur partenaire'],
            [
                'price' => 350000,
                'delay' => '2 à 4 jours',
                'free_above' => null,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $international = ShippingZone::updateOrCreate(
            ['slug' => 'international'],
            [
                'name' => 'International',
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        $international->methods()->updateOrCreate(
            ['name' => 'Livraison internationale'],
            [
                'price' => 2500000,
                'delay' => '5 à 9 jours',
                'free_above' => null,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
    }
}