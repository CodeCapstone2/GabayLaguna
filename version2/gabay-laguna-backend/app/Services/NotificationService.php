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
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;
            
            // Send email to tourist
            $this->sendEmail(
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

            // Send email to guide
            $this->sendEmail(
                $guide->email,
                'New Booking Request - Gabay Laguna',
                'emails.booking.new-request',
                [
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'poi' => $booking->pointOfInterest
                ]
            );

            // Send SMS notifications if configured
            if (config('services.sms.enabled', false)) {
                $this->sendSMS(
                    $tourist->phone,
                    "Your booking with {$guide->name} for {$booking->pointOfInterest->name} on {$booking->tour_date} has been confirmed. Booking ID: {$booking->id}"
                );

                $this->sendSMS(
                    $guide->phone,
                    "You have a new booking request from {$tourist->name} for {$booking->pointOfInterest->name} on {$booking->tour_date}. Please check your dashboard."
                );
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Booking confirmation notification failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
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
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;
            
            $statusMessages = [
                'confirmed' => 'Your booking has been confirmed by the tour guide.',
                'cancelled' => 'Your booking has been cancelled.',
                'completed' => 'Your tour has been completed. Please leave a review!',
                'no_show' => 'The tour guide marked you as a no-show.',
            ];

            $message = $statusMessages[$newStatus] ?? "Your booking status has been updated to {$newStatus}.";

            // Send email to tourist
            $this->sendEmail(
                $tourist->email,
                'Booking Status Update - Gabay Laguna',
                'emails.booking.status-update',
                [
                    'booking' => $booking,
                    'tourist' => $tourist,
                    'guide' => $guide,
                    'oldStatus' => $oldStatus,
                    'newStatus' => $newStatus,
                    'message' => $message
                ]
            );

            // Send SMS if configured
            if (config('services.sms.enabled', false)) {
                $this->sendSMS($tourist->phone, $message);
            }

            return true;

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
            $booking = $payment->booking;
            $tourist = $booking->tourist;
            $guide = $booking->tourGuide->user;

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
            if ($mailDriver === 'log') {
                Log::warning('Mail driver is set to "log" - emails will not be sent, only logged', [
                    'to' => $to,
                    'subject' => $subject,
                    'driver' => $mailDriver
                ]);
            }

            // Validate email address
            if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
                Log::error('Invalid email address provided', [
                    'to' => $to,
                    'subject' => $subject
                ]);
                return false;
            }

            // Send the email
            // Mail::send() doesn't return false on failure, it throws exceptions
            // So if we reach here without exception, the email was accepted for sending
            Mail::send($template, $data, function ($message) use ($to, $subject) {
                $message->to($to)
                        ->subject($subject)
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });

            Log::info('Email sent successfully', [
                'to' => $to,
                'subject' => $subject,
                'driver' => $mailDriver,
                'template' => $template
            ]);
            return true;

        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
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

