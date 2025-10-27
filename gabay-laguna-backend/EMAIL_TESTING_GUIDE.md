# Email Notification Testing Guide

## 🧪 **How to Test Email Notifications**

### **Method 1: Quick Email Test**

1. **Configure your `.env` file** with SMTP settings:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@gabaylaguna.com
MAIL_FROM_NAME="Gabay Laguna"
```

2. **Test email sending:**
```bash
cd gabay-laguna-backend
php test-email.php
```

### **Method 2: Test with Laravel Tinker**

```bash
cd gabay-laguna-backend
php artisan tinker
```

Then run:
```php
Mail::raw('Test email', function($message) { 
    $message->to('your-email@example.com')->subject('Test'); 
});
```

### **Method 3: Debug Mode (Log Emails)**

For testing without sending real emails, set in `.env`:
```env
MAIL_MAILER=log
```

This will log emails to `storage/logs/laravel.log` instead of sending them.

## 📧 **Email Templates Available**

### **1. Booking Confirmation (Tourist)**
- **Template**: `emails/booking/confirmation.blade.php`
- **Triggered**: When tourist makes a booking
- **Content**: Booking details, guide info, next steps

### **2. New Booking Request (Tour Guide)**
- **Template**: `emails/booking/new-request.blade.php`
- **Triggered**: When tour guide receives new booking
- **Content**: Tourist info, booking details, action required

### **3. Status Update (Both Parties)**
- **Template**: `emails/booking/status-update.blade.php`
- **Triggered**: When booking status changes
- **Content**: Status change notification, next steps

### **4. Payment Confirmation (Tourist)**
- **Template**: `emails/payment/confirmation.blade.php`
- **Triggered**: When payment is successful
- **Content**: Payment details, booking confirmation

### **5. Payment Received (Tour Guide)**
- **Template**: `emails/payment/received.blade.php`
- **Triggered**: When guide receives payment
- **Content**: Payment amount, earnings info

### **6. Tour Reminders**
- **Templates**: `emails/booking/reminder.blade.php` & `emails/booking/guide-reminder.blade.php`
- **Triggered**: Before tour date
- **Content**: Reminder details, preparation tips

## 🔄 **How Email Notifications Work**

### **Automatic Flow:**

1. **Tourist Books Guide** → 
   - Tourist gets confirmation email
   - Guide gets "New Booking Request" email

2. **Guide Updates Status** → 
   - Tourist gets status update email
   - System logs the change

3. **Payment Processed** → 
   - Tourist gets payment confirmation
   - Guide gets payment received notification

4. **Before Tour Date** → 
   - Both get reminder emails

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Emails not sending:**
   - Check SMTP credentials
   - Verify firewall settings
   - Check email provider limits

2. **Templates not found:**
   ```bash
   php artisan view:clear
   php artisan config:clear
   ```

3. **Emails going to spam:**
   - Configure SPF records
   - Set up DKIM
   - Use reputable email providers

### **Debug Steps:**

1. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Test with log driver:**
   ```env
   MAIL_MAILER=log
   ```

3. **Verify SMTP connection:**
   ```bash
   php artisan tinker
   Mail::raw('Test', function($m) { $m->to('test@example.com'); });
   ```

## 📊 **Email Provider Setup**

### **Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in `.env`

### **SendGrid Setup:**
1. Create SendGrid account
2. Generate API key
3. Use API key as password

### **Mailgun Setup:**
1. Create Mailgun account
2. Get domain credentials
3. Use domain settings

## ✅ **Testing Checklist**

- [ ] SMTP credentials configured
- [ ] Test email sent successfully
- [ ] Email templates loading correctly
- [ ] Booking flow triggers emails
- [ ] Status updates send emails
- [ ] Payment confirmations work
- [ ] Reminder emails scheduled

## 🚀 **Production Setup**

For production, consider:
- Using professional email services (SendGrid, Mailgun)
- Setting up SPF/DKIM records
- Monitoring email delivery rates
- Implementing rate limiting
- Setting up email analytics

---

**The email notification system is ready to use!** Just configure your SMTP settings and tour guides will automatically receive email notifications when tourists book their services.
