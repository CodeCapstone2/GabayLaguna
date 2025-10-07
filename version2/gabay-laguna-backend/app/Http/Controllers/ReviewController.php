<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tour_guide_id' => 'required|exists:tour_guides,id',
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user owns the booking
        $booking = Booking::where('tourist_id', auth()->id())
            ->where('id', $request->booking_id)
            ->where('tour_guide_id', $request->tour_guide_id)
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Invalid booking for review'
            ], 422);
        }

        if ($booking->status !== 'completed') {
            return response()->json([
                'message' => 'Can only review completed bookings'
            ], 422);
        }

        // Check if review already exists
        $existingReview = Review::where('tourist_id', auth()->id())
            ->where('booking_id', $request->booking_id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Review already exists for this booking'
            ], 422);
        }

        $review = Review::create([
            'tourist_id' => auth()->id(),
            'tour_guide_id' => $request->tour_guide_id,
            'booking_id' => $request->booking_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Notify guide about new review
        try {
            $guideUser = $review->tourGuide->user;
            app(\App\Services\NotificationService::class)->sendRealTimeNotification(
                $guideUser,
                'new_review',
                [
                    'review_id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                ]
            );
        } catch (\Exception $e) {
            \Log::warning('Review created but notification failed', [
                'review_id' => $review->id,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review->load(['tourist', 'tourGuide.user'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $review = Review::with(['tourist', 'tourGuide.user', 'booking'])->findOrFail($id);

        return response()->json([
            'review' => $review
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $review = Review::where('tourist_id', auth()->id())->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|integer|between:1,5',
            'comment' => 'sometimes|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update($request->all());

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->load(['tourist', 'tourGuide.user'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $review = Review::where('tourist_id', auth()->id())->findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Get tourist reviews
     */
    public function touristReviews(Request $request)
    {
        $reviews = Review::where('tourist_id', auth()->id())
            ->with(['tourGuide.user', 'booking.pointOfInterest.city'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'reviews' => $reviews
        ]);
    }

    /**
     * Get guide reviews
     */
    public function guideReviews(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $reviews = Review::where('tour_guide_id', $guide->id)
            ->with(['tourist', 'booking.pointOfInterest.city'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'reviews' => $reviews
        ]);
    }

    /**
     * Get reviews for a specific tour guide (public)
     */
    public function getGuideReviews(string $guideId)
    {
        $reviews = Review::where('tour_guide_id', $guideId)
            ->verified()
            ->with(['tourist'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'reviews' => $reviews
        ]);
    }
}
