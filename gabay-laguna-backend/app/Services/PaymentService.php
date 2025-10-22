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
    protected $xenditConfig;

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

        $this->xenditConfig = [
            'secret_key' => config('services.xendit.secret_key'),
            'public_key' => config('services.xendit.public_key'),
            'webhook_token' => config('services.xendit.webhook_token'),
            'base_url' => config('services.xendit.base_url', 'https://api.xendit.co'),
            'mode' => config('services.xendit.mode', 'sandbox')
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
     * Create Xendit invoice
     */
    public function createXenditInvoice(Booking $booking): array
    {
        try {
            $payload = [
                'external_id' => 'booking_' . $booking->id . '_' . time(),
                'amount' => (int)$booking->total_amount,
                'description' => "Tour Guide Booking - {$booking->tourGuide->user->name}",
                'invoice_duration' => 86400, // 24 hours
                'customer' => [
                    'given_names' => $booking->tourist->first_name,
                    'surname' => $booking->tourist->last_name,
                    'email' => $booking->tourist->email,
                    'mobile_number' => $booking->tourist->phone_number ?? null,
                ],
                'customer_notification_preference' => [
                    'invoice_created' => ['email'],
                    'invoice_reminder' => ['email'],
                    'invoice_paid' => ['email'],
                ],
                'success_redirect_url' => config('app.frontend_url') . '/payment/success',
                'failure_redirect_url' => config('app.frontend_url') . '/payment/failed',
                'currency' => 'PHP',
                'items' => [
                    [
                        'name' => "Tour Guide Service - {$booking->tourGuide->user->name}",
                        'quantity' => 1,
                        'price' => (int)$booking->total_amount,
                        'category' => 'Tour Guide Service'
                    ]
                ],
                'fees' => [
                    [
                        'type' => 'ADMIN',
                        'value' => 0
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->xenditConfig['secret_key'] . ':'),
                'Content-Type' => 'application/json'
            ])->post("{$this->xenditConfig['base_url']}/v2/invoices", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                // Create payment record
                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'payment_method' => 'xendit',
                    'transaction_id' => $data['id'],
                    'amount' => $booking->total_amount,
                    'status' => 'pending',
                    'payment_details' => [
                        'invoice_id' => $data['id'],
                        'external_id' => $data['external_id'],
                        'invoice_url' => $data['invoice_url'],
                        'method' => 'xendit'
                    ]
                ]);

                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'invoice_id' => $data['id'],
                    'invoice_url' => $data['invoice_url'],
                    'payment' => $payment
                ];
            }

            Log::error('Xendit invoice creation failed', [
                'booking_id' => $booking->id,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create Xendit invoice'
            ];

        } catch (\Exception $e) {
            Log::error('Xendit invoice creation error', [
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
     * Create Xendit virtual account
     */
    public function createXenditVirtualAccount(Booking $booking, string $bankCode = 'BCA'): array
    {
        try {
            $payload = [
                'external_id' => 'booking_' . $booking->id . '_' . time(),
                'bank_code' => $bankCode,
                'name' => $booking->tourist->first_name . ' ' . $booking->tourist->last_name,
                'expected_amount' => (int)$booking->total_amount,
                'expiration_date' => now()->addDays(1)->toISOString(),
                'is_closed' => true,
                'is_single_use' => true,
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->xenditConfig['secret_key'] . ':'),
                'Content-Type' => 'application/json'
            ])->post("{$this->xenditConfig['base_url']}/virtual_accounts", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                // Create payment record
                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'payment_method' => 'xendit_va',
                    'transaction_id' => $data['id'],
                    'amount' => $booking->total_amount,
                    'status' => 'pending',
                    'payment_details' => [
                        'virtual_account_id' => $data['id'],
                        'external_id' => $data['external_id'],
                        'account_number' => $data['account_number'],
                        'bank_code' => $data['bank_code'],
                        'method' => 'xendit_va'
                    ]
                ]);

                return [
                    'success' => true,
                    'payment_id' => $payment->id,
                    'virtual_account_id' => $data['id'],
                    'account_number' => $data['account_number'],
                    'bank_code' => $data['bank_code'],
                    'payment' => $payment
                ];
            }

            Log::error('Xendit virtual account creation failed', [
                'booking_id' => $booking->id,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create Xendit virtual account'
            ];

        } catch (\Exception $e) {
            Log::error('Xendit virtual account creation error', [
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
     * Process Xendit webhook
     */
    public function processXenditWebhook(array $payload): bool
    {
        try {
            $event = $payload['event'];
            $data = $payload['data'];

            if ($event === 'invoice.paid') {
                $invoiceId = $data['id'];
                $payment = Payment::where('transaction_id', $invoiceId)->first();

                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'payment_details' => array_merge($payment->payment_details, [
                            'webhook_event' => $event,
                            'payment_method' => $data['payment_method'] ?? null,
                            'payment_channel' => $data['payment_channel'] ?? null,
                            'paid_amount' => $data['paid_amount'] ?? null
                        ])
                    ]);

                    // Update booking status
                    $payment->booking->update(['status' => 'confirmed']);

                    return true;
                }
            } elseif ($event === 'virtual_account.paid') {
                $virtualAccountId = $data['id'];
                $payment = Payment::where('transaction_id', $virtualAccountId)->first();

                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'payment_details' => array_merge($payment->payment_details, [
                            'webhook_event' => $event,
                            'payment_method' => 'bank_transfer',
                            'payment_channel' => $data['payment_channel'] ?? null,
                            'paid_amount' => $data['amount'] ?? null
                        ])
                    ]);

                    // Update booking status
                    $payment->booking->update(['status' => 'confirmed']);

                    return true;
                }
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Xendit webhook processing error', [
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
            } elseif (in_array($payment->payment_method, ['xendit', 'xendit_va'])) {
                return $this->refundXenditPayment($payment, $refundAmount);
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

    /**
     * Refund Xendit payment
     */
    protected function refundXenditPayment(Payment $payment, float $amount): array
    {
        $payload = [
            'amount' => (int)$amount,
            'reason' => 'requested_by_customer'
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->xenditConfig['secret_key'] . ':'),
            'Content-Type' => 'application/json'
        ])->post("{$this->xenditConfig['base_url']}/refunds", $payload);

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
            'error' => 'Xendit refund failed'
        ];
    }
}

