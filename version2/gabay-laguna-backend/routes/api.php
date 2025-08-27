<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PointOfInterestController;
use App\Http\Controllers\TourGuideController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/guide/register', [AuthController::class, 'registerGuide']);

// Cities and Categories (public)
Route::get('/cities', [CityController::class, 'index']);
Route::get('/cities/{city}', [CityController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Points of Interest (public)
Route::get('/pois', [PointOfInterestController::class, 'index']);
Route::get('/pois/{poi}', [PointOfInterestController::class, 'show']);
Route::get('/cities/{city}/pois', [PointOfInterestController::class, 'getByCity']);
Route::get('/categories/{category}/pois', [PointOfInterestController::class, 'getByCategory']);

// Tour Guides (public)
Route::get('/guides', [TourGuideController::class, 'index']);
Route::get('/guides/{guide}', [TourGuideController::class, 'show']);
Route::get('/guides/search', [TourGuideController::class, 'search']);
Route::get('/guides/{guide}/reviews', [ReviewController::class, 'getGuideReviews']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Tourist routes
    Route::middleware('tourist')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings', [BookingController::class, 'touristBookings']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);
        Route::put('/bookings/{booking}', [BookingController::class, 'update']);
        Route::delete('/bookings/{booking}', [BookingController::class, 'cancel']);
        
        Route::post('/reviews', [ReviewController::class, 'store']);
        Route::get('/reviews', [ReviewController::class, 'touristReviews']);
        Route::put('/reviews/{review}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    });

    // Guide routes
    Route::middleware('guide')->group(function () {
        Route::get('/guide/bookings', [BookingController::class, 'guideBookings']);
        Route::put('/guide/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
        
        Route::get('/guide/availability', [TourGuideController::class, 'getAvailability']);
        Route::post('/guide/availability', [TourGuideController::class, 'setAvailability']);
        Route::put('/guide/availability/{availability}', [TourGuideController::class, 'updateAvailability']);
        Route::delete('/guide/availability/{availability}', [TourGuideController::class, 'deleteAvailability']);
        
        Route::get('/guide/specializations', [TourGuideController::class, 'getSpecializations']);
        Route::post('/guide/specializations', [TourGuideController::class, 'addSpecialization']);
        Route::delete('/guide/specializations/{specialization}', [TourGuideController::class, 'removeSpecialization']);
        
        Route::get('/guide/reviews', [ReviewController::class, 'guideReviews']);
    });

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'Admindashboard']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/guides', [AdminController::class, 'guides']);
        Route::get('/admin/bookings', [AdminController::class, 'bookings']);
        Route::get('/admin/payments', [AdminController::class, 'payments']);
        
        Route::put('/admin/users/{user}/verify', [AdminController::class, 'verifyUser']);
        Route::put('/admin/users/{user}/status', [AdminController::class, 'updateUserStatus']);
        Route::put('/admin/guides/{guide}/verify', [AdminController::class, 'verifyGuide']);
        
        Route::post('/admin/cities', [CityController::class, 'store']);
        Route::put('/admin/cities/{city}', [CityController::class, 'update']);
        Route::delete('/admin/cities/{city}', [CityController::class, 'destroy']);
        
        Route::post('/admin/categories', [CategoryController::class, 'store']);
        Route::put('/admin/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/admin/categories/{category}', [CategoryController::class, 'destroy']);
        
        Route::post('/admin/pois', [PointOfInterestController::class, 'store']);
        Route::put('/admin/pois/{poi}', [PointOfInterestController::class, 'update']);
        Route::delete('/admin/pois/{poi}', [PointOfInterestController::class, 'destroy']);
    });
});

// Payment routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/paypal', [PaymentController::class, 'processPayPalPayment']);
    Route::post('/payments/paymongo', [PaymentController::class, 'processPayMongoPayment']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund']);
});

// Payment webhooks
Route::post('/webhooks/paypal', [PaymentController::class, 'paypalWebhook']);
Route::post('/webhooks/paymongo', [PaymentController::class, 'paymongoWebhook']);

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'healthy', 'timestamp' => now()]);
});
