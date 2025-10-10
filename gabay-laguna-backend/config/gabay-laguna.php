<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Gabay Laguna Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration settings specific to the Gabay Laguna
    | tour guide booking platform.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Platform Settings
    |--------------------------------------------------------------------------
    */
    'platform' => [
        'name' => 'Gabay Laguna',
        'version' => '1.0.0',
        'description' => 'Tour Guide Booking Platform for Laguna Province',
        'support_email' => 'support@gabaylaguna.com',
        'admin_email' => 'admin@gabaylaguna.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Configuration
    |--------------------------------------------------------------------------
    */
    'payments' => [
        'paypal' => [
            'enabled' => env('PAYPAL_ENABLED', true),
            'mode' => env('PAYPAL_MODE', 'sandbox'), // sandbox or live
            'client_id' => env('PAYPAL_CLIENT_ID'),
            'secret' => env('PAYPAL_SECRET'),
            'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
        ],
        'paymongo' => [
            'enabled' => env('PAYMONGO_ENABLED', true),
            'mode' => env('PAYMONGO_MODE', 'test'), // test or live
            'public_key' => env('PAYMONGO_PUBLIC_KEY'),
            'secret_key' => env('PAYMONGO_SECRET_KEY'),
            'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
        ],
        'currencies' => [
            'default' => 'PHP',
            'supported' => ['PHP', 'USD'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Maps Configuration
    |--------------------------------------------------------------------------
    */
    'google_maps' => [
        'enabled' => env('GOOGLE_MAPS_ENABLED', true),
        'api_key' => env('GOOGLE_MAPS_API_KEY'),
        'default_center' => [
            'lat' => 14.1751, // Laguna Province center
            'lng' => 121.2413,
        ],
        'default_zoom' => 10,
        'max_zoom' => 18,
        'min_zoom' => 8,
    ],

    /*
    |--------------------------------------------------------------------------
    | Booking Configuration
    |--------------------------------------------------------------------------
    */
    'booking' => [
        'max_duration_hours' => 24,
        'min_duration_hours' => 1,
        'max_people' => 50,
        'min_people' => 1,
        'advance_booking_days' => 365, // How many days in advance can book
        'cancellation_hours' => 24, // Hours before tour to allow cancellation
        'auto_confirm_hours' => 2, // Auto-confirm if guide doesn't respond
    ],

    /*
    |--------------------------------------------------------------------------
    | Tour Guide Configuration
    |--------------------------------------------------------------------------
    */
    'tour_guide' => [
        'min_experience_years' => 0,
        'max_experience_years' => 50,
        'min_hourly_rate' => 100, // PHP
        'max_hourly_rate' => 10000, // PHP
        'verification_required' => true,
        'auto_approval' => false,
        'max_specializations' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Review Configuration
    |--------------------------------------------------------------------------
    */
    'reviews' => [
        'min_rating' => 1,
        'max_rating' => 5,
        'auto_approve' => false,
        'moderation_required' => true,
        'min_comment_length' => 10,
        'max_comment_length' => 1000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Configuration
    |--------------------------------------------------------------------------
    */
    'notifications' => [
        'email' => [
            'enabled' => env('MAIL_ENABLED', true),
            'from_address' => env('MAIL_FROM_ADDRESS', 'noreply@gabaylaguna.com'),
            'from_name' => env('MAIL_FROM_NAME', 'Gabay Laguna'),
        ],
        'sms' => [
            'enabled' => env('SMS_ENABLED', false),
            'provider' => env('SMS_PROVIDER', 'twilio'),
        ],
        'push' => [
            'enabled' => env('PUSH_NOTIFICATIONS_ENABLED', false),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Configuration
    |--------------------------------------------------------------------------
    */
    'uploads' => [
        'profile_pictures' => [
            'disk' => 'public',
            'path' => 'profile-pictures',
            'max_size' => 5120, // 5MB
            'allowed_types' => ['jpg', 'jpeg', 'png', 'gif'],
        ],
        'poi_images' => [
            'disk' => 'public',
            'path' => 'poi-images',
            'max_size' => 10240, // 10MB
            'allowed_types' => ['jpg', 'jpeg', 'png', 'gif'],
        ],
        'city_images' => [
            'disk' => 'public',
            'path' => 'city-images',
            'max_size' => 10240, // 10MB
            'allowed_types' => ['jpg', 'jpeg', 'png', 'gif'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'enabled' => env('CACHE_ENABLED', true),
        'ttl' => [
            'cities' => 3600, // 1 hour
            'categories' => 3600, // 1 hour
            'pois' => 1800, // 30 minutes
            'guides' => 900, // 15 minutes
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    */
    'security' => [
        'rate_limiting' => [
            'enabled' => true,
            'max_attempts' => 60,
            'decay_minutes' => 1,
        ],
        'password_policy' => [
            'min_length' => 8,
            'require_uppercase' => true,
            'require_lowercase' => true,
            'require_numbers' => true,
            'require_symbols' => false,
        ],
        'session' => [
            'lifetime' => 120, // minutes
            'expire_on_close' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Development Configuration
    |--------------------------------------------------------------------------
    */
    'development' => [
        'debug_mode' => env('APP_DEBUG', false),
        'log_level' => env('LOG_LEVEL', 'info'),
        'maintenance_mode' => env('APP_MAINTENANCE', false),
        'seed_data' => env('SEED_DATA', false),
    ],
];

