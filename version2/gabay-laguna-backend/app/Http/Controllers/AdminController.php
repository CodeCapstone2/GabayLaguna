<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TourGuide;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\City;
use App\Models\Category;
use App\Models\PointOfInterest;
use App\Models\LocationApplication;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function dashboard()
    {
        $stats = [
                'total_users' => User::count(),
                'total_tourists' => User::where('user_type', 'tourist')->count(),
                'total_guides' => User::where('user_type', 'guide')->count(),
                'pending_verifications' => TourGuide::where('is_verified', false)->count(),
                'pending_location_applications' => LocationApplication::where('status', 'pending')->count(), // Add this line
                'total_bookings' => Booking::count(),
                'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
                'total_cities' => City::count(),
                'total_categories' => Category::count(),
                'total_pois' => PointOfInterest::count(),
            ];

        $recentBookings = Booking::with(['tourist', 'tourGuide.user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentPayments = Payment::with('booking.tourist')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'statistics' => $stats,
            'recent_bookings' => $recentBookings,
            'recent_payments' => $recentPayments,
        ]);
    }

    /**
     * Get all users
     */
    public function users(Request $request)
    {
        $query = User::with('tourGuide');

        if ($request->user_type) {
            $query->where('user_type', $request->user_type);
        }

        if ($request->is_verified !== null) {
            $query->where('is_verified', $request->is_verified);
        }

        $users = $query->paginate(20);

        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Get all tour guides
     */
    public function guides(Request $request)
    {
        $query = TourGuide::with(['user', 'categories']);

        if ($request->is_verified !== null) {
            $query->where('is_verified', $request->is_verified);
        }

        if ($request->is_available !== null) {
            $query->where('is_available', $request->is_available);
        }

        $guides = $query->paginate(20);

        return response()->json([
            'tour_guides' => $guides
        ]);
    }

    /**
     * Get all bookings
     */
    public function bookings(Request $request)
    {
        $query = Booking::with(['tourist', 'tourGuide.user', 'pointOfInterest.city']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->where('tour_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('tour_date', '<=', $request->date_to);
        }

        $bookings = $query->orderBy('tour_date', 'desc')->paginate(20);

        return response()->json([
            'bookings' => $bookings
        ]);
    }

    /**
     * Get all payments
     */
    public function payments(Request $request)
    {
        $query = Payment::with('booking.tourist');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'payments' => $payments
        ]);
    }

    /**
     * Verify user
     */
    public function verifyUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_verified' => true]);

        return response()->json([
            'message' => 'User verified successfully',
            'user' => $user
        ]);
    }

    /**
     * Update user status
     */
    public function updateUserStatus(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($id);
        $user->update(['is_active' => $request->is_active]);

        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Verify tour guide
     */
    public function verifyGuide(Request $request, string $id)
    {
        $guide = TourGuide::findOrFail($id);
        $guide->update(['is_verified' => true]);

        // Also verify the user
        $guide->user->update(['is_verified' => true]);

        return response()->json([
            'message' => 'Tour guide verified successfully',
            'tour_guide' => $guide->load('user')
        ]);
    }

    /**
     * Get system analytics
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', 'month');

        $bookingsByMonth = Booking::selectRaw('DATE_FORMAT(tour_date, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $revenueByMonth = Payment::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
            ->where('status', 'completed')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topGuides = TourGuide::with('user')
            ->withCount(['bookings', 'reviews'])
            ->orderBy('bookings_count', 'desc')
            ->limit(10)
            ->get();

        $topCities = City::withCount('pointsOfInterest')
            ->orderBy('points_of_interest_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'bookings_by_month' => $bookingsByMonth,
            'revenue_by_month' => $revenueByMonth,
            'top_guides' => $topGuides,
            'top_cities' => $topCities,
        ]);
    }

    /**
     * Get reports and analytics data
     */
    public function reports(Request $request)
    {
        $timeRange = $request->get('time_range', 'month');
        
        // Calculate date range based on time_range
        $endDate = now();
        $startDate = match($timeRange) {
            'week' => $endDate->copy()->subWeek(),
            'month' => $endDate->copy()->subMonth(),
            'year' => $endDate->copy()->subYear(),
            default => $endDate->copy()->subMonth(),
        };

        // Get basic statistics
        $totalUsers = User::count();
        $totalGuides = User::where('user_type', 'guide')->count();
        $totalTourists = User::where('user_type', 'tourist')->count();
        $activeGuides = TourGuide::where('is_available', true)->count();
        
        // Get revenue data
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $revenueInPeriod = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');
        
        // Get booking data
        $totalBookings = Booking::count();
        $bookingsInPeriod = Booking::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedBookings = Booking::where('status', 'completed')->count();
        $completionRate = $totalBookings > 0 ? ($completedBookings / $totalBookings) * 100 : 0;
        
        // Get average rating
        $averageRating = Review::avg('rating') ?? 0;
        
        // Get average booking value
        $avgBookingValue = $totalBookings > 0 ? ($totalRevenue / $totalBookings) : 0;

        $stats = [
            'totalRevenue' => $totalRevenue,
            'revenueInPeriod' => $revenueInPeriod,
            'totalBookings' => $totalBookings,
            'bookingsInPeriod' => $bookingsInPeriod,
            'activeGuides' => $activeGuides,
            'totalUsers' => $totalUsers,
            'totalGuides' => $totalGuides,
            'totalTourists' => $totalTourists,
            'averageRating' => round($averageRating, 1),
            'completionRate' => round($completionRate, 1),
            'avgBookingValue' => round($avgBookingValue, 2),
        ];

        return response()->json([
            'stats' => $stats,
            'timeRange' => $timeRange,
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ]
        ]);
    }
}
