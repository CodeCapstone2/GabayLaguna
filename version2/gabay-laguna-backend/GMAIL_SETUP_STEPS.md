# Gmail Setup Steps for Real Email Testing

## 📧 **Step-by-Step Gmail Setup**

### **Step 1: Create Two Gmail Accounts**

Create these Gmail accounts for testing:

1. **Tourist Account**: `gabaylaguna.tourist@gmail.com`
2. **Guide Account**: `gabaylaguna.guide@gmail.com`

### **Step 2: Enable 2-Factor Authentication**

For each Gmail account:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Click **Get Started**
5. Follow the setup process (phone number verification)

### **Step 3: Generate App Passwords**

For each Gmail account:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **App passwords**
4. Select **Mail** as the app
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this for .env)

### **Step 4: Update Your .env File**

Replace your current email settings in `gabay-laguna-backend/.env`:

```env
# Real Gmail Configuration for Testing
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=gabaylaguna.tourist@gmail.com
MAIL_PASSWORD=your-16-character-app-password-here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=gabaylaguna.tourist@gmail.com
MAIL_FROM_NAME="Gabay Laguna"
APP_FRONTEND_URL=http://localhost:3000
```

### **Step 5: Test Email Sending**

Run the test script:
```bash
cd gabay-laguna-backend
php test-email.php
```

## 🧪 **Testing the Full Email Flow**

### **Test 1: Basic Email Sending**
1. Run `php test-email.php`
2. Check both Gmail accounts
3. Verify emails are received

### **Test 2: Booking Flow**
1. Register as tourist with `gabaylaguna.tourist@gmail.com`
2. Register as guide with `gabaylaguna.guide@gmail.com`
3. Create a booking
4. Check both email accounts for notifications

### **Test 3: Status Updates**
1. Guide updates booking status
2. Check tourist email for status update
3. Verify email content and links

## 📱 **What You Should See**

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
3. Check .env file configuration
4. Try running `php artisan config:clear`

### **If emails go to spam:**
1. Mark as "Not Spam" in Gmail
2. Add sender to contacts
3. Check Gmail filters

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

## 🎯 **Benefits of Real Email Testing**

- ✅ See actual email appearance
- ✅ Test email delivery reliability
- ✅ Verify template rendering
- ✅ Check mobile responsiveness
- ✅ Test email links and buttons
- ✅ Ensure professional appearance
- ✅ Verify spam folder behavior

## 📝 **Next Steps After Setup**

1. ✅ Create both Gmail accounts
2. ✅ Set up App Passwords
3. ✅ Update .env file
4. ✅ Test email sending
5. ✅ Test booking flow
6. ✅ Verify all notifications work

---

**Using real Gmail accounts will give you the most accurate testing experience and ensure your email notifications work perfectly!**
