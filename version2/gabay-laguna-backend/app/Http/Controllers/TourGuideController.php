<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\TourGuide;
use App\Models\PointOfInterest;
use App\Models\LocationApplication;
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
     * Update tour guide specific data
     */
    public function updateGuideData(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'bio' => 'nullable|string|max:1000',
            'license_number' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'languages' => 'nullable|string|max:255',
            'transportation_type' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Filter out empty values
        $dataToUpdate = array_filter($request->all(), function ($value) {
            return $value !== null && $value !== '';
        });

        $guide->update($dataToUpdate);

        return response()->json([
            'message' => 'Tour guide data updated successfully',
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

        return response()->json($availabilities);
    }

    /**
     * Get guide availability for public viewing (tourists)
     */
    public function getGuideAvailability($guideId)
    {
        $guide = TourGuide::findOrFail($guideId);
        
        $availabilities = $guide->availabilities()
            ->where('is_available', true)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'guide' => [
                'id' => $guide->id,
                'name' => $guide->user->name,
                'hourly_rate' => $guide->hourly_rate,
                'is_verified' => $guide->is_verified,
            ],
            'availabilities' => $availabilities->map(function ($availability) {
                return [
                    'day_of_week' => $availability->day_of_week,
                    'start_time' => $availability->start_time,
                    'end_time' => $availability->end_time,
                ];
            })
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
            'is_available' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if availability already exists for this time slot
        $existing = GuideAvailability::where('tour_guide_id', $guide->id)
            ->where('day_of_week', $request->day_of_week)
            ->where('start_time', $request->start_time)
            ->where('end_time', $request->end_time)
            ->first();

        if ($existing) {
            $existing->update(['is_available' => $request->is_available]);
            return response()->json([
                'message' => 'Availability updated successfully',
                'availability' => $existing
            ]);
        }

        $availability = GuideAvailability::create([
            'tour_guide_id' => $guide->id,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'is_available' => $request->is_available,
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

        return response()->json($specializations);
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

    public function getGuidesByPoi(Request $request, $poiId)
{
    $validator = Validator::make(['poi_id' => $poiId], [
        'poi_id' => 'required|exists:points_of_interest,id'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Get guides who have applied and been approved for this POI's city
    $poi = PointOfInterest::with('city')->findOrFail($poiId);
    
    $guides = TourGuide::verified()
        ->available()
        ->whereHas('locationApplications', function ($query) use ($poi) {
            $query->where('city_id', $poi->city_id)
                  ->where('status', 'approved')
                  ->where(function ($q) use ($poi) {
                      $q->where('poi_id', $poi->id)
                        ->orWhereNull('poi_id'); // Guides approved for the entire city
                  });
        })
        ->with(['user', 'categories', 'reviews'])
        ->get();

    return response()->json([
        'guides' => $guides,
        'poi' => $poi
    ]);
}

/**
 * Get guides available for a specific city
 */
    public function getGuidesByCity(Request $request, $cityId)
    {
        try {
            \Log::info('Fetching guides for city:', ['city_id' => $cityId]);
            
            // Validate city exists - use findOrFail for better error handling
            $city = City::find($cityId);
            if (!$city) {
                return response()->json([
                    'message' => 'City not found'
                ], 404);
            }

            // Get guides with approved applications for this city
            $guides = TourGuide::where('is_verified', true)
                ->where('is_available', true)
                ->whereHas('locationApplications', function ($query) use ($cityId) {
                    $query->where('city_id', $cityId)
                        ->where('status', 'approved');
                })
                ->with(['user', 'categories'])
                ->get();

            \Log::info('Found guides:', ['count' => $guides->count()]);

            return response()->json([
                'guides' => $guides,
                'count' => $guides->count(),
                'city' => $city
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in getGuidesByCity:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }

    }
}