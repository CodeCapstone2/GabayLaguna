<?php
/**
 * Test Email Sending to Specific Gmail Accounts
 * Run: php test-email-to-accounts.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

echo "\n";
echo "========================================\n";
echo "  TESTING EMAIL TO SPECIFIC ACCOUNTS\n";
echo "========================================\n\n";

$testEmails = [
    'gabaylaguna.guide@gmail.com',
    'gabaylaguna.tourist@gmail.com'
];

// Check configuration first
echo "1. Checking Email Configuration...\n";
$mailDriver = config('mail.default');
$mailHost = config('mail.mailers.smtp.host');
$mailPort = config('mail.mailers.smtp.port');
$mailEncryption = config('mail.mailers.smtp.encryption');
$mailUsername = config('mail.mailers.smtp.username');
$mailPassword = config('mail.mailers.smtp.password');
$mailFrom = config('mail.from.address');

echo "   Driver: {$mailDriver}\n";
echo "   Host: {$mailHost}\n";
echo "   Port: {$mailPort}\n";
echo "   Encryption: " . ($mailEncryption ?: 'NOT SET') . "\n";
echo "   Username: " . substr($mailUsername, 0, 3) . "***\n";
echo "   Password: " . ($mailPassword ? "SET (" . strlen($mailPassword) . " chars)" : "NOT SET") . "\n";
echo "   From: {$mailFrom}\n\n";

if ($mailDriver === 'log') {
    echo "❌ ERROR: Mail driver is set to 'log' - emails won't be sent!\n";
    echo "   Fix: Set MAIL_MAILER=smtp in .env\n\n";
    exit(1);
}

if (!$mailEncryption) {
    echo "⚠️  WARNING: MAIL_ENCRYPTION not set - Gmail requires TLS!\n";
    echo "   Fix: Add MAIL_ENCRYPTION=tls to .env\n\n";
}

// Test sending to each email
echo "2. Testing Email Sending...\n\n";

foreach ($testEmails as $email) {
    echo "   Sending test email to: {$email}\n";
    
    try {
        Mail::raw("This is a test email from Gabay Laguna.\n\nIf you receive this, your email configuration is working correctly!\n\nTime: " . date('Y-m-d H:i:s'), function($message) use ($email, $mailFrom) {
            $message->to($email)
                    ->subject('Gabay Laguna - Email Test')
                    ->from($mailFrom, config('mail.from.name', 'Gabay Laguna'));
        });
        
        echo "   ✅ Email sent successfully!\n";
        echo "   → Check inbox and spam folder for: {$email}\n\n";
        
    } catch (\Exception $e) {
        echo "   ❌ Failed to send email\n";
        echo "   Error: " . $e->getMessage() . "\n";
        echo "   Error Code: " . $e->getCode() . "\n";
        
        // Provide specific guidance based on error
        $errorMsg = strtolower($e->getMessage());
        if (strpos($errorMsg, 'authentication') !== false) {
            echo "   💡 Authentication error - Check your Gmail App Password\n";
        } elseif (strpos($errorMsg, 'connection') !== false) {
            echo "   💡 Connection error - Check network/firewall settings\n";
        } elseif (strpos($errorMsg, 'encryption') !== false || strpos($errorMsg, 'tls') !== false) {
            echo "   💡 Encryption error - Make sure MAIL_ENCRYPTION=tls is set\n";
        }
        echo "\n";
    }
}

// Test booking confirmation email template
echo "3. Testing Booking Confirmation Email Template...\n\n";

try {
    // Create a mock booking data structure
    $mockBooking = (object)[
        'id' => 999,
        'tour_date' => date('Y-m-d', strtotime('+7 days')),
        'start_time' => '09:00',
        'end_time' => '11:00',
        'duration_hours' => 2,
        'number_of_people' => 2,
        'total_amount' => 1000,
        'status' => 'pending',
        'special_requests' => 'Test booking',
    ];
    
    $mockTourist = (object)[
        'name' => 'Test Tourist',
        'email' => 'gabaylaguna.tourist@gmail.com',
    ];
    
    $mockGuide = (object)[
        'name' => 'Test Guide',
        'email' => 'gabaylaguna.guide@gmail.com',
    ];
    
    $mockPoi = (object)[
        'name' => 'Test Location',
    ];
    
    // Test tourist confirmation email
    echo "   Sending booking confirmation to tourist...\n";
    Mail::send('emails.booking.confirmation', [
        'booking' => $mockBooking,
        'tourist' => $mockTourist,
        'guide' => $mockGuide,
        'poi' => $mockPoi
    ], function($message) use ($mockTourist, $mailFrom) {
        $message->to($mockTourist->email)
                ->subject('Booking Confirmation - Gabay Laguna')
                ->from($mailFrom, config('mail.from.name', 'Gabay Laguna'));
    });
    echo "   ✅ Tourist confirmation email sent\n";
    
    // Test guide new request email
    echo "   Sending new booking request to guide...\n";
    Mail::send('emails.booking.new-request', [
        'booking' => $mockBooking,
        'tourist' => $mockTourist,
        'guide' => $mockGuide,
        'poi' => $mockPoi
    ], function($message) use ($mockGuide, $mailFrom) {
        $message->to($mockGuide->email)
                ->subject('New Booking Request - Gabay Laguna')
                ->from($mailFrom, config('mail.from.name', 'Gabay Laguna'));
    });
    echo "   ✅ Guide new request email sent\n\n";
    
} catch (\Exception $e) {
    echo "   ❌ Template test failed\n";
    echo "   Error: " . $e->getMessage() . "\n\n";
}

echo "========================================\n";
echo "  TEST COMPLETE\n";
echo "========================================\n\n";
echo "Check both Gmail accounts:\n";
echo "  - gabaylaguna.guide@gmail.com\n";
echo "  - gabaylaguna.tourist@gmail.com\n\n";
echo "Also check spam/junk folders!\n\n";


