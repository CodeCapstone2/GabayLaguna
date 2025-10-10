# 🚨 Network Error Troubleshooting Guide

## 🔍 **Step-by-Step Debugging**

### **Step 1: Check Backend Status**
```bash
# Navigate to backend directory
cd gabay-laguna-backend

# Start the backend server
php artisan serve

# You should see:
# Starting Laravel development server: http://127.0.0.1:8000
```

### **Step 2: Test Backend API**
Open your browser and go to:
- `http://localhost:8000/api/cities`
- You should see JSON data with cities

### **Step 3: Test Frontend API Connection**
1. Start your frontend: `npm start`
2. Open: `http://localhost:3000/api-test.html`
3. Click "Test API Connection" button
4. Check the results

### **Step 4: Check Configuration**
Open browser console (F12) and check:
```javascript
// Check what URL is being used
console.log('API Base URL:', window.__API_BASE_URL__);
console.log('Environment:', process.env.NODE_ENV);
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Backend Not Running**
**Symptoms:** Network Error, Connection refused
**Solution:**
```bash
cd gabay-laguna-backend
php artisan serve
```

### **Issue 2: Wrong API URL**
**Symptoms:** CORS error, 404 errors
**Solution:**
1. Check `public/config.js` - should be `http://localhost:8000`
2. Check if environment variables are overriding it
3. Clear browser cache

### **Issue 3: CORS Issues**
**Symptoms:** CORS policy error in console
**Solution:**
1. Restart backend after CORS changes
2. Check `config/cors.php` has your frontend URL
3. Clear browser cache

### **Issue 4: Port Conflicts**
**Symptoms:** "Address already in use"
**Solution:**
```bash
# Kill any process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
php artisan serve --port=8001
```

## 🔧 **Quick Fixes**

### **Fix 1: Reset Everything**
```bash
# Stop all servers (Ctrl+C)
# Clear browser cache
# Restart backend
cd gabay-laguna-backend
php artisan serve

# In another terminal, restart frontend
cd gabay-laguna-frontend
npm start
```

### **Fix 2: Check Network Tab**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check what URL is being called
5. Check the response status

### **Fix 3: Environment Variables**
Create `.env.local` in frontend directory:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000
```

## 📞 **Still Having Issues?**

1. **Check the API test page:** `http://localhost:3000/api-test.html`
2. **Check browser console** for specific error messages
3. **Verify backend is running** on `http://localhost:8000`
4. **Check if firewall/antivirus** is blocking the connection

## 🎯 **Expected Behavior**

✅ **Working Setup:**
- Backend: `http://localhost:8000` shows Laravel welcome page
- API: `http://localhost:8000/api/cities` returns JSON data
- Frontend: `http://localhost:3000` loads without errors
- Login: Should work without Network Error

❌ **Common Failures:**
- Backend not running → Start with `php artisan serve`
- Wrong URL → Check `public/config.js`
- CORS issues → Restart backend after CORS changes
- Port conflicts → Use different ports
