<?php

namespace App\Http\Controllers;

use App\Models\LocationApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationApplicationController extends Controller
{
    /**
     * Get all location applications (for admin)
     */
    public function index(Request $request)
    {
        $query = LocationApplication::with(['tourGuide.user', 'city', 'pointOfInterest']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'applications' => $applications
        ]);
    }

    /**
     * Get guide's location applications
     */
    public function guideApplications(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $applications = LocationApplication::with(['city', 'pointOfInterest'])
            ->where('tour_guide_id', $guide->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'applications' => $applications
        ]);
    }

    /**
     * Submit a new location application
     */
    public function store(Request $request)
    {
        $guide = $request->user()->tourGuide;
        
        if (!$guide) {
            return response()->json([
                'message' => 'Tour guide profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'city_id' => 'nullable|exists:cities,id',
            'poi_id' => 'nullable|exists:points_of_interest,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        // At least one of city_id or poi_id must be provided
        if (empty($request->city_id) && empty($request->poi_id)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => [
                    'city_id' => ['Please select either a city or a specific point of interest.'],
                    'poi_id' => ['Please select either a city or a specific point of interest.']
                ]
            ], 422);
        }

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if there's already a pending application for this guide and location
        $existingApplication = LocationApplication::where('tour_guide_id', $guide->id)
            ->where('status', 'pending')
            ->where(function($query) use ($request) {
                if ($request->city_id) {
                    $query->where('city_id', $request->city_id);
                }
                if ($request->poi_id) {
                    $query->where('poi_id', $request->poi_id);
                }
            })
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'You already have a pending application for this location'
            ], 422);
        }

        $application = LocationApplication::create([
            'tour_guide_id' => $guide->id,
            'city_id' => $request->city_id,
            'poi_id' => $request->poi_id,
            'message' => $request->notes,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Location application submitted successfully',
            'application' => $application->load(['city', 'pointOfInterest'])
        ], 201);
    }

    /**
     * Approve a location application (admin)
     */
    public function approve(Request $request, $id)
    {
        $application = LocationApplication::with('tourGuide')->findOrFail($id);

        if ($application->status !== 'pending') {
            return response()->json([
                'message' => 'Application has already been processed'
            ], 422);
        }

        $application->update([
            'status' => 'approved',
            'admin_notes' => $request->notes || ''
        ]);

        return response()->json([
            'message' => 'Location application approved successfully',
            'application' => $application
        ]);
    }

    /**
     * Reject a location application (admin)
     */
    public function reject(Request $request, $id)
    {
        $application = LocationApplication::findOrFail($id);

        if ($application->status !== 'pending') {
            return response()->json([
                'message' => 'Application has already been processed'
            ], 422);
        }

        $application->update([
            'status' => 'rejected',
            'admin_notes' => $request->notes || ''
        ]);

        return response()->json([
            'message' => 'Location application rejected successfully',
            'application' => $application
        ]);
    }

    /**
     * Get a specific location application
     */
    public function show($id)
    {
        $application = LocationApplication::with(['tourGuide.user', 'city', 'pointOfInterest'])
            ->findOrFail($id);

        return response()->json([
            'application' => $application
        ]);
    }

    /**
     * Delete a location application
     */
    public function destroy($id)
    {
        $application = LocationApplication::findOrFail($id);
        $application->delete();

        return response()->json([
            'message' => 'Location application deleted successfully'
        ]);
    }
}