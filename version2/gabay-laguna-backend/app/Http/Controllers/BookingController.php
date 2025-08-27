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

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Booking cancelled successfully'
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
            'status' => 'required|in:confirmed,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking->load(['tourist', 'pointOfInterest.city'])
        ]);
    }
}
