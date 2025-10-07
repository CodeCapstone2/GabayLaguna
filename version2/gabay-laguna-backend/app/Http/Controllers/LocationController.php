<?php

namespace App\Http\Controllers;

use App\Models\GuideLocation;
use App\Models\Booking;
use App\Models\TourGuide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    /**
     * Update guide's current location
     */
    public function updateLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'booking_id' => 'nullable|exists:bookings,id',
            'accuracy' => 'nullable|numeric|min:0',
            'speed' => 'nullable|numeric|min:0',
            'heading' => 'nullable|numeric|between:0,360',
            'address' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $guide = TourGuide::where('user_id', $user->id)->first();

        if (!$guide) {
            return response()->json([
                'message' => 'User is not a tour guide'
            ], 403);
        }

        // If booking_id is provided, verify the guide is assigned to this booking
        if ($request->booking_id) {
            $booking = Booking::where('id', $request->booking_id)
                ->where('tour_guide_id', $guide->id)
                ->whereIn('status', ['confirmed', 'in_progress'])
                ->first();

            if (!$booking) {
                return response()->json([
                    'message' => 'Booking not found or guide not assigned to this booking'
                ], 404);
            }
        }

        try {
            DB::beginTransaction();

            // Deactivate previous active locations for this guide
            GuideLocation::where('tour_guide_id', $guide->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            // Create new location record
            $location = GuideLocation::create([
                'tour_guide_id' => $guide->id,
                'booking_id' => $request->booking_id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'address' => $request->address,
                'accuracy' => $request->accuracy,
                'speed' => $request->speed,
                'heading' => $request->heading,
                'is_active' => true,
                'last_updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Location updated successfully',
                'location' => $location->load('tourGuide.user')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get guide's current location for a specific booking
     */
    public function getGuideLocation(Request $request, $bookingId)
    {
        $user = $request->user();
        
        // Check if user is the tourist for this booking
        $booking = Booking::where('id', $bookingId)
            ->where('tourist_id', $user->id)
            ->with(['tourGuide.user', 'guideLocation'])
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found or access denied'
            ], 404);
        }

        $location = $booking->guideLocation;

        if (!$location) {
            return response()->json([
                'message' => 'Guide location not available',
                'guide' => [
                    'id' => $booking->tourGuide->id,
                    'name' => $booking->tourGuide->user->name,
                    'phone' => $booking->tourGuide->user->phone,
                ]
            ], 404);
        }

        return response()->json([
            'location' => [
                'id' => $location->id,
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'address' => $location->address,
                'accuracy' => $location->accuracy,
                'speed' => $location->speed,
                'heading' => $location->heading,
                'last_updated_at' => $location->last_updated_at,
            ],
            'guide' => [
                'id' => $booking->tourGuide->id,
                'name' => $booking->tourGuide->user->name,
                'phone' => $booking->tourGuide->user->phone,
                'profile_picture' => $booking->tourGuide->user->profile_picture,
            ],
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,
                'tour_date' => $booking->tour_date,
                'start_time' => $booking->start_time,
                'end_time' => $booking->end_time,
            ]
        ], 200);
    }

    /**
     * Get guide's location history for a booking
     */
    public function getLocationHistory(Request $request, $bookingId)
    {
        $user = $request->user();
        
        // Check if user is the tourist for this booking
        $booking = Booking::where('id', $bookingId)
            ->where('tourist_id', $user->id)
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found or access denied'
            ], 404);
        }

        $locations = GuideLocation::where('booking_id', $bookingId)
            ->orderBy('last_updated_at', 'desc')
            ->limit(50) // Limit to last 50 location updates
            ->get();

        return response()->json([
            'locations' => $locations->map(function ($location) {
                return [
                    'id' => $location->id,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'address' => $location->address,
                    'accuracy' => $location->accuracy,
                    'speed' => $location->speed,
                    'heading' => $location->heading,
                    'last_updated_at' => $location->last_updated_at,
                ];
            })
        ], 200);
    }

    /**
     * Start location tracking for a booking
     */
    public function startTracking(Request $request, $bookingId)
    {
        $user = $request->user();
        $guide = TourGuide::where('user_id', $user->id)->first();

        if (!$guide) {
            return response()->json([
                'message' => 'User is not a tour guide'
            ], 403);
        }

        $booking = Booking::where('id', $bookingId)
            ->where('tour_guide_id', $guide->id)
            ->where('status', 'confirmed')
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found or not confirmed'
            ], 404);
        }

        // Update booking status to in_progress
        $booking->update(['status' => 'in_progress']);

        return response()->json([
            'message' => 'Location tracking started',
            'booking' => $booking
        ], 200);
    }

    /**
     * Stop location tracking for a booking
     */
    public function stopTracking(Request $request, $bookingId)
    {
        $user = $request->user();
        $guide = TourGuide::where('user_id', $user->id)->first();

        if (!$guide) {
            return response()->json([
                'message' => 'User is not a tour guide'
            ], 403);
        }

        $booking = Booking::where('id', $bookingId)
            ->where('tour_guide_id', $guide->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found or not in progress'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Deactivate all active locations for this booking
            GuideLocation::where('booking_id', $bookingId)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            // Update booking status to completed
            $booking->update(['status' => 'completed']);

            DB::commit();

            return response()->json([
                'message' => 'Location tracking stopped',
                'booking' => $booking
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to stop tracking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active bookings with location tracking for a guide
     */
    public function getActiveBookings(Request $request)
    {
        $user = $request->user();
        $guide = TourGuide::where('user_id', $user->id)->first();

        if (!$guide) {
            return response()->json([
                'message' => 'User is not a tour guide'
            ], 403);
        }

        $bookings = Booking::where('tour_guide_id', $guide->id)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->with(['tourist', 'pointOfInterest', 'guideLocation'])
            ->orderBy('tour_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'bookings' => $bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'tour_date' => $booking->tour_date,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'duration_hours' => $booking->duration_hours,
                    'number_of_people' => $booking->number_of_people,
                    'total_amount' => $booking->total_amount,
                    'special_requests' => $booking->special_requests,
                    'tourist' => [
                        'id' => $booking->tourist->id,
                        'name' => $booking->tourist->name,
                        'phone' => $booking->tourist->phone,
                        'email' => $booking->tourist->email,
                    ],
                    'point_of_interest' => $booking->pointOfInterest ? [
                        'id' => $booking->pointOfInterest->id,
                        'name' => $booking->pointOfInterest->name,
                        'address' => $booking->pointOfInterest->address,
                        'latitude' => $booking->pointOfInterest->latitude,
                        'longitude' => $booking->pointOfInterest->longitude,
                    ] : null,
                    'current_location' => $booking->guideLocation ? [
                        'latitude' => $booking->guideLocation->latitude,
                        'longitude' => $booking->guideLocation->longitude,
                        'address' => $booking->guideLocation->address,
                        'last_updated_at' => $booking->guideLocation->last_updated_at,
                    ] : null,
                ];
            })
        ], 200);
    }
}