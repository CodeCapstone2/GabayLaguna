<?php

namespace App\Services;

use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    /**
     * Send booking confirmation notification
     */
    public function sendBookingConfirmation(Booking $booking): bool
    {
        try {
            // Ensure relationships are loaded
            if (!$booking->relationLoaded('tourist')) {
                $booking->load('tourist');
            }
            if (!$booking->relationLoaded('tourGuide')) {
                $booking->load('tourGuide.user');
            }
            if (!$booking->relationLoaded('pointOfInterest')) {
                $booking->load('pointOfInterest');
            }

            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;
            $poi = $booking->pointOfInterest;

            // Validate required data
            if (!$tourist || !$tourist->email) {
                Log::error('Booking confirmation failed: Tourist or email missing', [
                    'booking_id' => $booking->id,
                    'tourist_id' => $booking->tourist_id,
                ]);
                return false;
            }

            if (!$guide || !$guide->email) {
                Log::error('Booking confirmation failed: Guide or email missing', [
                    'booking_id' => $booking->id,
                    'tour_guide_id' => $booking->tour_guide_id,
                ]);
                return false;
            }

            $touristEmailSent = false;
            $guideEmailSent = false;

            // Send email to tourist
            try {
                $touristEmailSent = $this->sendEmail(
                    $tourist->email,
                    'Booking Confirmation - Gabay Laguna',
                    'emails.booking.confirmation',
                    [
                        'booking' => $booking,
                        'tourist' => $tourist,
                        'guide' => $guide,
                        'poi' => $poi
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Failed to send booking confirmation to tourist', [
                    'booking_id' => $booking->id,
                    'tourist_email' => $tourist->email,
                    'error' => $e->getMessage()
                ]);
            }

            // Send email to guide
            try {
                $guideEmailSent = $this->sendEmail(
                    $guide->email,
                    'New Booking Request - Gabay Laguna',
                    'emails.booking.new-request',
                    [
                        'booking' => $booking,
                        'tourist' => $tourist,
                        'guide' => $guide,
                        'poi' => $poi
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Failed to send booking request notification to guide', [
                    'booking_id' => $booking->id,
                    'guide_email' => $guide->email,
                    'error' => $e->getMessage()
                ]);
            }

            // Send SMS notifications if configured
            if (config('services.sms.enabled', false)) {
                try {
                    if ($tourist->phone) {
                        $poiName = $poi ? $poi->name : 'the location';
                        $this->sendSMS(
                            $tourist->phone,
                            "Your booking with {$guide->name} for {$poiName} on {$booking->tour_date} has been confirmed. Booking ID: {$booking->id}"
                        );
                    }

                    if ($guide->phone) {
                        $poiName = $poi ? $poi->name : 'the location';
                        $this->sendSMS(
                            $guide->phone,
                            "You have a new booking request from {$tourist->name} for {$poiName} on {$booking->tour_date}. Please check your dashboard."
                        );
                    }
                } catch (\Exception $e) {
                    Log::warning('SMS notifications failed', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Return true if at least one email was sent successfully
            return $touristEmailSent || $guideEmailSent;

        } catch (\Exception $e) {
            Log::error('Booking confirmation notification failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Send booking status update notification
     */
    public function sendBookingStatusUpdate(Booking $booking, string $oldStatus, string $newStatus): bool
    {
        try {
            // Ensure relationships are loaded
            if (!$booking->relationLoaded('tourist')) {
                $booking->load('tourist');
            }
            if (!$booking->relationLoaded('tourGuide')) {
                $booking->load('tourGuide.user');
            }
            if (!$booking->relationLoaded('pointOfInterest')) {
                $booking->load('pointOfInterest');
            }
            if (!$booking->relationLoaded('payment')) {
                $booking->load('payment');
            }

            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;
            
            // Validate required data
            if (!$tourist || !$tourist->email) {
                Log::error('Booking status update failed: Tourist or email missing', [
                    'booking_id' => $booking->id,
                    'tourist_id' => $booking->tourist_id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ]);
                return false;
            }

            if (!$guide || !$guide->email) {
                Log::error('Booking status update failed: Guide or email missing', [
                    'booking_id' => $booking->id,
                    'tour_guide_id' => $booking->tour_guide_id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ]);
                return false;
            }
            
            $statusMessages = [
                'confirmed' => 'Your booking has been confirmed by the tour guide.',
                'cancelled' => 'Your booking has been cancelled.',
                'rejected' => 'Your booking request has been rejected by the tour guide.',
                'completed' => 'Your tour has been completed. Please leave a review!',
                'no_show' => 'The tour guide marked you as a no-show.',
            ];

            $message = $statusMessages[$newStatus] ?? "Your booking status has been updated to {$newStatus}.";

            // Determine email subjects based on status
            $touristSubjects = [
                'confirmed' => '✅ Booking Confirmed - Gabay Laguna',
                'cancelled' => '❌ Booking Cancelled - Gabay Laguna',
                'rejected' => '❌ Booking Request Rejected - Gabay Laguna',
                'completed' => '🎉 Tour Completed - Gabay Laguna',
            ];

            $touristSubject = $touristSubjects[$newStatus] ?? 'Booking Status Update - Gabay Laguna';

            $touristEmailSent = false;
            $guideEmailSent = false;

            // Send email to tourist
            try {
                $touristEmailSent = $this->sendEmail(
                    $tourist->email,
                    $touristSubject,
                    'emails.booking.status-update',
                    [
                        'booking' => $booking->load(['tourGuide.user', 'pointOfInterest', 'payment']),
                        'tourist' => $tourist,
                        'guide' => $guide,
                        'oldStatus' => $oldStatus,
                        'newStatus' => $newStatus,
                        'statusMessage' => $message,
                        'recipient' => 'tourist'
                    ]
                );
                
                if ($touristEmailSent) {
                    Log::info('Booking status update email sent to tourist', [
                        'booking_id' => $booking->id,
                        'tourist_email' => $tourist->email,
                        'status' => $newStatus,
                    ]);
                } else {
                    Log::warning('Booking status update email failed to send to tourist', [
                        'booking_id' => $booking->id,
                        'tourist_email' => $tourist->email,
                        'status' => $newStatus,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Exception sending booking status update to tourist', [
                    'booking_id' => $booking->id,
                    'tourist_email' => $tourist->email,
                    'status' => $newStatus,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send email to guide for all status updates
            $guideSubjects = [
                'confirmed' => '✅ Booking Confirmed - Gabay Laguna',
                'cancelled' => '❌ Booking Cancelled - Gabay Laguna',
                'rejected' => '❌ Booking Rejected - Gabay Laguna',
                'completed' => '🎉 Tour Completed - Gabay Laguna',
            ];

            $guideSubject = $guideSubjects[$newStatus] ?? 'Booking Status Update - Gabay Laguna';

            $guideMessages = [
                'confirmed' => "You have confirmed the booking request from {$tourist->name}. The tourist has been notified.",
                'rejected' => "You have rejected the booking request from {$tourist->name}. The tourist has been notified.",
                'cancelled' => "The booking from {$tourist->name} has been cancelled. " . 
                    ($booking->payment && $booking->payment->status === 'completed' 
                        ? 'If cancelled within 24 hours, a refund may have been processed.' 
                        : ''),
                'completed' => "The tour with {$tourist->name} has been marked as completed.",
            ];

            $guideMessage = $guideMessages[$newStatus] ?? "Booking status has been updated to {$newStatus}.";
            
            try {
                $guideEmailSent = $this->sendEmail(
                    $guide->email,
                    $guideSubject,
                    'emails.booking.status-update',
                    [
                        'booking' => $booking->load(['tourist', 'pointOfInterest', 'payment']),
                        'tourist' => $tourist,
                        'guide' => $guide,
                        'oldStatus' => $oldStatus,
                        'newStatus' => $newStatus,
                        'statusMessage' => $guideMessage,
                        'recipient' => 'guide'
                    ]
                );
                
                if ($guideEmailSent) {
                    Log::info('Booking status update email sent to guide', [
                        'booking_id' => $booking->id,
                        'guide_email' => $guide->email,
                        'status' => $newStatus,
                    ]);
                } else {
                    Log::warning('Booking status update email failed to send to guide', [
                        'booking_id' => $booking->id,
                        'guide_email' => $guide->email,
                        'status' => $newStatus,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Exception sending booking status update to guide', [
                    'booking_id' => $booking->id,
                    'guide_email' => $guide->email,
                    'status' => $newStatus,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send SMS if configured
            if (config('services.sms.enabled', false)) {
                try {
                    $this->sendSMS($tourist->phone, $message);
                } catch (\Exception $e) {
                    Log::warning('SMS notification failed for booking status update', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Return true if at least one email was sent successfully
            return $touristEmailSent || $guideEmailSent;

        } catch (\Exception $e) {
            Log::error('Booking status update notification failed', [
                'booking_id' => $booking->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send payment confirmation notification
     */
    public function sendPaymentConfirmation(Payment $payment): bool
    {
        try {
            // Ensure relationships are loaded
            if (!$payment->relationLoaded('booking')) {
                $payment->load('booking');
            }
            
            $booking = $payment->booking;
            
            // Load booking relationships
            if (!$booking->relationLoaded('tourist')) {
                $booking->load('tourist');
            }
            if (!$booking->relationLoaded('tourGuide')) {
                $booking->load('tourGuide.user');
            }
            if (!$booking->relationLoaded('pointOfInterest')) {
                $booking->load('pointOfInterest');
            }

            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;
            
            // Validate required data
            if (!$tourist || !$tourist->email) {
                Log::error('Payment confirmation failed: Tourist or email missing', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                    'tourist_id' => $booking->tourist_id,
                ]);
                return false;
            }

            if (!$guide || !$guide->email) {
                Log::error('Payment confirmation failed: Guide or email missing', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                    'tour_guide_id' => $booking->tour_guide_id,
                ]);
                return false;
            }

            // Send email to tourist
            $this->sendEmail(
                $tourist->email,
                'Payment Confirmation - Gabay Laguna',
                'emails.payment.confirmation',
                [
                    'payment' => $payment,
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide
                ]
            );

            // Send email to guide
            $this->sendEmail(
                $guide->email,
                'Payment Received - Gabay Laguna',
                'emails.payment.received',
                [
                    'payment' => $payment,
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide
                ]
            );

            // Send SMS if configured
            if (config('services.sms.enabled', false)) {
                $this->sendSMS(
                    $tourist->phone,
                    "Payment of PHP {$payment->amount} for booking #{$booking->id} has been confirmed. Thank you!"
                );

                $this->sendSMS(
                    $guide->phone,
                    "Payment of PHP {$payment->amount} has been received for booking #{$booking->id}."
                );
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Payment confirmation notification failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send refund notification
     */
    public function sendRefundNotification(Payment $payment, array $refundResult): bool
    {
        try {
            $booking = $payment->booking;
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;

            // Send email to tourist
            $this->sendEmail(
                $tourist->email,
                'Refund Processed - Gabay Laguna',
                'emails.payment.refund',
                [
                    'payment' => $payment,
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'refund_result' => $refundResult,
                    'refund_amount' => $payment->amount,
                    'refund_id' => $refundResult['refund_id'] ?? null,
                ]
            );

            // Send email to guide
            $this->sendEmail(
                $guide->email,
                'Booking Cancelled - Refund Issued - Gabay Laguna',
                'emails.payment.refund-guide',
                [
                    'payment' => $payment,
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'refund_result' => $refundResult,
                    'refund_amount' => $payment->amount,
                ]
            );

            // Send SMS if configured
            if (config('services.sms.enabled', false)) {
                $this->sendSMS(
                    $tourist->phone,
                    "Refund of PHP {$payment->amount} for booking #{$booking->id} has been processed. The amount will be credited back to your account within 5-7 business days."
                );

                $this->sendSMS(
                    $guide->phone,
                    "Booking #{$booking->id} from {$tourist->name} has been cancelled and a refund of PHP {$payment->amount} has been issued."
                );
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Refund notification failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send guide verification notification
     */
    public function sendGuideVerificationNotification(User $user, bool $isVerified): bool
    {
        try {
            $status = $isVerified ? 'approved' : 'rejected';
            $subject = "Guide Verification {$status} - Gabay Laguna";

            $this->sendEmail(
                $user->email,
                $subject,
                'emails.guide.verification',
                [
                    'user' => $user,
                    'isVerified' => $isVerified,
                    'status' => $status
                ]
            );

            if (config('services.sms.enabled', false)) {
                $message = $isVerified 
                    ? "Congratulations! Your tour guide application has been approved. You can now accept bookings."
                    : "Your tour guide application has been reviewed but not approved. Please check your email for details.";

                $this->sendSMS($user->phone, $message);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Guide verification notification failed', [
                'user_id' => $user->id,
                'is_verified' => $isVerified,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send reminder notifications
     */
    public function sendBookingReminders(): int
    {
        $sentCount = 0;
        
        try {
            // Send reminders for bookings happening tomorrow
            $tomorrowBookings = Booking::where('tour_date', now()->addDay()->toDateString())
                ->where('status', 'confirmed')
                ->with(['tourist', 'tourGuide.user', 'pointOfInterest'])
                ->get();

            foreach ($tomorrowBookings as $booking) {
                if ($this->sendBookingReminder($booking)) {
                    $sentCount++;
                }
            }

            // Send reminders for bookings happening in 1 hour
            $upcomingBookings = Booking::where('tour_date', now()->addHour()->toDateString())
                ->where('tour_time', '>=', now()->addHour()->format('H:i'))
                ->where('tour_time', '<=', now()->addHours(2)->format('H:i'))
                ->where('status', 'confirmed')
                ->with(['tourist', 'tourGuide.user', 'pointOfInterest'])
                ->get();

            foreach ($upcomingBookings as $booking) {
                if ($this->sendUpcomingBookingReminder($booking)) {
                    $sentCount++;
                }
            }

        } catch (\Exception $e) {
            Log::error('Booking reminders failed', [
                'error' => $e->getMessage()
            ]);
        }

        return $sentCount;
    }

    /**
     * Send booking reminder
     */
    protected function sendBookingReminder(Booking $booking): bool
    {
        try {
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;

            $this->sendEmail(
                $tourist->email,
                'Tour Reminder - Tomorrow - Gabay Laguna',
                'emails.booking.reminder',
                [
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'poi' => $booking->pointOfInterest
                ]
            );

            $this->sendEmail(
                $guide->email,
                'Tour Reminder - Tomorrow - Gabay Laguna',
                'emails.booking.guide-reminder',
                [
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'poi' => $booking->pointOfInterest
                ]
            );

            if (config('services.sms.enabled', false)) {
                $this->sendSMS(
                    $tourist->phone,
                    "Reminder: Your tour with {$guide->name} at {$booking->pointOfInterest->name} is tomorrow at {$booking->tour_time}."
                );

                $this->sendSMS(
                    $guide->phone,
                    "Reminder: You have a tour with {$tourist->name} at {$booking->pointOfInterest->name} tomorrow at {$booking->tour_time}."
                );
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Booking reminder failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send upcoming booking reminder
     */
    protected function sendUpcomingBookingReminder(Booking $booking): bool
    {
        try {
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;

            if (config('services.sms.enabled', false)) {
                $this->sendSMS(
                    $tourist->phone,
                    "Your tour with {$guide->name} starts in 1 hour. Please be ready!"
                );

                $this->sendSMS(
                    $guide->phone,
                    "Your tour with {$tourist->name} starts in 1 hour. Please be ready!"
                );
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Upcoming booking reminder failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send email notification
     */
    protected function sendEmail(string $to, string $subject, string $template, array $data): bool
    {
        try {
            // Check if email notifications are enabled
            if (!config('gabay-laguna.notifications.email.enabled', true)) {
                Log::info('Email notifications are disabled', [
                    'to' => $to,
                    'subject' => $subject
                ]);
                return false;
            }

            // Check if mail driver is configured (not just 'log' for production)
            $mailDriver = config('mail.default', 'log');
            $mailHost = config('mail.mailers.smtp.host', 'not configured');
            $mailUsername = config('mail.mailers.smtp.username', 'not configured');
            $mailFrom = config('mail.from.address', 'not configured');

            if ($mailDriver === 'log') {
                Log::warning('Mail driver is set to "log" - emails will not be sent, only logged to storage/logs/laravel.log', [
                    'to' => $to,
                    'subject' => $subject,
                    'driver' => $mailDriver,
                    'note' => 'Change MAIL_MAILER=smtp in .env and run php artisan config:clear'
                ]);
                return false;
            }

            // Log mail configuration for debugging (without sensitive data)
            Log::debug('Sending email', [
                'to' => $to,
                'subject' => $subject,
                'driver' => $mailDriver,
                'host' => $mailHost,
                'from' => $mailFrom,
                'template' => $template,
                'username_configured' => !empty($mailUsername) && $mailUsername !== 'not configured'
            ]);

            // Validate email address
            if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
                Log::error('Invalid email address provided', [
                    'to' => $to,
                    'subject' => $subject
                ]);
                return false;
            }

            // Validate from address
            if (empty($mailFrom) || $mailFrom === 'not configured' || !filter_var($mailFrom, FILTER_VALIDATE_EMAIL)) {
                Log::error('Invalid or missing MAIL_FROM_ADDRESS in configuration', [
                    'from' => $mailFrom,
                    'to' => $to,
                    'subject' => $subject,
                    'note' => 'Set MAIL_FROM_ADDRESS in .env file'
                ]);
                return false;
            }

            // Send the email
            Mail::send($template, $data, function ($message) use ($to, $subject, $mailFrom) {
                $message->to($to)
                        ->subject($subject)
                        ->from($mailFrom, config('mail.from.name', 'Gabay Laguna'));
            });

            Log::info('Email sent successfully', [
                'to' => $to,
                'subject' => $subject,
                'driver' => $mailDriver,
                'template' => $template,
                'from' => $mailFrom
            ]);
            return true;

        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'mail_driver' => config('mail.default', 'not set'),
                'mail_host' => config('mail.mailers.smtp.host', 'not set'),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Send SMS notification
     */
    protected function sendSMS(string $to, string $message): bool
    {
        try {
            $provider = config('services.sms.provider', 'twilio');

            if ($provider === 'twilio') {
                return $this->sendTwilioSMS($to, $message);
            }

            return false;

        } catch (\Exception $e) {
            Log::error('SMS sending failed', [
                'to' => $to,
                'message' => $message,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send SMS via Twilio
     */
    protected function sendTwilioSMS(string $to, string $message): bool
    {
        try {
            $accountSid = config('services.twilio.sid');
            $authToken = config('services.twilio.token');
            $fromNumber = config('services.twilio.from');

            $response = Http::withBasicAuth($accountSid, $authToken)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                    'From' => $fromNumber,
                    'To' => $to,
                    'Body' => $message
                ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Twilio SMS failed', [
                'to' => $to,
                'response' => $response->json()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('Twilio SMS error', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send booking confirmation to tourist only
     */
    public function sendBookingConfirmationToTourist(Booking $booking): bool
    {
        try {
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;
            
            // Send email to tourist
            return $this->sendEmail(
                $tourist->email,
                'Booking Confirmation - Gabay Laguna',
                'emails.booking.confirmation',
                [
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'poi' => $booking->pointOfInterest
                ]
            );

        } catch (\Exception $e) {
            Log::error('Booking confirmation to tourist failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send itinerary details to tourist
     */
    public function sendItineraryDetails(Booking $booking): bool
    {
        try {
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;
            
            if (!$booking->itinerary) {
                Log::warning('Attempted to send itinerary details for booking without itinerary', [
                    'booking_id' => $booking->id
                ]);
                return false;
            }

            return $this->sendEmail(
                $tourist->email,
                'Tour Itinerary Details - Gabay Laguna',
                'emails.booking.itinerary',
                [
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'itinerary' => $booking->itinerary,
                    'poi' => $booking->pointOfInterest
                ]
            );

        } catch (\Exception $e) {
            Log::error('Send itinerary details failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Request review from tourist
     */
    public function requestReview(Booking $booking): bool
    {
        try {
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;

            return $this->sendEmail(
                $tourist->email,
                'Share Your Experience - Gabay Laguna',
                'emails.booking.review-request',
                [
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'poi' => $booking->pointOfInterest
                ]
            );

        } catch (\Exception $e) {
            Log::error('Review request failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send real-time notification (for WebSocket/push notifications)
     */
    public function sendRealTimeNotification(User $user, string $type, array $data): bool
    {
        try {
            // This would integrate with WebSocket or push notification service
            // For now, we'll just log it
            Log::info('Real-time notification', [
                'user_id' => $user->id,
                'type' => $type,
                'data' => $data
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Real-time notification failed', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }
}

