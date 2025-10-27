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
        .status-update {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0;
        }
        .status-confirmed {
            background-color: #28a745;
            color: white;
        }
        .status-cancelled {
            background-color: #dc3545;
            color: white;
        }
        .status-completed {
            background-color: #17a2b8;
            color: white;
        }
        .status-pending {
            background-color: #ffc107;
            color: #856404;
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
        .next-steps {
            background-color: #e8f5e8;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 Gabay Laguna</div>
            <h1>Booking Status Update</h1>
            <p>Your booking status has been updated</p>
        </div>

        <div class="status-update">
            <h3>Status Changed</h3>
            <p><strong>From:</strong> {{ ucfirst($oldStatus) }} → <strong>To:</strong> {{ ucfirst($newStatus) }}</p>
            <div class="status-badge status-{{ $newStatus }}">
                {{ ucfirst($newStatus) }}
            </div>
            <p style="margin-top: 15px;">{{ $message }}</p>
        </div>

        <div class="booking-details">
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
                <span class="detail-label">Destination:</span>
                <span class="detail-value">{{ $poi->name ?? 'Custom Location' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tour Date:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->tour_date)->format('F j, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($booking->end_time)->format('g:i A') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ $booking->duration_hours }} hour(s)</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Number of People:</span>
                <span class="detail-value">{{ $booking->number_of_people }}</span>
            </div>
        </div>

        @if($newStatus === 'confirmed')
        <div class="next-steps">
            <h4>🎉 Your booking is confirmed!</h4>
            <p>Great news! Your tour guide has confirmed your booking. Here's what you need to know:</p>
            <ul>
                <li>Make sure to arrive at the meeting point on time</li>
                <li>Bring any necessary items mentioned in your special requests</li>
                <li>Contact your tour guide if you have any last-minute questions</li>
                <li>Enjoy your tour experience!</li>
            </ul>
        </div>
        @elseif($newStatus === 'cancelled')
        <div class="next-steps">
            <h4>❌ Booking Cancelled</h4>
            <p>Your booking has been cancelled. If you made a payment, you should receive a refund within 3-5 business days.</p>
            <p>We're sorry for any inconvenience. Feel free to book another tour with us!</p>
        </div>
        @elseif($newStatus === 'completed')
        <div class="next-steps">
            <h4>✅ Tour Completed</h4>
            <p>Your tour has been completed! We hope you had a wonderful experience.</p>
            <p>Please take a moment to leave a review for your tour guide. Your feedback helps other tourists and improves our service.</p>
        </div>
        @endif

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/dashboard" class="cta-button">View My Bookings</a>
        </div>

        <div class="footer">
            <p>Thank you for choosing Gabay Laguna!</p>
            <p>If you have any questions, please contact us at support@gabaylaguna.com</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>
