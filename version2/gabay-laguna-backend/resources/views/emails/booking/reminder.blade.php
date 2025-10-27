<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tour Reminder - Gabay Laguna</title>
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
        .reminder-alert {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
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
        .preparation-tips {
            background-color: #e8f5e8;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .contact-info {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
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
            <h1>Tour Reminder</h1>
            <p>Your tour is happening tomorrow!</p>
        </div>

        <div class="reminder-alert">
            <h3>⏰ Reminder: Your tour is tomorrow!</h3>
            <p>Don't forget about your upcoming tour experience. Make sure you're prepared and ready to go!</p>
        </div>

        <div class="booking-details">
            <h3>📋 Tour Details</h3>
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
                <span class="detail-label">Date:</span>
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

        @if($booking->special_requests)
        <div class="preparation-tips">
            <h4>📝 Special Requests:</h4>
            <p>{{ $booking->special_requests }}</p>
        </div>
        @endif

        <div class="preparation-tips">
            <h4>🎒 Preparation Tips:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Check the weather forecast and dress appropriately</li>
                <li>Bring comfortable walking shoes</li>
                <li>Don't forget your camera or phone for photos</li>
                <li>Bring water and snacks if needed</li>
                <li>Arrive at the meeting point 10-15 minutes early</li>
                <li>Have your tour guide's contact information ready</li>
            </ul>
        </div>

        <div class="contact-info">
            <h4>📞 Contact Information</h4>
            <p><strong>Tour Guide:</strong> {{ $guide->name }}</p>
            <p><strong>Email:</strong> {{ $guide->email }}</p>
            @if($guide->phone)
            <p><strong>Phone:</strong> {{ $guide->phone }}</p>
            @endif
            <p style="margin-top: 15px;"><strong>Need to make changes?</strong> Contact your tour guide as soon as possible if you need to modify any details.</p>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/dashboard" class="cta-button">View Booking Details</a>
        </div>

        <div class="footer">
            <p>We hope you have an amazing tour experience!</p>
            <p>If you have any questions, please contact us at support@gabaylaguna.com</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>
