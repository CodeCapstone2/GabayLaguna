<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Processed - Gabay Laguna</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2E8B57;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2E8B57;
            margin-bottom: 10px;
        }
        .refund-success {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .payment-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #495057;
        }
        .detail-value {
            color: #6c757d;
        }
        .amount-highlight {
            background-color: #2E8B57;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2E8B57;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .info-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 Gabay Laguna</div>
            <h1>Refund Processed</h1>
            <p>Your refund has been successfully processed!</p>
        </div>

        <div class="refund-success">
            <h3>✅ Refund Processed Successfully!</h3>
            <p>Your refund request has been processed and approved.</p>
        </div>

        <div class="payment-details">
            <h3>💰 Refund Details</h3>
            <div class="detail-row">
                <span class="detail-label">Refund ID:</span>
                <span class="detail-value">{{ $refund_id ?? 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Original Transaction ID:</span>
                <span class="detail-value">{{ $payment->transaction_id ?? 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ ucfirst($payment->payment_method ?? 'Online Payment') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Refund Date:</span>
                <span class="detail-value">{{ \Carbon\Carbon::now()->format('F j, Y g:i A') }}</span>
            </div>
        </div>

        <div class="amount-highlight">
            Refund Amount: ₱{{ number_format($refund_amount, 2) }}
        </div>

        <div class="payment-details">
            <h3>📋 Booking Details</h3>
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{ $booking->id }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tour Guide:</span>
                <span class="detail-value">{{ $guide->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tour Date:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->tour_date)->format('F j, Y') }}</span>
            </div>
        </div>

        <div class="info-box">
            <h4>⏱️ Refund Processing Time</h4>
            <p><strong>Important:</strong> The refund amount will be credited back to your original payment method within <strong>5-7 business days</strong>.</p>
            <p>If you don't see the refund in your account after this period, please contact our support team.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <p><strong>24-Hour Cancellation Policy</strong></p>
            <p>This refund was processed because the booking was cancelled within 24 hours of creation, in accordance with our refund policy.</p>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/dashboard" class="cta-button">View My Bookings</a>
        </div>

        <div class="footer">
            <p>Thank you for using Gabay Laguna!</p>
            <p>If you have any questions about this refund, please contact us at support@gabaylaguna.com</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>



