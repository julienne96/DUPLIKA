<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:190',
            ],
        ]);

        $subscriber = NewsletterSubscriber::where(
            'email',
            $validated['email']
        )->first();

        // L'adresse existe déjà.
        if ($subscriber) {

            // Elle avait été désinscrite : on la réactive.
            if ($subscriber->status === 'unsubscribed') {
                $subscriber->update([
                    'status' => 'active',
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                ]);

                return response()->json([
                    'message' => 'Votre inscription à la newsletter a été réactivée.',
                ]);
            }

            return response()->json([
                'message' => 'Cette adresse e-mail est déjà inscrite à la newsletter.',
            ]);
        }

        NewsletterSubscriber::create([
            'email' => $validated['email'],
            'status' => 'active',
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Votre inscription à la newsletter a bien été enregistrée.',
        ], 201);
    }
}