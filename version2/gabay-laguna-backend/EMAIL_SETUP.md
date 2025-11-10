# Email Configuration Guide for Gmail

## Problem
Emails are not being received because SMTP configuration is missing or incorrect.

## Solution: Configure Gmail SMTP

### Step 1: Enable 2-Step Verification on Gmail
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Create an App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Or navigate: **Google Account** → **Security** → **2-Step Verification** → **App passwords**
3. Select **Mail** as the app
4. Select **Other** as the device and type "Gabay Laguna"
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this for your .env file)

### Step 3: Update .env File
Add or update these settings in your `gabay-laguna-backend/.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Step 4: Clear Config Cache
After updating .env, clear the config cache:

```bash
php artisan config:clear
php artisan cache:clear
```

### Step 5: Test Email Sending
Test if emails are working:

```bash
php artisan email:test your-email@gmail.com
```

## Alternative: Use Mailtrap (for Development)

If you want to test emails without sending real emails:

1. Sign up at https://mailtrap.io/
2. Get your SMTP credentials
3. Update .env:

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

## Troubleshooting

### Check Laravel Logs
Check if there are any email errors in the logs:

```bash
tail -f storage/logs/laravel.log
```

### Verify SMTP Connection
You can test the SMTP connection using:

```bash
php artisan tinker
```

Then in tinker:
```php
use Illuminate\Support\Facades\Mail;

Mail::raw('Test email', function ($message) {
    $message->to('your-email@gmail.com')
            ->subject('Test Email');
});
```

### Common Issues

1. **"Authentication failed"**
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2-Step Verification is enabled

2. **"Connection timeout"**
   - Check if port 587 is open on your firewall
   - Try port 465 with MAIL_ENCRYPTION=ssl

3. **"Relay access denied"**
   - Make sure you're using a Gmail account (not a Google Workspace account without proper setup)

## Production Setup

For production, consider using:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Amazon SES** (very affordable)
- **Postmark** (paid, but excellent deliverability)



