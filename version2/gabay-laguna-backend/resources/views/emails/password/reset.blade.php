<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request - Gabay Laguna</title>
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
        .reset-message {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
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
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
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
            <h1>Password Reset Request</h1>
        </div>

        <div class="reset-message">
            <h3>Hello {{ $user->name }},</h3>
            <p>We received a request to reset your password for your Gabay Laguna account.</p>
            <p>Click the button below to reset your password. This link will expire in 60 minutes.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $resetUrl }}" class="cta-button">Reset Password</a>
        </div>

        <div class="info-box">
            <h4>⚠️ Important Information</h4>
            <p><strong>If the button doesn't work:</strong> Copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666;">{{ $resetUrl }}</p>
            <p><strong>This link will expire in 60 minutes</strong> for security reasons.</p>
        </div>

        <div style="margin: 20px 0;">
            <p><strong>Security Note:</strong> Never share this link with anyone. Gabay Laguna staff will never ask for your password reset link.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>

        <div class="footer">
            <p>Thanks,<br>{{ config('app.name') }} Team</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
    </div>
</body>
</html>
