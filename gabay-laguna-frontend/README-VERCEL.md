# Vercel Deployment Guide for Gabay Laguna Frontend

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Production backend URL

## Deployment Steps

### 1. Environment Variables
In your Vercel dashboard, add these environment variables:
- `REACT_APP_API_BASE_URL`: Your production backend URL (e.g., `https://your-backend.vercel.app`)

### 2. Update Configuration Files

#### Update `public/config.js`
```javascript
// Production API base URL for Vercel deployment
// Update this to your production backend URL
window.__API_BASE_URL__ = 'https://your-production-backend.vercel.app';
```

#### Update `src/config/api.js` (Already done)
The API configuration now uses environment variables with proper fallbacks.

### 3. Build Configuration
The `vercel.json` file is configured for React SPA deployment with proper routing.

### 4. Deploy
1. Push your changes to the main branch
2. Vercel will automatically build and deploy
3. Check the deployment logs for any issues

## Post-Deployment Checklist
- [ ] Verify API calls work with production backend
- [ ] Test authentication flow
- [ ] Check all pages load correctly
- [ ] Verify mobile responsiveness
- [ ] Test on different devices/browsers

## Troubleshooting
- If API calls fail, check the `REACT_APP_API_BASE_URL` environment variable
- If routing doesn't work, ensure `vercel.json` is properly configured
- Check browser console for any CORS or network errors
