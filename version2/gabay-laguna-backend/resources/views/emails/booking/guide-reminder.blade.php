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
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
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
        .tourist-info {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .earnings-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 Gabay Laguna</div>
            <h1>Tour Reminder</h1>
            <p>You have a tour tomorrow!</p>
        </div>

        <div class="reminder-alert">
            <h3>⏰ Reminder: You have a tour tomorrow!</h3>
            <p>Make sure you're prepared for your upcoming tour. Your tourist is counting on you!</p>
        </div>

        <div class="tourist-info">
            <h3>👤 Tourist Information</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ $tourist->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ $tourist->email }}</span>
            </div>
            @if($tourist->phone)
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">{{ $tourist->phone }}</span>
            </div>
            @endif
        </div>

        <div class="booking-details">
            <h3>📋 Tour Details</h3>
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{ $booking->id }}</span>
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

        <div class="earnings-info">
            <h4>💰 Your Earnings</h4>
            <p style="font-size: 24px; font-weight: bold; color: #2E8B57; margin: 10px 0;">
                ₱{{ number_format($booking->total_amount, 2) }}
            </p>
            <p>This amount will be credited to your account after the tour is completed.</p>
        </div>

        <div class="preparation-tips">
            <h4>🎯 Preparation Checklist:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Review the tourist's special requests</li>
                <li>Plan your route and key points to cover</li>
                <li>Check the weather forecast</li>
                <li>Prepare any materials or equipment needed</li>
                <li>Arrive at the meeting point 10-15 minutes early</li>
                <li>Have your contact information ready for the tourist</li>
                <li>Bring water and any necessary supplies</li>
                <li>Review the destination details and interesting facts</li>
            </ul>
        </div>

        <div class="preparation-tips">
            <h4>💡 Pro Tips for Tour Guides:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Be enthusiastic and engaging throughout the tour</li>
                <li>Share interesting stories and local knowledge</li>
                <li>Take photos of the group (with permission)</li>
                <li>Be flexible and adapt to the group's interests</li>
                <li>Ensure everyone's safety at all times</li>
                <li>Encourage questions and interaction</li>
                <li>End on time and thank the group</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/guide/dashboard" class="cta-button">View Booking Details</a>
        </div>

        <div class="footer">
            <p>Thank you for being an amazing tour guide!</p>
            <p>If you have any questions, please contact us at support@gabaylaguna.com</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>
