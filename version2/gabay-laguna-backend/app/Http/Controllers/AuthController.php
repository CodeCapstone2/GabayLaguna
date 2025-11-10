<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TourGuide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    /**
     * Register a new tourist user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'phone' => 'nullable|string|max:20',
            'nationality' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => 'tourist',
            'phone' => $request->phone,
            'nationality' => $request->nationality,
        ]);

        // Invalidate old tokens from other devices to prevent conflicts
        try {
            $user->tokens()->delete();
        } catch (\Throwable $e) {
            // ignore if tokens relation not available
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Tourist registered successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Register a new tour guide
     */
    public function registerGuide(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'phone' => 'nullable|string|max:20',
            'bio' => 'required|string|max:1000',
            'license_number' => 'required|string|max:100|unique:tour_guides',
            'experience_years' => 'required|integer|min:0|max:50',
            'hourly_rate' => 'required|numeric|min:0|max:10000',
            'languages' => 'required|string|max:255',
            'transportation_type' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => 'guide',
            'phone' => $request->phone,
        ]);

        $tourGuide = TourGuide::create([
            'user_id' => $user->id,
            'bio' => $request->bio,
            'license_number' => $request->license_number,
            'experience_years' => $request->experience_years,
            'hourly_rate' => $request->hourly_rate,
            'languages' => $request->languages,
            'transportation_type' => $request->transportation_type,
        ]);

        // Invalidate old tokens from other devices to prevent conflicts
        try {
            $user->tokens()->delete();
        } catch (\Throwable $e) {
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        // Reload user with tour guide relationship
        $user->load('tourGuide');

        return response()->json([
            'message' => 'Tour guide registered successfully',
            'user' => $user,
            'tour_guide' => $tourGuide,
            'token' => $token
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->with('tourGuide')->firstOrFail();
        
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is deactivated'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user()->load(['tourGuide.reviews.tourist']);
        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
            'profile_picture' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userData = $request->only(['name', 'email', 'phone']);

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                $oldImagePath = str_replace('/storage', 'public', $user->profile_picture);
                if (Storage::exists($oldImagePath)) {
                    Storage::delete($oldImagePath);
                }
            }

            $image = $request->file('profile_picture');
            $imageName = time() . '_' . $user->id . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('public/profile_pictures', $imageName);
            
            $userData['profile_picture'] = Storage::url($imagePath);
        }

        $user->update($userData);

        // Reload the user with tour guide relationship
        $user->load('tourGuide');

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        if (!$user) {
            return response()->json([
                'message' => 'If the email exists, a password reset link has been sent.'
            ], 200);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'If the email exists, a password reset link has been sent.'
            ], 200);
        }

        // Generate password reset token
        $token = Str::random(64);

        // Delete existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        // Insert new token
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Generate reset URL - you may need to adjust this based on your frontend URL
        $resetUrl = config('app.frontend_url', config('app.url')) . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        // Send password reset email
        try {
            Mail::send('emails.password.reset', [
                'user' => $user,
                'resetUrl' => $resetUrl,
                'token' => $token,
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Password Reset Request - Gabay Laguna')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email', [
                'email' => $user->email,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'message' => 'If the email exists, a password reset link has been sent.'
        ], 200);
    }

    /**
     * Reset password with token
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid email or token'
            ], 400);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is deactivated'
            ], 403);
        }

        // Find the password reset token
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$passwordReset) {
            return response()->json([
                'message' => 'Invalid or expired token'
            ], 400);
        }

        // Check if token is expired (60 minutes)
        if (now()->diffInMinutes($passwordReset->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Token has expired. Please request a new password reset.'
            ], 400);
        }

        // Verify the token
        if (!Hash::check($request->token, $passwordReset->token)) {
            return response()->json([
                'message' => 'Invalid or expired token'
            ], 400);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Optionally invalidate all user tokens to force re-login
        try {
            $user->tokens()->delete();
        } catch (\Throwable $e) {
            // ignore if tokens relation not available
        }

        return response()->json([
            'message' => 'Password has been reset successfully'
        ], 200);
    }

    /**
     * Get user statistics for tourist profile
     */
    public function getUserStatistics(Request $request)
    {
        $user = $request->user();
        
        // Get booking statistics
        $totalBookings = $user->touristBookings()->count();
        $completedBookings = $user->touristBookings()->where('status', 'completed')->count();
        $cancelledBookings = $user->touristBookings()->where('status', 'cancelled')->count();
        
        // Get unique cities visited
        $citiesVisited = $user->touristBookings()
            ->where('status', 'completed')
            ->with('pointOfInterest.city')
            ->get()
            ->pluck('pointOfInterest.city.name')
            ->unique()
            ->count();
        
        // Get review statistics
        $reviewsGiven = $user->touristReviews()->count();
        
        // Get recent bookings (last 5)
        $recentBookings = $user->touristBookings()
            ->with(['pointOfInterest.city', 'tourGuide.user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'poi_name' => $booking->pointOfInterest->name ?? 'Unknown POI',
                    'city' => $booking->pointOfInterest->city->name ?? 'Unknown City',
                    'guide_name' => $booking->tourGuide->user->name ?? 'Unknown Guide',
                    'status' => $booking->status,
                    'tour_date' => $booking->tour_date,
                    'created_at' => $booking->created_at,
                ];
            });
        
        // Generate travel preferences based on booking history
        $preferredCities = $user->touristBookings()
            ->where('status', 'completed')
            ->with('pointOfInterest.city')
            ->get()
            ->pluck('pointOfInterest.city.name')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
        
        $preferredCategories = $user->touristBookings()
            ->where('status', 'completed')
            ->with('pointOfInterest.category')
            ->get()
            ->pluck('pointOfInterest.category.name')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
        
        // Generate interests based on categories and POI types
        $interests = [];
        foreach ($preferredCategories as $category) {
            switch (strtolower($category)) {
                case 'waterfalls/adventure':
                    $interests[] = 'Adventure Sports';
                    $interests[] = 'Natural Parks';
                    break;
                case 'historical/cultural':
                    $interests[] = 'Historical Sites';
                    $interests[] = 'Cultural Heritage';
                    break;
                case 'educational':
                    $interests[] = 'Educational Tours';
                    $interests[] = 'Learning Experiences';
                    break;
                case 'lakes/nature':
                    $interests[] = 'Natural Parks';
                    $interests[] = 'Outdoor Activities';
                    break;
                case 'religious sites':
                    $interests[] = 'Religious Sites';
                    $interests[] = 'Spiritual Tourism';
                    break;
                case 'food & culinary':
                    $interests[] = 'Local Food';
                    $interests[] = 'Culinary Tours';
                    break;
                case 'art & museums':
                    $interests[] = 'Art & Museums';
                    $interests[] = 'Cultural Heritage';
                    break;
            }
        }
        
        // Remove duplicates and limit to 5 interests
        $interests = array_unique($interests);
        $interests = array_slice($interests, 0, 5);
        
        return response()->json([
            'statistics' => [
                'total_tours' => $totalBookings,
                'completed_tours' => $completedBookings,
                'cancelled_tours' => $cancelledBookings,
                'cities_visited' => $citiesVisited,
                'reviews_given' => $reviewsGiven,
            ],
            'recent_activity' => $recentBookings,
            'travel_preferences' => [
                'preferred_cities' => $preferredCities,
                'interests' => $interests
            ]
        ]);
    }
}