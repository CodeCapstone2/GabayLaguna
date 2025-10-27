# Xendit Integration Setup Guide

This guide explains how to set up Xendit payment integration for the Gabay Laguna project.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Xendit Configuration
XENDIT_SECRET_KEY=your_xendit_secret_key_here
XENDIT_PUBLIC_KEY=your_xendit_public_key_here
XENDIT_WEBHOOK_TOKEN=your_webhook_token_here
XENDIT_BASE_URL=https://api.xendit.co
XENDIT_MODE=sandbox
```

## Getting Xendit Credentials

1. **Sign up for Xendit**: Visit [xendit.co](https://xendit.co) and create an account
2. **Get API Keys**: 
   - Go to your Xendit Dashboard
   - Navigate to Settings > API Keys
   - Copy your Secret Key and Public Key
3. **Set up Webhook**:
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payments/xendit/webhook`
   - Copy the webhook token

## Payment Methods Supported

### 1. Xendit Invoice
- **Payment Methods**: GCash, PayMaya, Credit Cards, Bank Transfer
- **Features**: 
  - Email notifications
  - 24-hour expiration
  - Multiple payment options
  - Automatic redirect after payment

### 2. Virtual Account
- **Supported Banks**: BCA, BNI, BRI, Mandiri, Permata, BSI
- **Features**:
  - Unique account number per booking
  - 24-hour expiration
  - Single-use accounts
  - Bank transfer payment

## API Endpoints

### Create Invoice
```
POST /api/payments/xendit/invoice
Content-Type: application/json
Authorization: Bearer {token}

{
  "booking_id": 123
}
```

### Create Virtual Account
```
POST /api/payments/xendit/virtual-account
Content-Type: application/json
Authorization: Bearer {token}

{
  "booking_id": 123,
  "bank_code": "BCA"
}
```

### Webhook Handler
```
POST /api/payments/xendit/webhook
Content-Type: application/json
x-callback-token: {webhook_token}

{
  "event": "invoice.paid",
  "data": { ... }
}
```

## Testing

### Sandbox Mode
- Set `XENDIT_MODE=sandbox` in your `.env` file
- Use test API keys from Xendit dashboard
- Test payments will not process real money

### Test Cards (Sandbox)
- **Visa**: 4000000000000002
- **Mastercard**: 5200000000000007
- **Expiry**: Any future date
- **CVV**: Any 3 digits

## Production Setup

1. **Switch to Live Mode**:
   ```env
   XENDIT_MODE=live
   ```

2. **Update API Keys**: Use your live API keys from Xendit dashboard

3. **Update Webhook URL**: Point to your production domain

4. **Test Thoroughly**: Verify all payment flows work correctly

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Verify webhook signatures in production
- Implement proper error handling and logging

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check webhook URL is accessible
   - Verify webhook token matches
   - Check server logs for errors

2. **Payment not completing**:
   - Verify API keys are correct
   - Check if in correct mode (sandbox/live)
   - Review Xendit dashboard for error details

3. **Virtual Account not created**:
   - Ensure bank code is supported
   - Check account limits in Xendit dashboard
   - Verify sufficient balance for fees

### Support

- Xendit Documentation: [docs.xendit.co](https://docs.xendit.co)
- Xendit Support: Available through dashboard
- Project Issues: Check project documentation or contact development team



