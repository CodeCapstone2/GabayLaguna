<?php

namespace App\Http\Controllers;

use App\Models\TourGuide;
use App\Models\GuideAvailability;
use App\Models\GuideSpecialization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TourGuideController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $guides = TourGuide::verified()
            ->available()
            ->with(['user', 'categories', 'availabilities'])
            ->paginate(20);
        
        return response()->json([
            'tour_guides' => $guides
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $guide = TourGuide::with([
            'user', 
            'categories', 
            'availabilities', 
            'reviews.tourist'
        ])->findOrFail($id);
        
        return response()->json([
            'tour_guide' => $guide
        ]);
    }

    /**
     * Search tour guides
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'nullable|exists:categories,id',
            'city_id' => 'nullable|exists:cities,id',
            'min_rate' => 'nullable|numeric|min:0',
            'max_rate' => 'nullable|numeric|min:0',
            'languages' => 'nullable|string',
            'date' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = TourGuide::verified()->available()->with(['user', 'categories']);

        if ($request->category_id) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        if ($request->min_rate) {
            $query->where('hourly_rate', '>=', $request->min_rate);
        }

        if ($request->max_rate) {
            $query->where('hourly_rate', '<=', $request->max_rate);
        }

        if ($request->languages) {
            $query->where('languages', 'like', '%' . $request->languages . '%');
        }

        $guides = $query->paginate(20);

        return response()->json([
            'tour_guides' => $guides
        ]);
    }

    public function getAvailability(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $availabilities = $guide->availabilities()->get();

        return response()->json([
            'availabilities' => $availabilities
        ]);
    }

    /**
     * Set guide availability
     */
    public function setAvailability(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $availability = GuideAvailability::create([
            'tour_guide_id' => $guide->id,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        return response()->json([
            'message' => 'Availability set successfully',
            'availability' => $availability
        ], 201);
    }

    public function updateAvailability(Request $request, string $id)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $availability = GuideAvailability::where('tour_guide_id', $guide->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'day_of_week' => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $availability->update($request->all());

        return response()->json([
            'message' => 'Availability updated successfully',
            'availability' => $availability
        ]);
    }

    /**
     * Delete guide availability
     */
    public function deleteAvailability(Request $request, string $id)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $availability = GuideAvailability::where('tour_guide_id', $guide->id)
            ->findOrFail($id);

        $availability->delete();

        return response()->json([
            'message' => 'Availability deleted successfully'
        ]);
    }

    /**
     * Get guide specializations
     */
    public function getSpecializations(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $specializations = $guide->specializations()->with('category')->get();

        return response()->json([
            'specializations' => $specializations
        ]);
    }

    /**
     * Add guide specialization
     */
    public function addSpecialization(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if specialization already exists
        $exists = GuideSpecialization::where('tour_guide_id', $guide->id)
            ->where('category_id', $request->category_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Specialization already exists'
            ], 422);
        }

        $specialization = GuideSpecialization::create([
            'tour_guide_id' => $guide->id,
            'category_id' => $request->category_id,
        ]);

        return response()->json([
            'message' => 'Specialization added successfully',
            'specialization' => $specialization->load('category')
        ], 201);
    }

    /**
     * Remove guide specialization
     */
    public function removeSpecialization(Request $request, string $id)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $specialization = GuideSpecialization::where('tour_guide_id', $guide->id)
            ->findOrFail($id);

        $specialization->delete();

        return response()->json([
            'message' => 'Specialization removed successfully'
        ]);
    }
}
