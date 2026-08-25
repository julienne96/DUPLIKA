<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | Configuration des services externes utilisés par l'application.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | CinetPay
    |--------------------------------------------------------------------------
    |
    | Configuration de l'API CinetPay.
    | Les identifiants sensibles restent dans le fichier .env.
    |
    */

    'cinetpay' => [
    'api_key' => env('CINETPAY_API_KEY'),
    'api_password' => env('CINETPAY_API_PASSWORD'),

    'base_url' => env(
        'CINETPAY_BASE_URL',
        'https://api.cinetpay.net'
    ),

    'frontend_url' => env(
        'FRONTEND_URL',
        'http://localhost:5173'
    ),

    'backend_url' => env(
        'BACKEND_URL',
        'http://127.0.0.1:8000'
    ),
],

];