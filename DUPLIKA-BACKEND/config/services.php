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
'cinetpay' => [
    'api_key' => env('CINETPAY_API_KEY'),
    'site_id' => env('CINETPAY_SITE_ID'),
    'secret_key' => env('CINETPAY_SECRET_KEY'),
    'notify_url' => env('CINETPAY_NOTIFY_URL'),

    'mode' => env('CINETPAY_MODE', 'PRODUCTION'),
    'channels' => env('CINETPAY_CHANNELS', 'MOBILE_MONEY'),

    'close_after_response' => env(
        'CINETPAY_CLOSE_AFTER_RESPONSE',
        true
    ),

    'min_amount' => env('CINETPAY_MIN_AMOUNT', 150),
    'max_amount' => env('CINETPAY_MAX_AMOUNT', 1500000),

    'verification_url' => env(
        'CINETPAY_VERIFICATION_URL',
        'https://api-checkout.cinetpay.com/v2/payment/check'
    ),
],

];


