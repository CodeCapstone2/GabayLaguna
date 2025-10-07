#!/bin/bash
echo "Fixing CORS issues for Gabay Laguna backend..."
echo

echo "Stopping any running Laravel processes..."
pkill -f "php artisan serve" 2>/dev/null

echo
echo "Clearing Laravel cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear

echo
echo "Starting Laravel backend with updated CORS configuration..."
echo "CORS is now configured to allow ALL origins for development"
echo
echo "Test endpoints:"
echo "- Health: http://localhost:8000/api/health"
echo "- CORS Test: http://localhost:8000/api/cors-test"
echo "- Login: http://localhost:8000/api/login"
echo
echo "Press Ctrl+C to stop the server"
echo

php artisan serve
