# Booking Email Troubleshooting Guide

## Problem: No Emails Received When Creating a Booking

### Common Causes:

1. **Gmail SMTP Not Configured**
2. **Mail Driver Set to 'log' Instead of 'smtp'**
3. **Invalid Gmail App Password**
4. **Email Configuration Not Loaded**
5. **Email Going to Spam Folder**

## Step-by-Step Diagnosis

### 1. Check Your .env File

Verify your `.env` file has these settings:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Gabay Laguna"
```

**Important:** 
- `MAIL_PASSWORD` must be a Gmail App Password (16 characters, no spaces)
- NOT your regular Gmail password
- You need 2-Factor Authentication enabled on your Gmail account

### 2. Clear Configuration Cache

After updating `.env`, run:

```bash
cd gabay-laguna-backend
php artisan config:clear
php artisan cache:clear
```

### 3. Check Laravel Logs

Check the logs for email errors:

```bash
tail -f storage/logs/laravel.log
```

Look for:
- `Email sent successfully` - Email was sent
- `Mail driver is set to "log"` - Emails are only being logged, not sent
- `Email sending failed` - There was an error sending
- `Invalid email address` - Email address is incorrect

### 4. Test Email Configuration

Create a test file `test-booking-email.php`:

```php
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;
use App\Services\NotificationService;

// Get a recent booking
$booking = Booking::with(['tourist', 'tourGuide.user', 'pointOfInterest'])
    ->latest()
    ->first();

if (!$booking) {
    echo "No bookings found. Please create a booking first.\n";
    exit(1);
}

echo "Testing email for Booking ID: {$booking->id}\n";
echo "Tourist Email: {$booking->tourist->email}\n";
echo "Guide Email: {$booking->tourGuide->user->email}\n\n";

$notificationService = new NotificationService();
$result = $notificationService->sendBookingConfirmation($booking);

if ($result) {
    echo "✅ Email sent successfully!\n";
} else {
    echo "❌ Email failed to send. Check logs for details.\n";
}
```

Run it:
```bash
php test-booking-email.php
```

### 5. Verify Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Make sure you have an App Password for "Mail"
3. Copy the 16-character password (without spaces)
4. Update your `.env` file with this password
5. Clear config cache: `php artisan config:clear`

### 6. Check Mail Driver

Verify the mail driver is set correctly:

```bash
php artisan tinker
```

Then run:
```php
config('mail.default')  // Should return 'smtp', not 'log'
config('mail.mailers.smtp.host')  // Should return 'smtp.gmail.com'
config('mail.from.address')  // Should return your Gmail address
```

### 7. Test Direct Email Sending

Test if Laravel can send emails at all:

```bash
php artisan tinker
```

Then:
```php
Mail::raw('Test email', function($message) {
    $message->to('your-email@gmail.com')
            ->subject('Test Email');
});
```

### 8. Check Email Templates

Verify email templates exist:
- `resources/views/emails/booking/confirmation.blade.php`
- `resources/views/emails/booking/new-request.blade.php`

### 9. Enable Detailed Logging

Add this to your `.env` to see more details:

```env
LOG_LEVEL=debug
```

Then check logs again after creating a booking.

## Quick Fix Checklist

- [ ] Gmail App Password is set in `.env` (16 characters, no spaces)
- [ ] `MAIL_MAILER=smtp` in `.env`
- [ ] `MAIL_HOST=smtp.gmail.com` in `.env`
- [ ] `MAIL_PORT=587` in `.env`
- [ ] `MAIL_ENCRYPTION=tls` in `.env`
- [ ] Ran `php artisan config:clear`
- [ ] Ran `php artisan cache:clear`
- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated for "Mail"
- [ ] Checked spam folder
- [ ] Checked Laravel logs for errors

## Expected Behavior

When you create a booking:
1. **Tourist** should receive: "Booking Confirmation - Gabay Laguna"
2. **Guide** should receive: "New Booking Request - Gabay Laguna"

Both emails should arrive within a few seconds of booking creation.

## Still Not Working?

1. Check `storage/logs/laravel.log` for detailed error messages
2. Verify your Gmail account allows "Less secure app access" (if not using App Password)
3. Try using a different email service (Mailtrap for testing)
4. Check firewall/network settings blocking SMTP port 587

## Testing with Mailtrap (Development Only)

If Gmail doesn't work, use Mailtrap for testing:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@gabaylaguna.com
MAIL_FROM_NAME="Gabay Laguna"
```

Then check your Mailtrap inbox to see if emails are being sent.


