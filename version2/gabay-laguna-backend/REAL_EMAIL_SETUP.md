# Real Email Setup for Testing

## 📧 **Setting Up Real Gmail Accounts for Testing**

### **Step 1: Create Test Gmail Accounts**

Create two Gmail accounts for testing:

1. **Tourist Account**: `gabaylaguna.tourist@gmail.com`
2. **Guide Account**: `gabaylaguna.guide@gmail.com`

### **Step 2: Configure Gmail for SMTP**

For each Gmail account:

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Enable it

2. **Generate App Password**
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

### **Step 3: Update .env File**

Replace your dummy emails with real Gmail accounts:

```env
# Real Gmail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=gabaylaguna.tourist@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=gabaylaguna.tourist@gmail.com
MAIL_FROM_NAME="Gabay Laguna"
APP_FRONTEND_URL=http://localhost:3000
```

### **Step 4: Test Real Email Sending**

Run the test script:
```bash
cd gabay-laguna-backend
php test-email.php
```

## 🧪 **Testing Scenarios**

### **Scenario 1: Tourist Books Guide**
1. Use `gabaylaguna.tourist@gmail.com` as tourist
2. Use `gabaylaguna.guide@gmail.com` as guide
3. Create booking through app
4. Check both email accounts for notifications

### **Scenario 2: Guide Updates Status**
1. Guide logs in and updates booking status
2. Tourist should receive status update email
3. Check both email accounts

### **Scenario 3: Payment Processing**
1. Process payment for booking
2. Both accounts should receive payment emails
3. Verify email content and links

## 📱 **Email Testing Checklist**

- [ ] Tourist account receives booking confirmation
- [ ] Guide account receives new booking request
- [ ] Status updates send emails to both parties
- [ ] Payment confirmations work
- [ ] Email templates display correctly
- [ ] Links in emails work properly
- [ ] Mobile-friendly design works

## 🔧 **Troubleshooting Real Emails**

### **If Gmail blocks emails:**
1. Check "Less secure app access" (if using regular password)
2. Use App Password instead
3. Check Gmail security settings

### **If emails go to spam:**
1. Mark emails as "Not Spam"
2. Add sender to contacts
3. Check Gmail filters

### **If SMTP fails:**
1. Verify App Password is correct
2. Check 2FA is enabled
3. Try different SMTP settings

## 📊 **Expected Email Flow**

### **When Tourist Books:**
1. **Tourist Email** → "Booking Confirmation - Gabay Laguna"
2. **Guide Email** → "New Booking Request - Gabay Laguna"

### **When Guide Updates Status:**
1. **Tourist Email** → "Booking Status Update - Gabay Laguna"

### **When Payment is Processed:**
1. **Tourist Email** → "Payment Confirmation - Gabay Laguna"
2. **Guide Email** → "Payment Received - Gabay Laguna"

## 🎯 **Benefits of Real Email Testing**

- ✅ See actual email appearance
- ✅ Test email delivery
- ✅ Verify template rendering
- ✅ Check mobile responsiveness
- ✅ Test email links and buttons
- ✅ Ensure professional appearance

## 📝 **Next Steps**

1. Create the two Gmail accounts
2. Set up App Passwords
3. Update .env file
4. Test email sending
5. Test the full booking flow
6. Verify all email notifications work

---

**Using real Gmail accounts will give you the most accurate testing experience and ensure your email notifications work perfectly in production!**
