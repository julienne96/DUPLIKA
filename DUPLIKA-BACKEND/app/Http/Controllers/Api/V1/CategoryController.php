<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Retourne la liste des catégories actives.
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->get([
                'id',
                'name',
                'slug',
                'description',
                'image',
            ]);

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Retourne une catégorie.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$category) {
            return response()->json([
                'message' => 'Catégorie introuvable.',
            ], 404);
        }

        return response()->json([
            'data' => $category,
        ]);
    }
}