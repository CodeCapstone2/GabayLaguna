# Gabay Laguna Frontend Setup Guide

## 🚀 **Quick Fix for CORS/Network Error**

### **Step 1: Update Backend URL**

You need to update your backend URL in one of these places:

#### **Option A: Environment Variable (Recommended)**
Create a `.env.local` file in your frontend directory:
```bash
# .env.local
REACT_APP_API_BASE_URL=http://localhost:8000
```

#### **Option B: Update config.js**
Update `public/config.js` with your backend URL:
```javascript
window.__API_BASE_URL__ = 'http://localhost:8000';
```

### **Step 2: Backend CORS Configuration**

Make sure your Laravel backend has proper CORS configuration in `config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Allow all origins for development
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### **Step 3: Start Your Backend**

Make sure your Laravel backend is running:
```bash
cd gabay-laguna-backend
php artisan serve
```

### **Step 4: Start Your Frontend**

```bash
cd gabay-laguna-frontend
npm start
```

## 🐛 **Troubleshooting**

### **CORS Error:**
- Check if backend is running
- Verify CORS configuration
- Check if backend URL is correct

### **Network Error:**
- Check internet connection
- Verify backend is accessible
- Check if backend URL is correct

### **Login Issues:**
- Clear browser cache
- Check if backend API endpoints are working
- Verify database is seeded

## 📝 **Current Configuration Priority**

1. `REACT_APP_API_BASE_URL` (environment variable)
2. `window.__API_BASE_URL__` (config.js)
3. `http://localhost:8000` (fallback)
