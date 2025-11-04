import axios from "axios";

// API Configuration for local development
// Force localhost for local development - ignore production URLs
const getBaseURL = () => {
  // If in development mode or localhost, always use localhost:8000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
    return "http://localhost:8000";
  }
  
  // Otherwise, check environment variable first, then config.js, then fallback
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  const configUrl = window.__API_BASE_URL__;
  
  // If config.js has an invalid/placeholder URL, use localhost
  if (configUrl && (configUrl.includes('your-backend-domain') || configUrl.includes('000webhostapp') || configUrl.includes('infinityfree'))) {
    console.warn('Invalid API URL detected, using localhost:8000');
    return "http://localhost:8000";
  }
  
  return envUrl || configUrl || "http://localhost:8000";
};

const API_CONFIG = {
  BASE_URL: getBaseURL(),
};

// Log the API URL being used (for debugging)
console.log('API Base URL configured:', API_CONFIG.BASE_URL);

// Configure axios defaults
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = false;

// Add request interceptor for authentication token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if needed
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API_CONFIG;
