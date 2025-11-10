<?php
/**
 * Quick Email Configuration Check
 * Run: php check-email-config.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== EMAIL CONFIGURATION CHECK ===\n\n";

$mailDriver = config('mail.default');
$mailHost = config('mail.mailers.smtp.host');
$mailPort = config('mail.mailers.smtp.port');
$mailUsername = config('mail.mailers.smtp.username');
$mailPassword = config('mail.mailers.smtp.password');
$mailEncryption = config('mail.mailers.smtp.encryption');
$mailFrom = config('mail.from.address');
$mailFromName = config('mail.from.name');

echo "Mail Driver: " . ($mailDriver === 'log' ? "❌ LOG (emails won't be sent!)" : "✅ {$mailDriver}") . "\n";
echo "Mail Host: " . ($mailHost ?: "❌ NOT SET") . "\n";
echo "Mail Port: " . ($mailPort ?: "❌ NOT SET") . "\n";
echo "Mail Username: " . ($mailUsername ? substr($mailUsername, 0, 3) . "***" : "❌ NOT SET") . "\n";
echo "Mail Password: " . ($mailPassword ? "✅ SET (" . strlen($mailPassword) . " chars)" : "❌ NOT SET") . "\n";
echo "Mail Encryption: " . ($mailEncryption ?: "❌ NOT SET") . "\n";
echo "From Address: " . ($mailFrom ?: "❌ NOT SET") . "\n";
echo "From Name: " . ($mailFromName ?: "❌ NOT SET") . "\n\n";

if ($mailDriver === 'log') {
    echo "⚠️  PROBLEM: Mail driver is set to 'log' - emails are only logged, not sent!\n";
    echo "   Fix: Set MAIL_MAILER=smtp in .env and run: php artisan config:clear\n\n";
}

if ($mailHost === 'smtp.gmail.com' && $mailPassword && strlen($mailPassword) < 16) {
    echo "⚠️  WARNING: Gmail password seems too short. Gmail App Passwords are 16 characters.\n";
    echo "   Make sure you're using an App Password, not your regular Gmail password.\n\n";
}

if (!$mailPassword) {
    echo "❌ PROBLEM: Mail password not configured!\n";
    echo "   For Gmail: Get App Password from https://myaccount.google.com/apppasswords\n\n";
}

echo "=== RECENT BOOKING EMAIL LOGS ===\n\n";
$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    $lines = explode("\n", $content);
    $emailLines = [];
    foreach (array_reverse($lines) as $line) {
        if (stripos($line, 'email') !== false || stripos($line, 'mail') !== false || stripos($line, 'booking') !== false) {
            $emailLines[] = $line;
            if (count($emailLines) >= 20) break;
        }
    }
    if (!empty($emailLines)) {
        foreach (array_reverse($emailLines) as $line) {
            echo substr($line, 0, 150) . "\n";
        }
    } else {
        echo "No email-related log entries found.\n";
    }
} else {
    echo "Log file not found.\n";
}

echo "\n";


