<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Retourne la liste des produits actifs.
     */
    public function index(): JsonResponse
    {
        $baseUrl = request()->getSchemeAndHttpHost();

        $products = Product::with('category')
            ->where('is_active', true)
            ->latest()
            ->get()
            ->map(function (Product $product) use ($baseUrl) {
                return $this->formatProduct($product, $baseUrl);
            });

        return response()->json([
            'data' => $products,
        ]);
    }

    /**
     * Retourne un produit par son slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with('category')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Produit introuvable.',
            ], 404);
        }

        $baseUrl = request()->getSchemeAndHttpHost();

        return response()->json([
            'data' => $this->formatProduct($product, $baseUrl),
        ]);
    }

    /**
     * Formate un produit pour le frontend.
     */
    private function formatProduct(
        Product $product,
        string $baseUrl
    ): array {
        return [
            'id' => $product->id,

            'category_id' => $product->category_id,

            'category' => $product->category
                ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ]
                : null,

            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,

            'short_description' =>
                $product->short_description,

            'description' =>
                $product->description,

            'wig_type' =>
                $product->wig_type,

            'texture' =>
                $product->texture,

            'color' =>
                $product->color,

            'length' =>
                $product->length,

            'style' =>
                $product->style,

            'occasion' =>
                $product->occasion,

            'price' =>
                $product->price,

            'compare_at_price' =>
                $product->compare_at_price,

            'stock' =>
                $product->stock,

            'low_stock_threshold' =>
                $product->low_stock_threshold,

            /*
             * URL complète de l'image.
             */
            'image' => $product->image
                ? $baseUrl
                    . '/storage/'
                    . ltrim($product->image, '/')
                : null,

            'is_new' =>
                $product->is_new,

            'is_active' =>
                $product->is_active,

            'rating_average' =>
                $product->rating_average,

            'rating_count' =>
                $product->rating_count,

            'published_at' =>
                $product->published_at,

            'created_at' =>
                $product->created_at,

            'updated_at' =>
                $product->updated_at,
        ];
    }
}