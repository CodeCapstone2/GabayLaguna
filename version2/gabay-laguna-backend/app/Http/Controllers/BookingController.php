<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\TourGuide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tour_guide_id' => 'required|exists:tour_guides,id',
            'point_of_interest_id' => 'nullable|exists:points_of_interest,id',
            'tour_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'duration_hours' => 'required|integer|min:1|max:24',
            'number_of_people' => 'required|integer|min:1|max:50',
            'special_requests' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if tour guide is available
        $guide = TourGuide::findOrFail($request->tour_guide_id);
        
        if (!$guide->is_available) {
            return response()->json([
                'message' => 'Tour guide is not available'
            ], 422);
        }

        // Check if tour guide is available on the requested date and time
        $dayOfWeek = strtolower(date('l', strtotime($request->tour_date)));
        
        $availability = $guide->availabilities()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where('start_time', '<=', $request->start_time)
            ->where('end_time', '>=', $request->end_time)
            ->first();

        if (!$availability) {
            return response()->json([
                'message' => 'Tour guide is not available at the requested time'
            ], 422);
        }

        // Check for booking conflicts
        $conflict = Booking::where('tour_guide_id', $request->tour_guide_id)
            ->where('tour_date', $request->tour_date)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                    });
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Tour guide has a booking conflict at the requested time'
            ], 422);
        }

        // Calculate total amount
        $totalAmount = $guide->hourly_rate * $request->duration_hours;

        $booking = Booking::create([
            'tourist_id' => $request->user()->id,
            'tour_guide_id' => $request->tour_guide_id,
            'point_of_interest_id' => $request->point_of_interest_id,
            'tour_date' => $request->tour_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_hours' => $request->duration_hours,
            'number_of_people' => $request->number_of_people,
            'special_requests' => $request->special_requests,
            'total_amount' => $totalAmount,
        ]);

        // Load relationships needed for email notification
        $booking->load(['tourist', 'tourGuide.user', 'pointOfInterest']);

        // Send email notifications to both tourist and guide
        try {
            $notificationService = app(\App\Services\NotificationService::class);
            $emailSent = $notificationService->sendBookingConfirmation($booking);
            
            if ($emailSent) {
                \Log::info('Booking confirmation emails sent successfully', [
                    'booking_id' => $booking->id,
                    'tourist_email' => $booking->tourist->email,
                    'guide_email' => $booking->tourGuide->user->email,
                ]);
            } else {
                \Log::warning('Booking confirmation emails failed to send', [
                    'booking_id' => $booking->id,
                    'tourist_email' => $booking->tourist->email ?? 'N/A',
                    'guide_email' => $booking->tourGuide->user->email ?? 'N/A',
                ]);
            }
        } catch (\Exception $e) {
            // Log detailed error but don't fail booking creation
            \Log::error('Booking created but email notification failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'tourist_email' => $booking->tourist->email ?? 'N/A',
                'guide_email' => $booking->tourGuide->user->email ?? 'N/A',
            ]);
        }

        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking->load(['tourGuide.user', 'pointOfInterest'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $booking = Booking::with([
            'tourGuide.user', 
            'pointOfInterest.city',
            'payment',
            'review'
        ])->findOrFail($id);

        // Check if user owns this booking or is the tour guide
        if ($booking->tourist_id !== auth()->id() && $booking->tour_guide_id !== auth()->user()->tourGuide?->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'booking' => $booking
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $booking = Booking::where('tourist_id', auth()->id())->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot update confirmed or completed booking'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'tour_date' => 'sometimes|date|after:today',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'duration_hours' => 'sometimes|integer|min:1|max:24',
            'number_of_people' => 'sometimes|integer|min:1|max:50',
            'special_requests' => 'sometimes|nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking->update($request->all());

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking->load(['tourGuide.user', 'pointOfInterest'])
        ]);
    }

    /**
     * Cancel booking
     */
    public function cancel(string $id)
    {
        $booking = Booking::where('tourist_id', auth()->id())->findOrFail($id);

        if ($booking->status !== 'pending' && $booking->status !== 'confirmed') {
            return response()->json([
                'message' => 'Cannot cancel this booking'
            ], 422);
        }

        $oldStatus = $booking->status;
        
        // Load relationships needed for notifications
        $booking->load(['tourist', 'tourGuide.user', 'pointOfInterest', 'payment']);
        
        $booking->update(['status' => 'cancelled']);

        // Check if cancellation is within 24 hours of booking creation
        $bookingCreatedAt = $booking->created_at;
        $hoursSinceBooking = now()->diffInHours($bookingCreatedAt);
        $isWithin24Hours = $hoursSinceBooking <= 24;

        $refundProcessed = false;
        $refundMessage = '';

        // Process refund if within 24 hours and payment exists
        if ($isWithin24Hours && $booking->payment && $booking->payment->status === 'completed') {
            try {
                $paymentService = app(\App\Services\PaymentService::class);
                $refundResult = $paymentService->refundPayment($booking->payment);

                if ($refundResult['success']) {
                    $refundProcessed = true;
                    $refundMessage = 'Your payment has been refunded successfully.';

                    // Send refund notification
                    try {
                        app(\App\Services\NotificationService::class)->sendRefundNotification($booking->payment, $refundResult);
                    } catch (\Exception $e) {
                        \Log::warning('Refund processed but notification failed', [
                            'payment_id' => $booking->payment->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                } else {
                    $refundMessage = 'Refund could not be processed automatically. Please contact support.';
                    \Log::error('Refund processing failed', [
                        'payment_id' => $booking->payment->id,
                        'error' => $refundResult['error'] ?? 'Unknown error',
                    ]);
                }
            } catch (\Exception $e) {
                $refundMessage = 'Refund could not be processed automatically. Please contact support.';
                \Log::error('Refund processing exception', [
                    'payment_id' => $booking->payment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        } elseif ($booking->payment && $booking->payment->status === 'completed') {
            // Payment exists but outside 24-hour window
            $refundMessage = 'Cancellation is outside the 24-hour refund window. No refund will be issued.';
        }

        // Send notification about cancellation to both tourist and guide
        try {
            app(\App\Services\NotificationService::class)->sendBookingStatusUpdate($booking, $oldStatus, 'cancelled');
        } catch (\Exception $e) {
            \Log::warning('Booking cancelled but notification failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }

        $responseMessage = 'Booking cancelled successfully.';
        if ($refundMessage) {
            $responseMessage .= ' ' . $refundMessage;
        }

        return response()->json([
            'message' => $responseMessage,
            'refund_processed' => $refundProcessed,
            'refund_message' => $refundMessage,
            'cancelled_within_24_hours' => $isWithin24Hours,
        ]);
    }

    /**
     * Get tourist bookings
     */
    public function touristBookings(Request $request)
    {
        $bookings = Booking::where('tourist_id', auth()->id())
            ->with(['tourGuide.user', 'pointOfInterest.city'])
            ->orderBy('tour_date', 'desc')
            ->paginate(20);

        return response()->json([
            'bookings' => $bookings
        ]);
    }

    /**
     * Get guide bookings
     */
    public function guideBookings(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $bookings = Booking::where('tour_guide_id', $guide->id)
            ->with(['tourist', 'pointOfInterest.city'])
            ->orderBy('tour_date', 'desc')
            ->paginate(20);

        return response()->json([
            'bookings' => $bookings
        ]);
    }

    /**
     * Update booking status (for guides)
     */
    public function updateStatus(Request $request, string $id)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $booking = Booking::where('tour_guide_id', $guide->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,completed,cancelled,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if guide is trying to confirm the booking
        if ($request->status === 'confirmed') {
            // Load payment relationship
            $booking->load('payment');
            
            // Check if payment exists
            if (!$booking->payment) {
                return response()->json([
                    'message' => 'Cannot confirm booking. Payment has not been made yet.',
                    'error' => 'payment_required'
                ], 422);
            }

            // Check if payment is completed
            if ($booking->payment->status !== 'completed') {
                return response()->json([
                    'message' => 'Cannot confirm booking. Payment is not completed yet. Current payment status: ' . $booking->payment->status,
                    'error' => 'payment_not_completed',
                    'payment_status' => $booking->payment->status
                ], 422);
            }
        }

        $oldStatus = $booking->status;
        
        // Load relationships needed for notifications
        $booking->load(['tourist', 'tourGuide.user', 'pointOfInterest', 'payment']);
        
        $booking->update(['status' => $request->status]);

        // Send notification about status update to both tourist and guide
        try {
            app(\App\Services\NotificationService::class)->sendBookingStatusUpdate($booking, $oldStatus, $request->status);
        } catch (\Exception $e) {
            \Log::warning('Booking status updated but notification failed', [
                'booking_id' => $booking->id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking->load(['tourist', 'pointOfInterest.city'])
        ]);
    }
}
