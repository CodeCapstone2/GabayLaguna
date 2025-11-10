<?php
/**
 * Test Status Update Email Sending
 * Run: php test-status-update-emails.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Services\NotificationService;

echo "\n";
echo "========================================\n";
echo "  TESTING STATUS UPDATE EMAILS\n";
echo "========================================\n\n";

// Get the most recent booking
$booking = Booking::with(['tourist', 'tourGuide.user', 'pointOfInterest', 'payment'])
    ->orderBy('id', 'desc')
    ->first();

if (!$booking) {
    echo "❌ No bookings found. Please create a booking first.\n";
    exit(1);
}

echo "Using Booking ID: {$booking->id}\n";
echo "Tourist: {$booking->tourist->name} ({$booking->tourist->email})\n";
echo "Guide: {$booking->tourGuide->user->name} ({$booking->tourGuide->user->email})\n";
echo "Current Status: {$booking->status}\n\n";

$notificationService = app(NotificationService::class);

// Test cancelled status
echo "1. Testing CANCELLED status update...\n";
try {
    $result = $notificationService->sendBookingStatusUpdate($booking, $booking->status, 'cancelled');
    if ($result) {
        echo "   ✅ Email sent successfully!\n";
    } else {
        echo "   ❌ Email sending failed\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Exception: " . $e->getMessage() . "\n";
}
echo "\n";

// Test rejected status
echo "2. Testing REJECTED status update...\n";
try {
    $result = $notificationService->sendBookingStatusUpdate($booking, $booking->status, 'rejected');
    if ($result) {
        echo "   ✅ Email sent successfully!\n";
    } else {
        echo "   ❌ Email sending failed\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Exception: " . $e->getMessage() . "\n";
}
echo "\n";

echo "========================================\n";
echo "  TEST COMPLETE\n";
echo "========================================\n\n";
echo "Check both email accounts:\n";
echo "  - {$booking->tourist->email}\n";
echo "  - {$booking->tourGuide->user->email}\n\n";
echo "Also check spam/junk folders!\n\n";
echo "Check logs: storage/logs/laravel.log\n\n";


