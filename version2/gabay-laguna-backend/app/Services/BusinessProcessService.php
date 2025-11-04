<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Itinerary;
use App\Models\TourGuide;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BusinessProcessService
{
    /**
     * Complete business process workflow for itinerary-based booking
     */
    public function processItineraryBooking(array $bookingData, User $tourist): array
    {
        DB::beginTransaction();
        try {
            // Step 1: Validate itinerary and guide availability
            $validation = $this->validateItineraryBooking($bookingData);
            if (!$validation['valid']) {
                return $validation;
            }

            // Step 2: Create booking with itinerary
            $booking = $this->createItineraryBooking($bookingData, $tourist);

            // Step 3: Calculate pricing
            $pricing = $this->calculateItineraryPricing($booking);

            // Step 4: Send notifications
            $this->sendBookingNotifications($booking);

            // Step 5: Update guide availability
            $this->updateGuideAvailability($booking);

            DB::commit();

            return [
                'success' => true,
                'booking' => $booking->load(['itinerary.items', 'tourGuide', 'tourist']),
                'pricing' => $pricing,
                'message' => 'Booking created successfully'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Itinerary booking failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Booking failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Validate itinerary booking requirements
     */
    private function validateItineraryBooking(array $bookingData): array
    {
        // Check if itinerary exists and is active
        $itinerary = Itinerary::active()->find($bookingData['itinerary_id']);
        if (!$itinerary) {
            return [
                'valid' => false,
                'message' => 'Itinerary not found or inactive'
            ];
        }

        // Check if guide is available
        $guide = TourGuide::find($bookingData['tour_guide_id']);
        if (!$guide || !$guide->is_available) {
            return [
                'valid' => false,
                'message' => 'Guide not available'
            ];
        }

        // Check participant count
        if ($bookingData['number_of_people'] < $itinerary->min_participants || 
            $bookingData['number_of_people'] > $itinerary->max_participants) {
            return [
                'valid' => false,
                'message' => "Participant count must be between {$itinerary->min_participants} and {$itinerary->max_participants}"
            ];
        }

        // Check date availability
        $dayOfWeek = strtolower(date('l', strtotime($bookingData['tour_date'])));
        $availability = $guide->availabilities()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where('start_time', '<=', $bookingData['start_time'])
            ->where('end_time', '>=', $bookingData['end_time'])
            ->first();

        if (!$availability) {
            return [
                'valid' => false,
                'message' => 'Guide not available at requested time'
            ];
        }

        // Check for conflicts
        $conflict = Booking::where('tour_guide_id', $bookingData['tour_guide_id'])
            ->where('tour_date', $bookingData['tour_date'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($bookingData) {
                $query->whereBetween('start_time', [$bookingData['start_time'], $bookingData['end_time']])
                    ->orWhereBetween('end_time', [$bookingData['start_time'], $bookingData['end_time']])
                    ->orWhere(function ($q) use ($bookingData) {
                        $q->where('start_time', '<=', $bookingData['start_time'])
                            ->where('end_time', '>=', $bookingData['end_time']);
                    });
            })
            ->exists();

        if ($conflict) {
            return [
                'valid' => false,
                'message' => 'Guide has a booking conflict at requested time'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Create itinerary-based booking
     */
    private function createItineraryBooking(array $bookingData, User $tourist): Booking
    {
        $itinerary = Itinerary::find($bookingData['itinerary_id']);
        
        // Calculate total amount based on itinerary pricing
        $basePrice = $itinerary->base_price;
        $participantMultiplier = $bookingData['number_of_people'];
        $totalAmount = $basePrice * $participantMultiplier;

        return Booking::create([
            'tourist_id' => $tourist->id,
            'tour_guide_id' => $bookingData['tour_guide_id'],
            'itinerary_id' => $bookingData['itinerary_id'],
            'tour_date' => $bookingData['tour_date'],
            'start_time' => $bookingData['start_time'],
            'end_time' => $bookingData['end_time'],
            'duration_hours' => $itinerary->duration_hours,
            'number_of_people' => $bookingData['number_of_people'],
            'special_requests' => $bookingData['special_requests'] ?? null,
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'itinerary_customizations' => $bookingData['customizations'] ?? null,
        ]);
    }

    /**
     * Calculate pricing for itinerary booking
     */
    private function calculateItineraryPricing(Booking $booking): array
    {
        $itinerary = $booking->itinerary;
        $guide = $booking->tourGuide;

        $basePrice = $itinerary->base_price;
        $participantCount = $booking->number_of_people;
        $subtotal = $basePrice * $participantCount;

        // Calculate guide commission
        $commissionRate = $itinerary->guides()
            ->wherePivot('tour_guide_id', $guide->id)
            ->first()
            ->pivot
            ->commission_rate ?? 10.00;

        $guideCommission = $subtotal * ($commissionRate / 100);
        $platformFee = $subtotal * 0.05; // 5% platform fee
        $totalAmount = $subtotal + $platformFee;

        return [
            'base_price' => $basePrice,
            'participant_count' => $participantCount,
            'subtotal' => $subtotal,
            'platform_fee' => $platformFee,
            'guide_commission' => $guideCommission,
            'total_amount' => $totalAmount,
            'breakdown' => [
                'Base Price (per person)' => $basePrice,
                'Participants' => $participantCount,
                'Subtotal' => $subtotal,
                'Platform Fee (5%)' => $platformFee,
                'Total Amount' => $totalAmount
            ]
        ];
    }

    /**
     * Send booking notifications
     */
    private function sendBookingNotifications(Booking $booking): void
    {
        try {
            $notificationService = app(NotificationService::class);
            
            // Notify guide
            $notificationService->sendBookingConfirmation($booking);
            
            // Notify tourist
            $notificationService->sendBookingConfirmationToTourist($booking);
            
        } catch (\Exception $e) {
            Log::error('Failed to send booking notifications: ' . $e->getMessage());
        }
    }

    /**
     * Update guide availability after booking
     */
    private function updateGuideAvailability(Booking $booking): void
    {
        // This could be implemented to temporarily block guide availability
        // during the booked time slot
        // For now, we'll rely on the conflict checking in validation
    }

    /**
     * Process booking status updates
     */
    public function processBookingStatusUpdate(Booking $booking, string $newStatus): array
    {
        DB::beginTransaction();
        try {
            $oldStatus = $booking->status;
            $booking->update(['status' => $newStatus]);

            // Handle different status transitions
            switch ($newStatus) {
                case 'confirmed':
                    $this->handleBookingConfirmation($booking);
                    break;
                case 'completed':
                    $this->handleBookingCompletion($booking);
                    break;
                case 'cancelled':
                    $this->handleBookingCancellation($booking);
                    break;
            }

            // Send status update notifications
            $this->sendStatusUpdateNotifications($booking, $oldStatus, $newStatus);

            DB::commit();

            return [
                'success' => true,
                'booking' => $booking,
                'message' => "Booking status updated to {$newStatus}"
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Booking status update failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Status update failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Handle booking confirmation
     */
    private function handleBookingConfirmation(Booking $booking): void
    {
        // Update payment status if needed
        if ($booking->payment) {
            $booking->payment->update(['status' => 'confirmed']);
        }

        // Send confirmation details
        $this->sendItineraryDetails($booking);
    }

    /**
     * Handle booking completion
     */
    private function handleBookingCompletion(Booking $booking): void
    {
        // Process final payment
        if ($booking->payment && $booking->payment->status === 'pending') {
            $booking->payment->update(['status' => 'completed']);
        }

        // Trigger review request
        $this->requestReview($booking);
    }

    /**
     * Handle booking cancellation
     */
    private function handleBookingCancellation(Booking $booking): void
    {
        // Process refund if payment was made
        if ($booking->payment && $booking->payment->status === 'completed') {
            $this->processRefund($booking);
        }
    }

    /**
     * Send status update notifications
     */
    private function sendStatusUpdateNotifications(Booking $booking, string $oldStatus, string $newStatus): void
    {
        try {
            $notificationService = app(NotificationService::class);
            $notificationService->sendBookingStatusUpdate($booking, $oldStatus, $newStatus);
        } catch (\Exception $e) {
            Log::error('Failed to send status update notification: ' . $e->getMessage());
        }
    }

    /**
     * Send itinerary details to tourist
     */
    private function sendItineraryDetails(Booking $booking): void
    {
        try {
            $notificationService = app(NotificationService::class);
            $notificationService->sendItineraryDetails($booking);
        } catch (\Exception $e) {
            Log::error('Failed to send itinerary details: ' . $e->getMessage());
        }
    }

    /**
     * Request review from tourist
     */
    private function requestReview(Booking $booking): void
    {
        try {
            $notificationService = app(NotificationService::class);
            $notificationService->requestReview($booking);
        } catch (\Exception $e) {
            Log::error('Failed to request review: ' . $e->getMessage());
        }
    }

    /**
     * Process refund for cancelled booking
     */
    private function processRefund(Booking $booking): void
    {
        try {
            $paymentService = app(PaymentService::class);
            $paymentService->processRefund($booking->payment);
        } catch (\Exception $e) {
            Log::error('Failed to process refund: ' . $e->getMessage());
        }
    }
}



