<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled - Refund Issued - Gabay Laguna</title>
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
        .cancellation-notice {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
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
            background-color: #dc3545;
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
            background-color: #e8f5e8;
            border: 1px solid #c3e6cb;
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
            <h1>Booking Cancelled</h1>
            <p>A booking has been cancelled and a refund has been issued</p>
        </div>

        <div class="cancellation-notice">
            <h3>⚠️ Booking Cancelled</h3>
            <p>The tourist has cancelled their booking, and a refund has been processed.</p>
        </div>

        <div class="payment-details">
            <h3>💰 Refund Details</h3>
            <div class="detail-row">
                <span class="detail-label">Refund Amount:</span>
                <span class="detail-value">₱{{ number_format($refund_amount, 2) }}</span>
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
            Amount Refunded: ₱{{ number_format($refund_amount, 2) }}
        </div>

        <div class="payment-details">
            <h3>📋 Booking Details</h3>
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{ $booking->id }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tourist:</span>
                <span class="detail-value">{{ $tourist->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tour Date:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->tour_date)->format('F j, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($booking->end_time)->format('g:i A') }}</span>
            </div>
        </div>

        <div class="info-box">
            <h4>📝 Important Information</h4>
            <p><strong>24-Hour Cancellation Policy:</strong> This booking was cancelled within 24 hours of creation, which qualifies for a full refund according to our policy.</p>
            <p>The refund has been processed and will be credited back to the tourist's original payment method within 5-7 business days.</p>
            <p>This booking is now cancelled and your availability has been freed up for this time slot.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <p><strong>What's Next?</strong></p>
            <p>Your calendar has been updated and this time slot is now available for new bookings.</p>
            <p>We encourage you to continue providing excellent service to maintain good ratings!</p>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/guide/dashboard" class="cta-button">View My Bookings</a>
        </div>

        <div class="footer">
            <p>Thank you for being an amazing tour guide!</p>
            <p>If you have any questions, please contact us at support@gabaylaguna.com</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>



