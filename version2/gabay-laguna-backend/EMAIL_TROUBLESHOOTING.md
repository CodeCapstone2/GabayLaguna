# Email Notification Troubleshooting

## 🔍 **Issue: Guide Not Receiving Email Notifications**

The problem is that your `.env` file is still using the old Mailpit configuration instead of Gmail.

## 🔧 **Step 1: Update Your .env File**

Open your `.env` file and replace the mail configuration section with:

```env
# Gmail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=gabaylaguna@gmail.com
MAIL_PASSWORD=mfxw lpuh evnm ivki
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=gabaylaguna@gmail.com
MAIL_FROM_NAME="Gabay Laguna"
APP_FRONTEND_URL=http://localhost:3000
```

## 🧪 **Step 2: Test Email Configuration**

After updating your .env file, run:

```bash
php test-email.php
```

## 📱 **Step 3: Test the Full Booking Flow**

1. **Register as tourist** with `gabaylaguna.tourist@gmail.com`
2. **Register as guide** with `gabaylaguna.guide@gmail.com`
3. **Create a booking** through your app
4. **Check both email accounts** for notifications

## 🔍 **Step 4: Check Logs**

If emails still don't work, check the logs:

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Or check the log file directly
type storage\logs\laravel.log
```

## 🔧 **Step 5: Clear Cache**

After updating .env, clear the configuration cache:

```bash
php artisan config:clear
php artisan cache:clear
```

## ✅ **What You Should See**

### **Tourist Account (`gabaylaguna.tourist@gmail.com`)**
- ✅ **Booking Confirmation** emails from `gabaylaguna@gmail.com`
- ✅ **Status Update** emails from `gabaylaguna@gmail.com`
- ✅ **Payment Confirmation** emails from `gabaylaguna@gmail.com`

### **Guide Account (`gabaylaguna.guide@gmail.com`)**
- ✅ **New Booking Request** emails from `gabaylaguna@gmail.com`
- ✅ **Payment Received** emails from `gabaylaguna@gmail.com`

## 🚨 **Common Issues**

### **Issue 1: Still using Mailpit**
- **Problem**: .env file not updated
- **Solution**: Update .env file with Gmail configuration

### **Issue 2: App Password not working**
- **Problem**: Wrong App Password or 2FA not enabled
- **Solution**: Regenerate App Password

### **Issue 3: Emails going to spam**
- **Problem**: Gmail filtering
- **Solution**: Check spam folder, mark as not spam

### **Issue 4: SMTP connection failed**
- **Problem**: Firewall or network issues
- **Solution**: Check internet connection, try different port

## 📊 **Debug Steps**

1. **Check .env file** - Make sure Gmail configuration is correct
2. **Test email sending** - Run `php test-email.php`
3. **Check logs** - Look at `storage/logs/laravel.log`
4. **Clear cache** - Run `php artisan config:clear`
5. **Test booking flow** - Create a booking and check emails

## 🎯 **Expected Results**

After fixing the .env file, you should see:
1. **Test emails** in both Gmail accounts
2. **Beautiful HTML emails** with proper formatting
3. **Working links** in email content
4. **Mobile-friendly** email design
5. **Professional appearance** with Gabay Laguna branding

---

**The main issue is that your .env file needs to be updated with the Gmail configuration!** 📧✨
