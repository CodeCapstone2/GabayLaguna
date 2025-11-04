<?php

namespace App\Http\Controllers;

use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\PointOfInterest;
use App\Models\TourGuide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ItineraryController extends Controller
{
    /**
     * Display a listing of itineraries
     */
    public function index(Request $request)
    {
        $query = Itinerary::active()->with(['items', 'guides']);

        // Filter by duration type
        if ($request->has('duration_type')) {
            $query->where('duration_type', $request->duration_type);
        }

        // Filter by difficulty level
        if ($request->has('difficulty')) {
            $query->where('difficulty_level', $request->difficulty);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Filter by city (through POIs)
        if ($request->has('city_id')) {
            $query->whereHas('items.pointOfInterest', function ($q) use ($request) {
                $q->where('city_id', $request->city_id);
            });
        }

        // Search by title or description
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $itineraries = $query->paginate(20);

        return response()->json([
            'itineraries' => $itineraries
        ]);
    }

    /**
     * Store a newly created itinerary
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration_type' => 'required|in:half_day,full_day,multi_day',
            'duration_days' => 'required|integer|min:1|max:30',
            'duration_hours' => 'required|integer|min:1|max:24',
            'base_price' => 'required|numeric|min:0',
            'difficulty_level' => 'required|in:easy,moderate,challenging',
            'max_participants' => 'required|integer|min:1|max:50',
            'min_participants' => 'required|integer|min:1|max:50',
            'highlights' => 'required|array|min:1',
            'highlights.*' => 'string|max:255',
            'included_items' => 'required|array',
            'included_items.*' => 'string|max:255',
            'excluded_items' => 'nullable|array',
            'excluded_items.*' => 'string|max:255',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string|max:255',
            'meeting_point' => 'required|string|max:500',
            'meeting_instructions' => 'required|string',
            'image' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.title' => 'required|string|max:255',
            'items.*.description' => 'required|string',
            'items.*.day_number' => 'required|integer|min:1',
            'items.*.start_time' => 'required|date_format:H:i',
            'items.*.end_time' => 'required|date_format:H:i|after:items.*.start_time',
            'items.*.duration_minutes' => 'required|integer|min:1',
            'items.*.order_sequence' => 'required|integer|min:1',
            'items.*.activity_type' => 'required|in:visit,meal,transport,activity,break',
            'items.*.point_of_interest_id' => 'nullable|exists:points_of_interest,id',
            'items.*.additional_cost' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
            'guide_ids' => 'required|array|min:1',
            'guide_ids.*' => 'exists:tour_guides,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create itinerary
            $itinerary = Itinerary::create($request->only([
                'title', 'description', 'duration_type', 'duration_days', 'duration_hours',
                'base_price', 'difficulty_level', 'max_participants', 'min_participants',
                'highlights', 'included_items', 'excluded_items', 'requirements',
                'meeting_point', 'meeting_instructions', 'image'
            ]));

            // Create itinerary items
            foreach ($request->items as $itemData) {
                $itinerary->items()->create($itemData);
            }

            // Attach guides
            $guideData = [];
            foreach ($request->guide_ids as $index => $guideId) {
                $guideData[$guideId] = [
                    'is_primary' => $index === 0, // First guide is primary
                    'commission_rate' => 10.00,
                    'is_active' => true
                ];
            }
            $itinerary->guides()->attach($guideData);

            DB::commit();

            return response()->json([
                'message' => 'Itinerary created successfully',
                'itinerary' => $itinerary->load(['items', 'guides'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to create itinerary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified itinerary
     */
    public function show(string $id)
    {
        $itinerary = Itinerary::with(['items.pointOfInterest', 'guides'])
                             ->findOrFail($id);

        return response()->json([
            'itinerary' => $itinerary
        ]);
    }

    /**
     * Update the specified itinerary
     */
    public function update(Request $request, string $id)
    {
        $itinerary = Itinerary::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'duration_type' => 'sometimes|in:half_day,full_day,multi_day',
            'duration_days' => 'sometimes|integer|min:1|max:30',
            'duration_hours' => 'sometimes|integer|min:1|max:24',
            'base_price' => 'sometimes|numeric|min:0',
            'difficulty_level' => 'sometimes|in:easy,moderate,challenging',
            'max_participants' => 'sometimes|integer|min:1|max:50',
            'min_participants' => 'sometimes|integer|min:1|max:50',
            'highlights' => 'sometimes|array|min:1',
            'highlights.*' => 'string|max:255',
            'included_items' => 'sometimes|array',
            'included_items.*' => 'string|max:255',
            'excluded_items' => 'sometimes|nullable|array',
            'excluded_items.*' => 'string|max:255',
            'requirements' => 'sometimes|nullable|array',
            'requirements.*' => 'string|max:255',
            'meeting_point' => 'sometimes|string|max:500',
            'meeting_instructions' => 'sometimes|string',
            'image' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $itinerary->update($request->all());

        return response()->json([
            'message' => 'Itinerary updated successfully',
            'itinerary' => $itinerary->load(['items', 'guides'])
        ]);
    }

    /**
     * Remove the specified itinerary
     */
    public function destroy(string $id)
    {
        $itinerary = Itinerary::findOrFail($id);
        
        // Check if itinerary has active bookings
        if ($itinerary->bookings()->whereIn('status', ['pending', 'confirmed'])->exists()) {
            return response()->json([
                'message' => 'Cannot delete itinerary with active bookings'
            ], 422);
        }

        $itinerary->delete();

        return response()->json([
            'message' => 'Itinerary deleted successfully'
        ]);
    }

    /**
     * Get featured itineraries
     */
    public function featured()
    {
        $itineraries = Itinerary::active()
                               ->featured()
                               ->with(['items.pointOfInterest', 'guides'])
                               ->limit(6)
                               ->get();

        return response()->json([
            'itineraries' => $itineraries
        ]);
    }

    /**
     * Get itineraries by city
     */
    public function getByCity(string $cityId)
    {
        $itineraries = Itinerary::active()
                               ->whereHas('items.pointOfInterest', function ($query) use ($cityId) {
                                   $query->where('city_id', $cityId);
                               })
                               ->with(['items.pointOfInterest', 'guides'])
                               ->get();

        return response()->json([
            'itineraries' => $itineraries
        ]);
    }

    /**
     * Get itineraries by guide
     */
    public function getByGuide(string $guideId)
    {
        $itineraries = Itinerary::active()
                               ->whereHas('guides', function ($query) use ($guideId) {
                                   $query->where('tour_guide_id', $guideId)
                                         ->where('is_active', true);
                               })
                               ->with(['items.pointOfInterest', 'guides'])
                               ->get();

        return response()->json([
            'itineraries' => $itineraries
        ]);
    }
}



