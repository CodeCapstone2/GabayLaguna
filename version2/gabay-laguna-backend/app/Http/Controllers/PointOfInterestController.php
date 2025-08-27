<?php

namespace App\Http\Controllers;

use App\Models\PointOfInterest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PointOfInterestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pois = PointOfInterest::active()
            ->with(['city', 'category'])
            ->paginate(20);
        
        return response()->json([
            'points_of_interest' => $pois
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'required|string',
            'city_id' => 'required|exists:cities,id',
            'category_id' => 'required|exists:categories,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'required|string|max:500',
            'operating_hours' => 'nullable|string|max:255',
            'entrance_fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $poi = PointOfInterest::create($request->all());

        return response()->json([
            'message' => 'Point of Interest created successfully',
            'point_of_interest' => $poi->load(['city', 'category'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $poi = PointOfInterest::with(['city', 'category'])->findOrFail($id);
        
        return response()->json([
            'point_of_interest' => $poi
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $poi = PointOfInterest::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image' => 'sometimes|string',
            'city_id' => 'sometimes|exists:cities,id',
            'category_id' => 'sometimes|exists:categories,id',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'address' => 'sometimes|string|max:500',
            'operating_hours' => 'sometimes|nullable|string|max:255',
            'entrance_fee' => 'sometimes|nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $poi->update($request->all());

        return response()->json([
            'message' => 'Point of Interest updated successfully',
            'point_of_interest' => $poi->load(['city', 'category'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $poi = PointOfInterest::findOrFail($id);
        $poi->delete();

        return response()->json([
            'message' => 'Point of Interest deleted successfully'
        ]);
    }

    /**
     * Get points of interest by city
     */
    public function getByCity(string $cityId)
    {
        $pois = PointOfInterest::where('city_id', $cityId)
            ->active()
            ->with(['category'])
            ->get();
        
        return response()->json([
            'points_of_interest' => $pois
        ]);
    }

    /**
     * Get points of interest by category
     */
    public function getByCategory(string $categoryId)
    {
        $pois = PointOfInterest::where('category_id', $categoryId)
            ->active()
            ->with(['city'])
            ->get();
        
        return response()->json([
            'points_of_interest' => $pois
        ]);
    }
}
