import axios from "axios";

// API Configuration
// Resolve API base URL with multiple fallbacks and overrides
const queryParams = new URLSearchParams(window.location.search);
const queryApi = queryParams.get('api');
const lsApi = (() => {
  try {
    return localStorage.getItem('API_BASE_URL') || undefined;
  } catch { return undefined; }
})();

const resolvedBaseUrl =
  queryApi ||
  window.__API_BASE_URL__ ||
  lsApi ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:8000";

if (lsApi !== resolvedBaseUrl) {
  try { localStorage.setItem('API_BASE_URL', resolvedBaseUrl); } catch {}
}

const API_CONFIG = {
  BASE_URL: resolvedBaseUrl,
};

// Configure axios defaults for better cross-device compatibility
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = false; // Changed to false for ngrok

// Add request interceptor for authentication token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add ngrok-skip-browser-warning header for ngrok
    config.headers["ngrok-skip-browser-warning"] = "true";

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
