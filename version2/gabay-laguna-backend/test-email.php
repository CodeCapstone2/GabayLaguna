<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Mail;

// Test email configuration with real Gmail accounts
echo "Testing email configuration with real Gmail accounts...\n";
echo "Make sure you have configured your .env file with real Gmail credentials.\n\n";

// Test emails to send
$testEmails = [
    'gabaylaguna.tourist@gmail.com' => 'Tourist Test Email',
    'gabaylaguna.guide@gmail.com' => 'Guide Test Email'
];

foreach ($testEmails as $email => $description) {
    try {
        echo "Sending test email to: $email\n";
        
        Mail::raw("This is a test email from Gabay Laguna application.\n\nThis email confirms that your email notifications are working correctly.\n\nBest regards,\nGabay Laguna Team", function ($message) use ($email, $description) {
            $message->to($email)
                    ->subject("✅ $description - Gabay Laguna Test")
                    ->from(config('mail.from.address'), config('mail.from.name'));
        });
        
        echo "✅ Email sent successfully to $email\n";
        
    } catch (Exception $e) {
        echo "❌ Email failed to $email: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "📧 Email testing completed!\n";
echo "Check both Gmail accounts for the test emails.\n";
echo "If you don't see them, check the spam folder.\n";
