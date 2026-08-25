<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CinetPayService
{
    private string $baseUrl;
    private string $apiKey;
    private string $apiPassword;

    public function __construct()
    {
        $this->baseUrl = rtrim(
            (string) config('services.cinetpay.base_url'),
            '/'
        );

        $this->apiKey = (string)
            config('services.cinetpay.api_key');

        $this->apiPassword = (string)
            config('services.cinetpay.api_password');

        if (
            $this->baseUrl === '' ||
            $this->apiKey === '' ||
            $this->apiPassword === ''
        ) {
            throw new RuntimeException(
                'Configuration CinetPay incomplète.'
            );
        }
    }

    /**
     * Récupère un jeton OAuth CinetPay.
     */
    public function getAccessToken(): string
    {
        return Cache::remember(
            'cinetpay_access_token',
            now()->addHours(23),
            function (): string {

                $response = Http::acceptJson()
                    ->asJson()
                    ->timeout(30)
                    ->post(
                        $this->baseUrl . '/v1/oauth/login',
                        [
                            'api_key' => $this->apiKey,
                            'api_password' => $this->apiPassword,
                        ]
                    );

                /*
                 * TEMPORAIRE :
                 * on affiche le corps brut de la réponse CinetPay
                 * afin d'identifier précisément l'erreur HTTP 422.
                 *
                 * À retirer après résolution du problème.
                 */
                if ($response->failed()) {
                    throw new RuntimeException(
                        'CinetPay HTTP '
                        . $response->status()
                        . ' : '
                        . $response->body()
                    );
                }

                $data = $response->json();

                if (
                    ($data['status'] ?? null) !== 'OK' ||
                    empty($data['access_token'])
                ) {
                    throw new RuntimeException(
                        $data['message']
                            ?? 'CinetPay n’a pas retourné de jeton valide.'
                    );
                }

                return (string) $data['access_token'];
            }
        );
    }

    /**
     * Initialise un paiement CinetPay.
     */
    public function initializePayment(array $payload): array
    {
        $token = $this->getAccessToken();

        $response = Http::acceptJson()
            ->asJson()
            ->withToken($token)
            ->timeout(30)
            ->post(
                $this->baseUrl . '/v1/payment',
                $payload
            );

        if ($response->failed()) {
            throw new RuntimeException(
                'CinetPay HTTP '
                . $response->status()
                . ' : '
                . $response->body()
            );
        }

        $data = $response->json();

        if (
            ($data['status'] ?? null) !== 'OK'
        ) {
            throw new RuntimeException(
                $data['message']
                    ?? 'Initialisation CinetPay refusée.'
            );
        }

        return $data;
    }

    /**
     * Vérifie le statut canonique d'un paiement.
     */
    public function checkPayment(
        string $merchantTransactionId
    ): array {
        $token = $this->getAccessToken();

        $response = Http::acceptJson()
            ->withToken($token)
            ->timeout(30)
            ->get(
                $this->baseUrl
                . '/v1/payment/'
                . urlencode($merchantTransactionId)
            );

        if ($response->failed()) {
            throw new RuntimeException(
                'CinetPay HTTP '
                . $response->status()
                . ' : '
                . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Vide le jeton CinetPay du cache Laravel.
     */
    public function forgetAccessToken(): void
    {
        Cache::forget('cinetpay_access_token');
    }
}