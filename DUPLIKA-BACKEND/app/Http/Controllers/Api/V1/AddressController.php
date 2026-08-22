<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->latest()
            ->get()
            ->map(function ($address) {
                return [
                    'id' => (string) $address->id,
                    'label' => $address->label,
                    'line1' => $address->line1,
                    'line2' => $address->line2,
                    'city' => $address->city,
                    'phone' => $address->phone,
                    'notes' => $address->notes,
                    'isDefault' => $address->is_default,
                ];
            });

        return response()->json([
            'data' => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => [
                'required',
                'string',
                'max:80',
            ],

            'line1' => [
                'required',
                'string',
                'max:255',
            ],

            'line2' => [
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'required',
                'string',
                'max:120',
            ],

            'phone' => [
                'required',
                'string',
                'max:50',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:500',
            ],

            'isDefault' => [
                'boolean',
            ],
        ]);

        if ($validated['isDefault'] ?? false) {
            $request->user()
                ->addresses()
                ->update([
                    'is_default' => false,
                ]);
        }

        $address = $request->user()
            ->addresses()
            ->create([
                'label' => $validated['label'],
                'line1' => $validated['line1'],
                'line2' => $validated['line2'] ?? null,
                'city' => $validated['city'],
                'phone' => $validated['phone'],
                'notes' => $validated['notes'] ?? null,
                'is_default' => $validated['isDefault'] ?? false,
            ]);

        return response()->json([
            'data' => [
                'id' => (string) $address->id,
                'label' => $address->label,
                'line1' => $address->line1,
                'line2' => $address->line2,
                'city' => $address->city,
                'phone' => $address->phone,
                'notes' => $address->notes,
                'isDefault' => $address->is_default,
            ],
        ], 201);
    }

    public function destroy(
        Request $request,
        string $id
    ): JsonResponse {
        $address = $request->user()
            ->addresses()
            ->findOrFail($id);

        $address->delete();

        return response()->json([
            'message' => 'Adresse supprimée avec succès.',
        ]);
    }
}