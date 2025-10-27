# Gmail Configuration Guide

## 🔐 **Step 1: Set Up Gmail Security**

For both `gabaylaguna.tourist@gmail.com` and `gabaylaguna.guide@gmail.com`:

### **Enable 2-Factor Authentication:**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Click **Get Started**
5. Follow the setup process (requires phone number)

### **Generate App Passwords:**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **App passwords**
4. Select **Mail** as the app
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this for .env)

## 📧 **Step 2: Update Your .env File**

Replace the mail configuration section in your `.env` file with:

```env
# Gmail Configuration for Real Email Testing
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=gabaylaguna.tourist@gmail.com
MAIL_PASSWORD=YOUR_16_CHARACTER_APP_PASSWORD_HERE
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=gabaylaguna.tourist@gmail.com
MAIL_FROM_NAME="Gabay Laguna"

# Frontend URL for email links
APP_FRONTEND_URL=http://localhost:3000
```

## 🧪 **Step 3: Test Email Configuration**

After updating your .env file, run:

```bash
php test-email.php
```

This will send test emails to both Gmail accounts.

## 📱 **Step 4: Test the Full Booking Flow**

1. **Register as tourist** with `gabaylaguna.tourist@gmail.com`
2. **Register as guide** with `gabaylaguna.guide@gmail.com`
3. **Create a booking** through your app
4. **Check both email accounts** for notifications

## ✅ **What You Should See**

### **Tourist Email (gabaylaguna.tourist@gmail.com)**
- ✅ Booking confirmation emails
- ✅ Status update emails
- ✅ Payment confirmation emails
- ✅ Tour reminder emails

### **Guide Email (gabaylaguna.guide@gmail.com)**
- ✅ New booking request emails
- ✅ Payment received emails
- ✅ Tour reminder emails

## 🔧 **Troubleshooting**

### **If emails don't send:**
1. Check App Password is correct (16 characters)
2. Verify 2FA is enabled
3. Try `php artisan config:clear`

### **If emails go to spam:**
1. Mark as "Not Spam" in Gmail
2. Add sender to contacts

### **If SMTP connection fails:**
1. Verify Gmail credentials
2. Check firewall settings
3. Try different SMTP settings

## 📊 **Expected Results**

After setup, you should see:
1. **Test emails** in both Gmail accounts
2. **Beautiful HTML emails** with proper formatting
3. **Working links** in email content
4. **Mobile-friendly** email design
5. **Professional appearance** with Gabay Laguna branding

---

**Once configured, your email notifications will work with real Gmail accounts!**
