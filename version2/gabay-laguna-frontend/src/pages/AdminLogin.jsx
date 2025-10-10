import axios from "axios";
import API_CONFIG from "../config/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUserShield,
} from "react-icons/fa";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/login`, {
        email,
        password,
      });

      const { user, token } = response.data;
      if (!user || (user.user_type !== "admin" && user.role !== "admin")) {
        setError("This account is not an admin.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);
      navigate("/admin-dashboard");
    } catch (err) {
      setError("Invalid admin credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Background Pattern */}
      <div className="admin-login-bg-pattern"></div>

      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          {/* Header */}
          <div className="admin-login-header">
            <div className="admin-logo-container">
              <FaShieldAlt className="admin-logo-icon" />
            </div>
            <h1 className="admin-login-title">Admin Access</h1>
            <p className="admin-login-subtitle">
              Secure administrative portal for Gabay Laguna
            </p>
          </div>

          {/* Security Notice */}
          <div className="security-notice">
            <FaUserShield className="security-icon" />
            <span>Restricted Area - Authorized Personnel Only</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FaUserShield className="input-icon" />
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter admin email"
                className="form-control admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="input-icon" />
                Admin Password
              </label>
              <div className="password-input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  className="form-control admin-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              className={`admin-login-btn ${isLoading ? "loading" : ""}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <FaShieldAlt className="btn-icon" />
                  <span>Access Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="admin-login-footer">
            <div className="security-features">
              <div className="security-feature">
                <FaShieldAlt className="feature-icon" />
                <span>256-bit Encryption</span>
              </div>
              <div className="security-feature">
                <FaUserShield className="feature-icon" />
                <span>Multi-factor Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
