<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;

class CollectionController extends Controller
{
    /**
     * Retourne la liste des collections actives.
     */
    public function index(): JsonResponse
    {
        $baseUrl = request()->getSchemeAndHttpHost();

        $collections = Collection::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get([
                'id',
                'name',
                'slug',
                'tagline',
                'image',
            ])
            ->map(function (Collection $collection) use ($baseUrl) {
                return [
                    'id' => $collection->id,
                    'name' => $collection->name,
                    'slug' => $collection->slug,
                    'tagline' => $collection->tagline,

                    'image' => $collection->image
                        ? $baseUrl . '/storage/' . ltrim($collection->image, '/')
                        : null,
                ];
            });

        return response()->json([
            'data' => $collections,
        ]);
    }

    /**
     * Retourne une collection précise.
     */
    public function show(string $slug): JsonResponse
    {
        $collection = Collection::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $collection) {
            return response()->json([
                'message' => 'Collection introuvable.',
            ], 404);
        }

        $baseUrl = request()->getSchemeAndHttpHost();

        return response()->json([
            'data' => [
                'id' => $collection->id,
                'name' => $collection->name,
                'slug' => $collection->slug,
                'tagline' => $collection->tagline,

                'image' => $collection->image
                    ? $baseUrl . '/storage/' . ltrim($collection->image, '/')
                    : null,

                'is_active' => $collection->is_active,
                'sort_order' => $collection->sort_order,
            ],
        ]);
    }
}