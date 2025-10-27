@echo off
echo Updating .env file for Gmail configuration...
echo.

echo Current configuration will be updated to:
echo - MAIL_HOST: smtp.gmail.com
echo - MAIL_PORT: 587
echo - MAIL_USERNAME: gabaylaguna@gmail.com
echo - MAIL_PASSWORD: mfxw lpuh evnm ivki
echo - MAIL_ENCRYPTION: tls
echo - MAIL_FROM_ADDRESS: gabaylaguna@gmail.com
echo - MAIL_FROM_NAME: Gabay Laguna
echo.

echo Updating .env file...

powershell -Command "(Get-Content .env) -replace 'MAIL_HOST=mailpit', 'MAIL_HOST=smtp.gmail.com' -replace 'MAIL_PORT=1025', 'MAIL_PORT=587' -replace 'MAIL_USERNAME=null', 'MAIL_USERNAME=gabaylaguna@gmail.com' -replace 'MAIL_PASSWORD=null', 'MAIL_PASSWORD=mfxw lpuh evnm ivki' -replace 'MAIL_ENCRYPTION=null', 'MAIL_ENCRYPTION=tls' -replace 'MAIL_FROM_ADDRESS=\"hello@example.com\"', 'MAIL_FROM_ADDRESS=gabaylaguna@gmail.com' -replace 'MAIL_FROM_NAME=\"\${APP_NAME}\"', 'MAIL_FROM_NAME=\"Gabay Laguna\"' | Set-Content .env"

echo.
echo Adding APP_FRONTEND_URL...
echo APP_FRONTEND_URL=http://localhost:3000 >> .env

echo.
echo ✅ .env file updated for Gmail configuration!
echo.
echo Next steps:
echo 1. Test email sending: php test-email.php
echo 2. Check both Gmail accounts for test emails
echo 3. Test the full booking flow
echo.
pause
