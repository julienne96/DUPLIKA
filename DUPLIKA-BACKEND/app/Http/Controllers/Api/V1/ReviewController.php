<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{

public function latest(): JsonResponse
{
    $reviews = Review::query()
        ->with([
            'user:id,name',
            'product:id,name,slug',
        ])
        ->where('status', 'approved')
        ->whereNotNull('comment')
        ->where('comment', '!=', '')
        ->latest('reviewed_at')
        ->limit(6)
        ->get();

    return response()->json([
        'data' => $reviews->map(function (Review $review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'reviewed_at' => optional($review->reviewed_at)?->toISOString(),

                'user' => [
                    'name' => $review->user?->name ?? 'Cliente DUPLIKA',
                ],

                'product' => [
                    'name' => $review->product?->name,
                    'slug' => $review->product?->slug,
                ],
            ];
        }),
    ]);
}
    public function index(Product $product): JsonResponse
    {
        $reviews = Review::query()
            ->with('user:id,name')
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->latest('reviewed_at')
            ->get();

        return response()->json([
            'data' => $reviews->map(function (Review $review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'reviewed_at' => optional($review->reviewed_at)?->toISOString(),
                    'user' => [
                        'name' => $review->user?->name ?? 'Cliente DUPLIKA',
                    ],
                ];
            }),
        ]);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1500'],
        ]);

        $user = $request->user();

        $existingReview = Review::query()
            ->where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($existingReview) {
            return response()->json([
                'message' => 'Vous avez déjà donné votre avis sur ce produit.',
            ], 422);
        }

        $order = Order::query()
            ->where('user_id', $user->id)
            ->where('status', 'payee')
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->latest('paid_at')
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Vous devez avoir acheté ce produit avant de pouvoir donner votre avis.',
            ], 403);
        }

        $review = DB::transaction(function () use (
            $validated,
            $user,
            $product,
            $order
        ) {
            $review = Review::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'order_id' => $order->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
                'status' => 'approved',
                'reviewed_at' => now(),
            ]);

            $this->refreshProductRating($product);

            return $review;
        });

        return response()->json([
            'message' => 'Votre avis a bien été publié.',
            'data' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'status' => $review->status,
                'reviewed_at' => $review->reviewed_at?->toISOString(),
            ],
        ], 201);
    }

    private function refreshProductRating(Product $product): void
    {
        $approvedReviews = Review::query()
            ->where('product_id', $product->id)
            ->where('status', 'approved');

        $count = $approvedReviews->count();

        $average = $count > 0
            ? round((float) $approvedReviews->avg('rating'), 2)
            : null;

        $product->update([
            'rating_average' => $average,
            'rating_count' => $count,
        ]);
    }
}