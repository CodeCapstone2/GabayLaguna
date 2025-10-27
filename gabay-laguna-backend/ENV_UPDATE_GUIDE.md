# Update .env File for Gmail Configuration

## 📧 **Your Gmail Configuration**

**App Password:** `mfxw lpuh evnm ivki`
**Gmail Account:** `gabaylaguna@gmail.com`

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
cd gabay-laguna-backend
php test-email.php
```

## 📱 **Step 3: Test the Full Booking Flow**

1. **Register as tourist** with `gabaylaguna.tourist@gmail.com`
2. **Register as guide** with `gabaylaguna.guide@gmail.com`
3. **Create a booking** through your app
4. **Check both email accounts** for notifications

## ✅ **What You Should See**

### **Tourist Account (`gabaylaguna.tourist@gmail.com`)**
- ✅ **Booking Confirmation** emails from `gabaylaguna@gmail.com`
- ✅ **Status Update** emails from `gabaylaguna@gmail.com`
- ✅ **Payment Confirmation** emails from `gabaylaguna@gmail.com`

### **Guide Account (`gabaylaguna.guide@gmail.com`)**
- ✅ **New Booking Request** emails from `gabaylaguna@gmail.com`
- ✅ **Payment Received** emails from `gabaylaguna@gmail.com`

## 🔧 **Troubleshooting**

### **If emails don't send:**
1. Check App Password is correct: `mfxw lpuh evnm ivki`
2. Verify 2FA is enabled on `gabaylaguna@gmail.com`
3. Try `php artisan config:clear`

### **If emails go to spam:**
1. Mark as "Not Spam" in Gmail
2. Add `gabaylaguna@gmail.com` to contacts

## 🎯 **Expected Results**

After setup, you should see:
1. **Test emails** in both Gmail accounts
2. **Beautiful HTML emails** with proper formatting
3. **Working links** in email content
4. **Mobile-friendly** email design
5. **Professional appearance** with Gabay Laguna branding

---

**Your email notification system is ready to test!** 📧✨
