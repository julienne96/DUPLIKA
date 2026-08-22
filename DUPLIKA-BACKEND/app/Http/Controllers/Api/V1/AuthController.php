<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        /*
         * Chaque nouvel utilisateur de la boutique
         * reçoit automatiquement le rôle Client.
         */
        $user->assignRole('Client');

        $token = $user
            ->createToken('duplika-api')
            ->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie.',

            'user' => $this->formatUser($user),

            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Connexion d'un utilisateur.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where(
            'email',
            $validated['email']
        )->first();

        if (
            !$user ||
            !Hash::check(
                $validated['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'Les identifiants fournis sont incorrects.',
                ],
            ]);
        }

        $token = $user
            ->createToken('duplika-api')
            ->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',

            'user' => $this->formatUser($user),

            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Déconnexion de l'utilisateur courant.
     */
    public function logout(Request $request): JsonResponse
    {
        $request
            ->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Retourne l'utilisateur connecté.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser(
                $request->user()
            ),
        ]);
    }

    /**
     * Mise à jour du profil utilisateur.
     */
    public function updateProfile(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $validated = $request->validate([
            'firstName' => [
                'required',
                'string',
                'max:80',
            ],

            'lastName' => [
                'required',
                'string',
                'max:80',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,' . $user->id,
            ],

            'phone' => [
                'required',
                'string',
                'max:32',
            ],
        ]);

        $user->update([
            'first_name' =>
                $validated['firstName'],

            'last_name' =>
                $validated['lastName'],

            'name' => trim(
                $validated['firstName']
                . ' '
                . $validated['lastName']
            ),

            'email' =>
                $validated['email'],

            'phone' =>
                $validated['phone'],
        ]);

        $user->refresh();

        return response()->json([
            'data' => $this->formatUser($user),
        ]);
    }

    /**
     * Format attendu par le frontend React.
     */
    private function formatUser(User $user): array
    {
        $nameParts = preg_split(
            '/\s+/',
            trim($user->name),
            2
        );

        return [
            'id' => (string) $user->id,

            'firstName' =>
                $user->first_name
                ?: ($nameParts[0] ?? ''),

            'lastName' =>
                $user->last_name
                ?: ($nameParts[1] ?? ''),

            'email' => $user->email,

            'phone' =>
                $user->phone ?? '',
        ];
    }
}