#!/bin/bash
echo "Restarting Laravel backend with updated CORS configuration..."
echo

echo "Stopping any running Laravel processes..."
pkill -f "php artisan serve" 2>/dev/null

echo
echo "Starting Laravel backend on http://localhost:8000..."
echo "CORS is now configured to allow any localhost port (3000, 3001, 3002, etc.)"
echo
echo "Press Ctrl+C to stop the server"
echo

php artisan serve
