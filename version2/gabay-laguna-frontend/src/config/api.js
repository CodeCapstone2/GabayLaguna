import axios from "axios";

// API Configuration
// Production-ready API configuration for Vercel
const API_CONFIG = {
  // Use environment variable in production, fallback to config.js, then localhost for development
  BASE_URL: process.env.REACT_APP_API_BASE_URL || window.__API_BASE_URL__ || "http://localhost:8000",
};

// Configure axios defaults for production
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

    // Add any production-specific headers here if needed

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
