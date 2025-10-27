# Email Notification Setup Guide

## Overview
The Gabay Laguna application includes a comprehensive email notification system that automatically sends emails to tour guides when tourists make bookings. This guide explains how to configure and use the email system.

## Features
- ✅ **Tour Guide Notifications**: Tour guides receive email notifications when tourists book their services
- ✅ **Booking Confirmations**: Tourists receive confirmation emails when they make bookings
- ✅ **Status Updates**: Both parties receive notifications when booking status changes
- ✅ **Payment Confirmations**: Email notifications for successful payments
- ✅ **Tour Reminders**: Automated reminders before tour dates

## Email Templates Created
The following email templates have been created in `resources/views/emails/`:

### Booking Emails
- `emails/booking/confirmation.blade.php` - Sent to tourists when booking is created
- `emails/booking/new-request.blade.php` - Sent to tour guides when they receive new booking requests
- `emails/booking/status-update.blade.php` - Sent when booking status changes
- `emails/booking/reminder.blade.php` - Tour reminders for tourists
- `emails/booking/guide-reminder.blade.php` - Tour reminders for guides

### Payment Emails
- `emails/payment/confirmation.blade.php` - Payment confirmation for tourists
- `emails/payment/received.blade.php` - Payment received notification for guides

## Configuration

### 1. Environment Variables
Add these variables to your `.env` file:

```env
# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@gabaylaguna.com
MAIL_FROM_NAME="Gabay Laguna"

# Frontend URL (for email links)
APP_FRONTEND_URL=http://localhost:3000
```

### 2. SMTP Providers
You can use any SMTP provider:

#### Gmail
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

#### SendGrid
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
```

#### Mailgun
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_SECRET=your-mailgun-secret
```

## How It Works

### 1. When a Tourist Books a Tour Guide
1. Tourist submits booking request
2. System creates booking record
3. **Email sent to tour guide** with booking details
4. **Email sent to tourist** with confirmation

### 2. When Tour Guide Updates Status
1. Guide confirms/declines booking
2. System updates booking status
3. **Email sent to tourist** about status change
4. **Email sent to guide** (if applicable)

### 3. Payment Notifications
1. Tourist completes payment
2. **Email sent to tourist** with payment confirmation
3. **Email sent to guide** that payment was received

## Testing the Email System

### 1. Test Email Configuration
```bash
# Test if emails are working
php artisan tinker
>>> Mail::raw('Test email', function($message) { $message->to('test@example.com')->subject('Test'); });
```

### 2. Test Booking Notifications
1. Create a test booking through the API
2. Check the logs: `storage/logs/laravel.log`
3. Verify emails are sent (check your email provider's logs)

### 3. Check Email Templates
```bash
# Clear view cache if needed
php artisan view:clear
php artisan config:clear
```

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SMTP credentials
   - Verify firewall settings
   - Check email provider limits

2. **Templates not found**
   - Run `php artisan view:clear`
   - Check file permissions
   - Verify template paths

3. **Emails going to spam**
   - Configure SPF records
   - Set up DKIM
   - Use reputable email providers

### Debug Mode
Enable debug mode in `.env`:
```env
MAIL_MAILER=log
```
This will log emails to `storage/logs/laravel.log` instead of sending them.

## Email Content Customization

### Modifying Templates
All email templates are located in `resources/views/emails/`. You can customize:
- Colors and styling
- Content and messaging
- Company branding
- Call-to-action buttons

### Adding New Notifications
1. Create new template in `resources/views/emails/`
2. Add method to `NotificationService`
3. Call the method from appropriate controller

## Security Considerations

1. **Email Validation**: Always validate email addresses
2. **Rate Limiting**: Implement rate limiting for email sending
3. **Content Filtering**: Sanitize user input in email content
4. **Authentication**: Use secure SMTP credentials

## Monitoring

### Log Monitoring
Monitor email sending in:
- `storage/logs/laravel.log`
- Email provider dashboards
- Application monitoring tools

### Metrics to Track
- Email delivery rates
- Bounce rates
- Open rates (if using tracking)
- User engagement

## Support

For issues with email notifications:
1. Check the logs first
2. Verify SMTP configuration
3. Test with a simple email
4. Contact support if needed

---

**Note**: This email system is already integrated into the booking flow. Tour guides will automatically receive email notifications when tourists book their services.
