<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Request - Gabay Laguna</title>
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
        .notification-box {
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
        .action-required {
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
            <h1>New Booking Request</h1>
        </div>

        <div class="notification-box">
            <h3>📬 New Booking Request!</h3>
            <p>Hello {{ $guide->name }},</p>
            <p>You have received a new booking request from a tourist.</p>
        </div>

        <div class="action-required">
            <h4>⚠️ Action Required</h4>
            <p>Please review this booking request and respond by accepting or rejecting it in your dashboard.</p>
        </div>

        <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{ $booking->id }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tourist Name:</span>
                <span class="detail-value">{{ $tourist->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tourist Email:</span>
                <span class="detail-value">{{ $tourist->email }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">{{ isset($poi) && $poi ? $poi->name : 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($booking->tour_date)->format('F j, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">
                    @if(isset($booking->start_time) && isset($booking->end_time))
                        {{ \Carbon\Carbon::parse($booking->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($booking->end_time)->format('g:i A') }}
                    @elseif(isset($booking->tour_time))
                        {{ $booking->tour_time }}
                    @else
                        N/A
                    @endif
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ $booking->duration_hours ?? 'N/A' }} hour(s)</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Number of People:</span>
                <span class="detail-value">{{ $booking->number_of_people ?? 1 }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value" style="color: #2E8B57; font-weight: bold;">₱{{ number_format($booking->total_amount ?? 0, 2) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">{{ ucfirst($booking->status ?? 'Pending') }}</span>
            </div>
            @if(isset($booking->special_requests) && !empty($booking->special_requests))
            <div class="detail-row">
                <span class="detail-label">Special Requests:</span>
                <span class="detail-value">{{ $booking->special_requests }}</span>
            </div>
            @endif
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <p><strong>What should you do?</strong></p>
            <p>1. Review the booking details above</p>
            <p>2. Check your availability for the requested date and time</p>
            <p>3. Accept or reject the booking in your dashboard</p>
            <p>The tourist will be notified of your decision.</p>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/guide/bookings" class="cta-button">View & Respond to Booking</a>
        </div>

        <div class="footer">
            <p>Thank you for being an amazing tour guide!</p>
            <p>If you have any questions, please contact us at support@gabaylaguna.com</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>

