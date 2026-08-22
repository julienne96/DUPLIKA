<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    public function zones(): JsonResponse
    {
        $zones = ShippingZone::query()
            ->where('is_active', true)
            ->with([
                'methods' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('sort_order');
                }
            ])
            ->orderBy('sort_order')
            ->get()
            ->map(function ($zone) {
                return [
                    'id' => (string) $zone->id,
                    'name' => $zone->name,
                    'methods' => $zone->methods->map(function ($method) {
                        return [
                            'id' => (string) $method->id,
                            'name' => $method->name,
                            'price' => (int) $method->price,
                            'delay' => $method->delay ?? '',
                            'freeAbove' => $method->free_above !== null
                                ? (int) $method->free_above
                                : null,
                        ];
                    })->values(),
                ];
            });

        return response()->json([
            'data' => $zones,
        ]);
    }
}