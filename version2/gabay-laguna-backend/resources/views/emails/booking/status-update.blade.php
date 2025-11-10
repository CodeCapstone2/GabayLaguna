<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Status Update - Gabay Laguna</title>
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
        .status-box {
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .status-confirmed {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .status-cancelled, .status-rejected {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .status-completed {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        .booking-details {
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
            <h1>Booking Status Update</h1>
        </div>

        @if($newStatus === 'confirmed')
        <div class="status-box status-confirmed">
            <h3>✅ Booking Confirmed!</h3>
            <p>Great news! Your booking has been confirmed by the tour guide.</p>
        </div>
        @elseif($newStatus === 'cancelled')
        <div class="status-box status-cancelled">
            <h3>❌ Booking Cancelled</h3>
            <p>Your booking has been cancelled.</p>
        </div>
        @elseif($newStatus === 'rejected')
        <div class="status-box status-rejected">
            <h3>❌ Booking Request Rejected</h3>
            <p>Your booking request has been rejected by the tour guide.</p>
        </div>
        @elseif($newStatus === 'completed')
        <div class="status-box status-completed">
            <h3>🎉 Tour Completed!</h3>
            <p>Your tour has been completed. We hope you had a great experience!</p>
        </div>
        @else
        <div class="status-box">
            <h3>📋 Status Updated</h3>
            <p>Your booking status has been updated to: <strong>{{ ucfirst($newStatus) }}</strong></p>
        </div>
        @endif

        @php
            $recipient = $recipient ?? 'tourist';
            $isTourist = $recipient === 'tourist';
            $isGuide = $recipient === 'guide';
        @endphp

        @if(isset($statusMessage))
        <div class="info-box">
            <p><strong>{{ $statusMessage }}</strong></p>
        </div>
        @endif

        @if($isGuide && $newStatus === 'confirmed')
        <div class="info-box">
            <h4>📋 Next Steps</h4>
            <p>Please prepare for the tour and ensure you're available at the scheduled time.</p>
            <p>You can contact the tourist if you need to discuss any details about the tour.</p>
        </div>
        @elseif($isGuide && $newStatus === 'cancelled')
        <div class="info-box">
            <h4>ℹ️ Important Information</h4>
            <p>This booking has been cancelled by the tourist.</p>
            @if($booking->payment && $booking->payment->status === 'completed')
            <p>If the cancellation was within 24 hours of booking, a refund may have been processed automatically.</p>
            @endif
        </div>
        @elseif($isGuide && $newStatus === 'rejected')
        <div class="info-box">
            <h4>📝 Note</h4>
            <p>The tourist has been notified of your decision. They may choose to book with another guide.</p>
        </div>
        @endif

        <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{ $booking->id }}</span>
            </div>
            @if($isTourist)
            <div class="detail-row">
                <span class="detail-label">Tour Guide:</span>
                <span class="detail-value">{{ $guide->name }}</span>
            </div>
            @else
            <div class="detail-row">
                <span class="detail-label">Tourist:</span>
                <span class="detail-value">{{ $tourist->name }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">{{ $booking->pointOfInterest->name ?? 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->tour_date)->format('F j, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">
                    @if($booking->start_time && $booking->end_time)
                        {{ \Carbon\Carbon::parse($booking->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($booking->end_time)->format('g:i A') }}
                    @elseif($booking->tour_time)
                        {{ $booking->tour_time }}
                    @else
                        N/A
                    @endif
                </span>
            </div>
            @if($booking->total_amount)
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₱{{ number_format($booking->total_amount, 2) }}</span>
            </div>
            @endif
        </div>

        @if($newStatus === 'confirmed')
        <div class="info-box">
            <h4>🎯 What's Next?</h4>
            <p>Your booking is now confirmed! Please prepare for your tour and be ready at the scheduled time.</p>
            <p>You'll receive a reminder email before your tour date.</p>
        </div>
        @elseif($newStatus === 'cancelled')
        <div class="info-box">
            <h4>💡 Important Information</h4>
            <p>If you cancelled within 24 hours of booking and payment was made, a refund will be processed automatically.</p>
            <p>Refunds may take 5-7 business days to appear in your account.</p>
        </div>
        @elseif($newStatus === 'rejected')
        <div class="info-box">
            <h4>💡 What Can You Do?</h4>
            <p>We're sorry this booking was rejected. You can:</p>
            <ul style="text-align: left;">
                <li>Book with another tour guide</li>
                <li>Try booking for a different date or time</li>
                <li>Contact support if you have questions</li>
            </ul>
        </div>
        @elseif($newStatus === 'completed')
        <div class="info-box">
            <h4>⭐ Share Your Experience</h4>
            <p>We'd love to hear about your tour experience! Please leave a review to help other travelers and support your tour guide.</p>
        </div>
        @endif

        <div style="text-align: center;">
            @if($isTourist)
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/my-bookings" class="cta-button">View My Bookings</a>
            @else
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/guide/bookings" class="cta-button">View My Bookings</a>
            @endif
        </div>

        <div class="footer">
            <p>Thank you for using Gabay Laguna!</p>
            <p>If you have any questions, please contact us at support@gabaylaguna.com</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>

