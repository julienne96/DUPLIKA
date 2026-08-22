<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SmartMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SmartMatchController extends Controller
{
    public function recommend(
        Request $request,
        SmartMatchService $smartMatchService
    ): JsonResponse {
        $validated = $request->validate([
            'wig_type' => ['nullable', 'string', 'max:100'],
            'texture' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:100'],
            'length' => ['nullable', 'string', 'max:100'],
            'style' => ['nullable', 'string', 'max:100'],
            'occasion' => ['nullable', 'string', 'max:100'],
            'budget' => ['required', 'numeric', 'min:0'],
        ]);

        $products = $smartMatchService->recommend($validated);

        return response()->json([
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'sku' => $product->sku,
                    'price' => (float) $product->price,
                    'stock' => $product->stock,
                   'image' => $product->image
    ? request()->getSchemeAndHttpHost()
        . '/storage/'
        . ltrim($product->image, '/')
    : null,
                    'wig_type' => $product->wig_type,
                    'texture' => $product->texture,
                    'color' => $product->color,
                    'length' => $product->length,
                    'style' => $product->style,
                    'occasion' => $product->occasion,
                    'smartmatch_score' => $product->smartmatch_score,
                ];
            }),
        ]);
    }
}