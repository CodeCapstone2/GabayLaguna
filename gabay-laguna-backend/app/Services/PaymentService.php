<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PaymentService
{
    protected $paypalConfig;
    protected $paymongoConfig;

    public function __construct()
    {
        $this->paypalConfig = [
            'client_id' => config('services.paypal.client_id'),
            'secret' => config('services.paypal.secret'),
            'mode' => config('services.paypal.mode', 'sandbox'),
            'base_url' => config('services.paypal.mode') === 'live' 
                ? 'https://api-m.paypal.com' 
                : 'https://api-m.sandbox.paypal.com'
        ];

        $this->paymongoConfig = [
            'secret_key' => config('services.paymongo.secret_key'),
            'public_key' => config('services.paymongo.public_key'),
            'base_url' => 'https://api.paymongo.com'
        ];
    }

    /**
     * Create PayPal payment
     */
    public function createPayPalPayment(Booking $booking): array
    {
        try {
            $accessToken = $this->getPayPalAccessToken();
            
            $payload = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => 'booking_' . $booking->id,
                        'amount' => [
                            'currency_code' => 'PHP',
                            'value' => number_format($booking->total_amount, 2, '.', '')
                        ],
                        'description' => "Tour Guide Booking - {$booking->tourGuide->user->name}",
                        'custom_id' => $booking->id
                    ]
                ],
                'application_context' => [
                    'return_url' => config('app.frontend_url') . '/payment/success',
                    'cancel_url' => config('app.frontend_url') . '/payment/cancel',
                    'brand_name' => 'Gabay Laguna',
                    'shipping_preference' => 'NO_SHIPPING'
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json'
            ])->post("{$this->paypalConfig['base_url']}/v2/checkout/orders", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                // Create payment record
                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'payment_method' => 'paypal',
                    'transaction_id' => $data['id'],
                    'amount' => $booking->total_amount,
                    'status' => 'pending',
                    'payment_details' => [
                        'paypal_order_id' => $data['id'],
                        'approval_url' => $data['links'][1]['href'] ?? null,
                        'method' => 'paypal'
                    ]
                ]);

                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'order_id' => $data['id'],
                    'approval_url' => $data['links'][1]['href'] ?? null,
                    'payment' => $payment
                ];
            }

            Log::error('PayPal payment creation failed', [
                'booking_id' => $booking->id,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create PayPal payment'
            ];

        } catch (\Exception $e) {
            Log::error('PayPal payment creation error', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Payment service error'
            ];
        }
    }

    /**
     * Capture PayPal payment
     */
    public function capturePayPalPayment(string $orderId): array
    {
        try {
            $accessToken = $this->getPayPalAccessToken();
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json'
            ])->post("{$this->paypalConfig['base_url']}/v2/checkout/orders/{$orderId}/capture");

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'COMPLETED') {
                    $payment = Payment::where('transaction_id', $orderId)->first();
                    
                    if ($payment) {
                        $payment->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                            'payment_details' => array_merge($payment->payment_details, [
                                'capture_id' => $data['purchase_units'][0]['payments']['captures'][0]['id'],
                                'capture_status' => $data['purchase_units'][0]['payments']['captures'][0]['status']
                            ])
                        ]);

                        // Update booking status
                        $payment->booking->update(['status' => 'confirmed']);

                        return [
                            'success' => true,
                            'payment' => $payment,
                            'booking' => $payment->booking
                        ];
                    }
                }
            }

            return [
                'success' => false,
                'error' => 'Payment capture failed'
            ];

        } catch (\Exception $e) {
            Log::error('PayPal payment capture error', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Payment capture error'
            ];
        }
    }

    /**
     * Create PayMongo payment intent
     */
    public function createPayMongoPaymentIntent(Booking $booking): array
    {
        try {
            $payload = [
                'data' => [
                    'attributes' => [
                        'amount' => (int)($booking->total_amount * 100), // Convert to centavos
                        'payment_method_allowed' => ['card', 'gcash', 'paymaya'],
                        'payment_method_options' => [
                            'card' => [
                                'request_three_d_secure' => 'automatic'
                            ]
                        ],
                        'currency' => 'PHP',
                        'description' => "Tour Guide Booking - {$booking->tourGuide->user->name}",
                        'metadata' => [
                            'booking_id' => $booking->id,
                            'tourist_id' => $booking->tourist_id,
                            'guide_id' => $booking->tour_guide_id
                        ]
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->paymongoConfig['secret_key'] . ':'),
                'Content-Type' => 'application/json'
            ])->post("{$this->paymongoConfig['base_url']}/v1/payment_intents", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                // Create payment record
                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'payment_method' => 'paymongo',
                    'transaction_id' => $data['data']['id'],
                    'amount' => $booking->total_amount,
                    'status' => 'pending',
                    'payment_details' => [
                        'payment_intent_id' => $data['data']['id'],
                        'client_key' => $data['data']['attributes']['client_key'],
                        'method' => 'paymongo'
                    ]
                ]);

                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'payment_intent_id' => $data['data']['id'],
                    'client_key' => $data['data']['attributes']['client_key'],
                    'payment' => $payment
                ];
            }

            Log::error('PayMongo payment intent creation failed', [
                'booking_id' => $booking->id,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create PayMongo payment intent'
            ];

        } catch (\Exception $e) {
            Log::error('PayMongo payment intent creation error', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Payment service error'
            ];
        }
    }

    /**
     * Process PayMongo webhook
     */
    public function processPayMongoWebhook(array $payload): bool
    {
        try {
            $event = $payload['data']['attributes'];
            $eventType = $payload['data']['type'];

            if ($eventType === 'payment.paid') {
                $paymentIntentId = $event['data']['attributes']['payment_intent']['id'];
                $payment = Payment::where('transaction_id', $paymentIntentId)->first();

                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'payment_details' => array_merge($payment->payment_details, [
                            'webhook_event' => $eventType,
                            'payment_method_details' => $event['data']['attributes']['payment_method_details'] ?? null
                        ])
                    ]);

                    // Update booking status
                    $payment->booking->update(['status' => 'confirmed']);

                    return true;
                }
            }

            return false;

        } catch (\Exception $e) {
            Log::error('PayMongo webhook processing error', [
                'payload' => $payload,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Refund payment
     */
    public function refundPayment(Payment $payment, float $amount = null): array
    {
        try {
            if ($payment->status !== 'completed') {
                return [
                    'success' => false,
                    'error' => 'Payment cannot be refunded'
                ];
            }

            $refundAmount = $amount ?? $payment->amount;

            if ($payment->payment_method === 'paypal') {
                return $this->refundPayPalPayment($payment, $refundAmount);
            } elseif ($payment->payment_method === 'paymongo') {
                return $this->refundPayMongoPayment($payment, $refundAmount);
            }

            return [
                'success' => false,
                'error' => 'Unsupported payment method for refund'
            ];

        } catch (\Exception $e) {
            Log::error('Payment refund error', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Refund processing error'
            ];
        }
    }

    /**
     * Get PayPal access token
     */
    protected function getPayPalAccessToken(): string
    {
        $cacheKey = 'paypal_access_token';
        
        return Cache::remember($cacheKey, 3500, function () {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->paypalConfig['client_id'] . ':' . $this->paypalConfig['secret']),
                'Content-Type' => 'application/x-www-form-urlencoded'
            ])->post("{$this->paypalConfig['base_url']}/v1/oauth2/token", [
                'grant_type' => 'client_credentials'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['access_token'];
            }

            throw new \Exception('Failed to get PayPal access token');
        });
    }

    /**
     * Refund PayPal payment
     */
    protected function refundPayPalPayment(Payment $payment, float $amount): array
    {
        $accessToken = $this->getPayPalAccessToken();
        $captureId = $payment->payment_details['capture_id'] ?? null;

        if (!$captureId) {
            return [
                'success' => false,
                'error' => 'Capture ID not found'
            ];
        }

        $payload = [
            'amount' => [
                'currency_code' => 'PHP',
                'value' => number_format($amount, 2, '.', '')
            ]
        ];

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$accessToken}",
            'Content-Type' => 'application/json'
        ])->post("{$this->paypalConfig['base_url']}/v2/payments/captures/{$captureId}/refund", $payload);

        if ($response->successful()) {
            $data = $response->json();
            
            $payment->update([
                'status' => 'refunded',
                'payment_details' => array_merge($payment->payment_details, [
                    'refund_id' => $data['id'],
                    'refund_status' => $data['status']
                ])
            ]);

            return [
                'success' => true,
                'refund_id' => $data['id'],
                'payment' => $payment
            ];
        }

        return [
            'success' => false,
            'error' => 'PayPal refund failed'
        ];
    }

    /**
     * Refund PayMongo payment
     */
    protected function refundPayMongoPayment(Payment $payment, float $amount): array
    {
        $payload = [
            'data' => [
                'attributes' => [
                    'amount' => (int)($amount * 100),
                    'reason' => 'requested_by_customer'
                ]
            ]
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->paymongoConfig['secret_key'] . ':'),
            'Content-Type' => 'application/json'
        ])->post("{$this->paymongoConfig['base_url']}/v1/payments/{$payment->transaction_id}/refunds", $payload);

        if ($response->successful()) {
            $data = $response->json();
            
            $payment->update([
                'status' => 'refunded',
                'payment_details' => array_merge($payment->payment_details, [
                    'refund_id' => $data['data']['id'],
                    'refund_status' => $data['data']['attributes']['status']
                ])
            ]);

            return [
                'success' => true,
                'refund_id' => $data['data']['id'],
                'payment' => $payment
            ];
        }

        return [
            'success' => false,
            'error' => 'PayMongo refund failed'
        ];
    }
}

