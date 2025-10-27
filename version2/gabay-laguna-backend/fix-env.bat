@echo off
echo Fixing .env file with Gmail configuration...

echo APP_NAME=GabayLaguna > .env
echo APP_ENV=local >> .env
echo APP_KEY=base64:TCaI3W+7rPL1hGWLJo/2UPfW0UQSkNSJx0zipjVU3SI= >> .env
echo APP_DEBUG=true >> .env
echo APP_URL=http://localhost/127.0.0.1 >> .env
echo. >> .env
echo LOG_CHANNEL=stack >> .env
echo LOG_DEPRECATIONS_CHANNEL=null >> .env
echo LOG_LEVEL=debug >> .env
echo. >> .env
echo DB_CONNECTION=mysql >> .env
echo DB_HOST=127.0.0.1 >> .env
echo DB_PORT=3306 >> .env
echo DB_DATABASE=gabay_laguna >> .env
echo DB_USERNAME=root >> .env
echo DB_PASSWORD= >> .env
echo. >> .env
echo BROADCAST_DRIVER=log >> .env
echo CACHE_DRIVER=file >> .env
echo FILESYSTEM_DISK=local >> .env
echo QUEUE_CONNECTION=sync >> .env
echo SESSION_DRIVER=file >> .env
echo SESSION_LIFETIME=120 >> .env
echo. >> .env
echo MEMCACHED_HOST=127.0.0.1 >> .env
echo. >> .env
echo REDIS_HOST=127.0.0.1 >> .env
echo REDIS_PASSWORD=null >> .env
echo REDIS_PORT=6379 >> .env
echo. >> .env
echo MAIL_MAILER=smtp >> .env
echo MAIL_HOST=smtp.gmail.com >> .env
echo MAIL_PORT=587 >> .env
echo MAIL_USERNAME=gabaylaguna@gmail.com >> .env
echo MAIL_PASSWORD=mfxw lpuh evnm ivki >> .env
echo MAIL_ENCRYPTION=tls >> .env
echo MAIL_FROM_ADDRESS=gabaylaguna@gmail.com >> .env
echo MAIL_FROM_NAME="Gabay Laguna" >> .env
echo APP_FRONTEND_URL=http://localhost:3000 >> .env
echo. >> .env
echo AWS_ACCESS_KEY_ID= >> .env
echo AWS_SECRET_ACCESS_KEY= >> .env
echo AWS_DEFAULT_REGION=us-east-1 >> .env
echo AWS_BUCKET= >> .env
echo AWS_USE_PATH_STYLE_ENDPOINT=false >> .env
echo. >> .env
echo PUSHER_APP_ID= >> .env
echo PUSHER_APP_KEY= >> .env
echo PUSHER_APP_SECRET= >> .env
echo PUSHER_HOST= >> .env
echo PUSHER_PORT=443 >> .env
echo PUSHER_SCHEME=https >> .env
echo PUSHER_APP_CLUSTER=mt1 >> .env
echo. >> .env
echo VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}" >> .env
echo VITE_PUSHER_HOST="${PUSHER_HOST}" >> .env
echo VITE_PUSHER_PORT="${PUSHER_PORT}" >> .env
echo VITE_PUSHER_SCHEME="${PUSHER_SCHEME}" >> .env
echo VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}" >> .env

echo.
echo ✅ .env file updated with Gmail configuration!
echo.
echo Next steps:
echo 1. Test email sending: php test-email.php
echo 2. Clear cache: php artisan config:clear
echo 3. Test the full booking flow
echo.
pause
