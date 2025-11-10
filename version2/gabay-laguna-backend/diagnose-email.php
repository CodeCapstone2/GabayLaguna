<?php

/**
 * Email Configuration Diagnostic Script
 * 
 * This script checks your email configuration and tests email sending
 * Run: php diagnose-email.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\Booking;

echo "\n";
echo "========================================\n";
echo "  EMAIL CONFIGURATION DIAGNOSTIC\n";
echo "========================================\n\n";

// 1. Check .env file exists
echo "1. Checking .env file...\n";
if (!file_exists(__DIR__.'/.env')) {
    echo "   ❌ .env file not found!\n";
    echo "   → Create a .env file from .env.example\n\n";
    exit(1);
} else {
    echo "   ✅ .env file exists\n\n";
}

// 2. Check mail configuration
echo "2. Checking Mail Configuration...\n";
$mailDriver = config('mail.default', 'not set');
$mailHost = config('mail.mailers.smtp.host', 'not set');
$mailPort = config('mail.mailers.smtp.port', 'not set');
$mailUsername = config('mail.mailers.smtp.username', 'not set');
$mailPassword = config('mail.mailers.smtp.password', 'not set');
$mailEncryption = config('mail.mailers.smtp.encryption', 'not set');
$mailFromAddress = config('mail.from.address', 'not set');
$mailFromName = config('mail.from.name', 'not set');

echo "   Mail Driver: " . ($mailDriver === 'log' ? "❌ LOG (emails won't be sent)" : "✅ {$mailDriver}") . "\n";
echo "   Mail Host: " . ($mailHost === 'not set' ? "❌ Not configured" : "✅ {$mailHost}") . "\n";
echo "   Mail Port: " . ($mailPort === 'not set' ? "❌ Not configured" : "✅ {$mailPort}") . "\n";
echo "   Mail Username: " . (empty($mailUsername) || $mailUsername === 'not set' ? "❌ Not configured" : "✅ " . substr($mailUsername, 0, 3) . "***") . "\n";
echo "   Mail Password: " . (empty($mailPassword) || $mailPassword === 'not set' ? "❌ Not configured" : "✅ " . str_repeat('*', min(strlen($mailPassword), 4))) . "\n";
echo "   Mail Encryption: " . ($mailEncryption === 'not set' ? "❌ Not configured" : "✅ {$mailEncryption}") . "\n";
echo "   From Address: " . ($mailFromAddress === 'not set' ? "❌ Not configured" : "✅ {$mailFromAddress}") . "\n";
echo "   From Name: " . ($mailFromName === 'not set' ? "❌ Not configured" : "✅ {$mailFromName}") . "\n\n";

// 3. Check if using Gmail
if ($mailHost === 'smtp.gmail.com') {
    echo "3. Gmail Configuration Check...\n";
    if (empty($mailPassword) || $mailPassword === 'not set') {
        echo "   ❌ Gmail App Password not set!\n";
        echo "   → You need a Gmail App Password (16 characters)\n";
        echo "   → Get it from: https://myaccount.google.com/apppasswords\n";
        echo "   → Enable 2-Factor Authentication first\n\n";
    } else {
        $passwordLength = strlen($mailPassword);
        if ($passwordLength < 16) {
            echo "   ⚠️  Password seems too short (Gmail App Passwords are 16 characters)\n";
            echo "   → Make sure you're using an App Password, not your regular Gmail password\n\n";
        } else {
            echo "   ✅ Gmail App Password configured\n\n";
        }
    }
}

// 4. Check notification service configuration
echo "4. Checking Notification Service...\n";
$notificationsEnabled = config('gabay-laguna.notifications.email.enabled', true);
echo "   Email Notifications: " . ($notificationsEnabled ? "✅ Enabled" : "❌ Disabled") . "\n\n";

// 5. Check for recent bookings
echo "5. Checking Recent Bookings...\n";
try {
    $recentBooking = Booking::with(['tourist', 'tourGuide.user', 'pointOfInterest'])
        ->latest()
        ->first();
    
    if ($recentBooking) {
        echo "   ✅ Found recent booking (ID: {$recentBooking->id})\n";
        echo "   Tourist: {$recentBooking->tourist->name} ({$recentBooking->tourist->email})\n";
        echo "   Guide: {$recentBooking->tourGuide->user->name} ({$recentBooking->tourGuide->user->email})\n";
        echo "   Status: {$recentBooking->status}\n";
        echo "   Created: {$recentBooking->created_at}\n\n";
    } else {
        echo "   ⚠️  No bookings found. Create a booking first to test email sending.\n\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Error checking bookings: " . $e->getMessage() . "\n\n";
}

// 6. Check email templates
echo "6. Checking Email Templates...\n";
$templates = [
    'emails/booking/confirmation.blade.php',
    'emails/booking/new-request.blade.php',
    'emails/booking/status-update.blade.php',
    'emails/payment/confirmation.blade.php',
];

foreach ($templates as $template) {
    $path = resource_path("views/{$template}");
    if (file_exists($path)) {
        echo "   ✅ {$template}\n";
    } else {
        echo "   ❌ {$template} - NOT FOUND\n";
    }
}
echo "\n";

// 7. Test email sending (if configuration looks good)
if ($mailDriver !== 'log' && $mailHost !== 'not set' && !empty($mailPassword) && $mailPassword !== 'not set') {
    echo "7. Testing Email Sending...\n";
    echo "   Enter an email address to test (or press Enter to skip): ";
    $handle = fopen("php://stdin", "r");
    $testEmail = trim(fgets($handle));
    fclose($handle);
    
    if (!empty($testEmail) && filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
        try {
            echo "   Sending test email to {$testEmail}...\n";
            
            Mail::raw('This is a test email from Gabay Laguna. If you receive this, your email configuration is working!', function($message) use ($testEmail, $mailFromAddress, $mailFromName) {
                $message->to($testEmail)
                        ->subject('Gabay Laguna - Email Test')
                        ->from($mailFromAddress, $mailFromName);
            });
            
            echo "   ✅ Test email sent successfully!\n";
            echo "   → Check your inbox (and spam folder) for the test email\n\n";
        } catch (\Exception $e) {
            echo "   ❌ Failed to send test email\n";
            echo "   Error: " . $e->getMessage() . "\n";
            echo "   Error Code: " . $e->getCode() . "\n\n";
            
            // Common error messages
            if (strpos($e->getMessage(), 'authentication') !== false) {
                echo "   💡 This looks like an authentication error.\n";
                echo "   → Check your Gmail App Password is correct\n";
                echo "   → Make sure 2-Factor Authentication is enabled\n";
            } elseif (strpos($e->getMessage(), 'connection') !== false) {
                echo "   💡 This looks like a connection error.\n";
                echo "   → Check your internet connection\n";
                echo "   → Verify firewall isn't blocking port 587\n";
            }
            echo "\n";
        }
    } else {
        echo "   ⏭️  Skipped email test\n\n";
    }
} else {
    echo "7. Email Test...\n";
    echo "   ⏭️  Skipped - Mail configuration incomplete\n\n";
}

// 8. Check Laravel logs
echo "8. Checking Recent Log Entries...\n";
$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    $logContent = file_get_contents($logFile);
    $emailLogs = [];
    
    // Get last 50 lines
    $lines = explode("\n", $logContent);
    $recentLines = array_slice($lines, -50);
    
    foreach ($recentLines as $line) {
        if (stripos($line, 'email') !== false || 
            stripos($line, 'mail') !== false || 
            stripos($line, 'booking') !== false) {
            $emailLogs[] = $line;
        }
    }
    
    if (!empty($emailLogs)) {
        echo "   Found " . count($emailLogs) . " relevant log entries:\n";
        foreach (array_slice($emailLogs, -10) as $log) {
            if (!empty(trim($log))) {
                echo "   " . substr($log, 0, 100) . (strlen($log) > 100 ? '...' : '') . "\n";
            }
        }
    } else {
        echo "   ℹ️  No recent email-related log entries found\n";
    }
} else {
    echo "   ⚠️  Log file not found at: {$logFile}\n";
}
echo "\n";

// 9. Summary and recommendations
echo "========================================\n";
echo "  DIAGNOSIS SUMMARY\n";
echo "========================================\n\n";

$issues = [];
$warnings = [];

if ($mailDriver === 'log') {
    $issues[] = "Mail driver is set to 'log' - emails won't be sent";
}

if ($mailHost === 'not set' || empty($mailHost)) {
    $issues[] = "Mail host not configured";
}

if (empty($mailPassword) || $mailPassword === 'not set') {
    $issues[] = "Mail password not configured";
}

if ($mailFromAddress === 'not set' || empty($mailFromAddress)) {
    $issues[] = "From address not configured";
}

if ($mailHost === 'smtp.gmail.com' && !empty($mailPassword) && strlen($mailPassword) < 16) {
    $warnings[] = "Gmail password seems too short - should be 16 characters (App Password)";
}

if (empty($issues)) {
    echo "✅ Configuration looks good!\n\n";
    echo "If emails still aren't sending:\n";
    echo "1. Check spam folder\n";
    echo "2. Verify Gmail App Password is correct\n";
    echo "3. Check Laravel logs: tail -f storage/logs/laravel.log\n";
    echo "4. Try the test email above\n";
} else {
    echo "❌ Issues Found:\n";
    foreach ($issues as $issue) {
        echo "   • {$issue}\n";
    }
    echo "\n";
    
    if (!empty($warnings)) {
        echo "⚠️  Warnings:\n";
        foreach ($warnings as $warning) {
            echo "   • {$warning}\n";
        }
        echo "\n";
    }
    
    echo "🔧 Quick Fix:\n";
    echo "1. Update your .env file with:\n";
    echo "   MAIL_MAILER=smtp\n";
    echo "   MAIL_HOST=smtp.gmail.com\n";
    echo "   MAIL_PORT=587\n";
    echo "   MAIL_USERNAME=your-email@gmail.com\n";
    echo "   MAIL_PASSWORD=your-16-char-app-password\n";
    echo "   MAIL_ENCRYPTION=tls\n";
    echo "   MAIL_FROM_ADDRESS=your-email@gmail.com\n";
    echo "   MAIL_FROM_NAME=\"Gabay Laguna\"\n\n";
    echo "2. Run: php artisan config:clear\n";
    echo "3. Run this diagnostic again\n";
}

echo "\n";
echo "For detailed troubleshooting, see: BOOKING_EMAIL_TROUBLESHOOTING.md\n";
echo "\n";


