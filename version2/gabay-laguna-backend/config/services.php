<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Services
    |--------------------------------------------------------------------------
    */

    'paypal' => [
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'secret' => env('PAYPAL_SECRET'),
        'mode' => env('PAYPAL_MODE', 'sandbox'), // sandbox or live
        'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
        'base_url' => env('PAYPAL_MODE') === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com',
    ],

    'paymongo' => [
        'secret_key' => env('PAYMONGO_SECRET_KEY'),
        'public_key' => env('PAYMONGO_PUBLIC_KEY'),
        'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
        'base_url' => 'https://api.paymongo.com',
    ],

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'public_key' => env('XENDIT_PUBLIC_KEY'),
        'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
        'base_url' => env('XENDIT_BASE_URL', 'https://api.xendit.co'),
        'mode' => env('XENDIT_MODE', 'sandbox'), // sandbox or live
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Services
    |--------------------------------------------------------------------------
    */

    'google' => [
        'maps_api_key' => env('GOOGLE_MAPS_API_KEY'),
        'geocoding_api_key' => env('GOOGLE_MAPS_GEOCODING_API_KEY'),
        'places_api_key' => env('GOOGLE_PLACES_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SMS Services
    |--------------------------------------------------------------------------
    */

    'sms' => [
        'enabled' => env('SMS_ENABLED', false),
        'provider' => env('SMS_PROVIDER', 'twilio'),
        'default_country_code' => env('SMS_DEFAULT_COUNTRY_CODE', '+63'),
    ],

    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'from' => env('TWILIO_FROM'),
        'verify_service_sid' => env('TWILIO_VERIFY_SERVICE_SID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | File Storage Services
    |--------------------------------------------------------------------------
    */

    'aws' => [
        'access_key_id' => env('AWS_ACCESS_KEY_ID'),
        'secret_access_key' => env('AWS_SECRET_ACCESS_KEY'),
        'default_region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'bucket' => env('AWS_BUCKET'),
        'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Social Login Services
    |--------------------------------------------------------------------------
    */

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Analytics Services
    |--------------------------------------------------------------------------
    */

    'analytics' => [
        'google_analytics_id' => env('GOOGLE_ANALYTICS_ID'),
        'facebook_pixel_id' => env('FACEBOOK_PIXEL_ID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Services
    |--------------------------------------------------------------------------
    */

    'pusher' => [
        'app_id' => env('PUSHER_APP_ID'),
        'app_key' => env('PUSHER_APP_KEY'),
        'app_secret' => env('PUSHER_APP_SECRET'),
        'host' => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER', 'mt1').'.pusherapp.com',
        'port' => env('PUSHER_PORT', 443),
        'scheme' => env('PUSHER_SCHEME', 'https'),
        'app_cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'host' => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER', 'mt1').'.pusherapp.com',
            'port' => env('PUSHER_PORT', 443),
            'scheme' => env('PUSHER_SCHEME', 'https'),
            'useTLS' => env('PUSHER_SCHEME', 'https') === 'https',
        ],
        'client_options' => [
            // Guzzle client options: https://docs.guzzlephp.org/en/stable/request-options.html
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Services
    |--------------------------------------------------------------------------
    */

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', \Illuminate\Support\Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        ],
        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Services
    |--------------------------------------------------------------------------
    */

    'sqs' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'prefix' => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
        'queue' => env('SQS_QUEUE', 'default'),
        'suffix' => env('SQS_SUFFIX'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'after_commit' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Search Services
    |--------------------------------------------------------------------------
    */

    'elasticsearch' => [
        'hosts' => [
            [
                'host' => env('ELASTICSEARCH_HOST', 'localhost'),
                'port' => env('ELASTICSEARCH_PORT', 9200),
                'scheme' => env('ELASTICSEARCH_SCHEME', 'http'),
                'user' => env('ELASTICSEARCH_USER'),
                'pass' => env('ELASTICSEARCH_PASS'),
            ],
        ],
        'index' => env('ELASTICSEARCH_INDEX', 'gabay_laguna'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Monitoring Services
    |--------------------------------------------------------------------------
    */

    'sentry' => [
        'dsn' => env('SENTRY_LARAVEL_DSN'),
        'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 1.0),
        'send_default_pii' => true,
    ],

    'bugsnag' => [
        'api_key' => env('BUGSNAG_API_KEY'),
        'notify_release_stages' => ['production'],
    ],

];
