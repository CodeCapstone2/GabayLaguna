import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import {
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "../theme.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    token: searchParams.get("token") || "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if token and email are present
    if (!form.token || !form.email) {
      setServerError(
        "Invalid reset link. Please request a new password reset link."
      );
    }
  }, [form.token, form.email]);

  const validate = () => {
    const errs = {};
    if (!form.email || !form.email.includes("@")) {
      errs.email = "Valid email is required";
    }
    if (!form.token) {
      errs.token = "Reset token is required";
    }
    if (!form.password || form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (form.password !== form.password_confirmation) {
      errs.password_confirmation = "Passwords do not match";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setServerError("");

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/api/reset-password`,
          {
            email: form.email,
            token: form.token,
            password: form.password,
            password_confirmation: form.password_confirmation,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: false,
          }
        );

        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
          setServerError(
            "Network Error: Unable to connect to the server. Please check your connection."
          );
        } else {
          const errMsg =
            error.response?.data?.message ||
            error.message ||
            "Password reset failed.";
          setServerError(errMsg);

          // Check for validation errors
          if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!form.token || !form.email) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "2rem 0",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div
                className="card"
                style={{
                  borderRadius: "var(--radius-2xl)",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="card-body p-5 text-center">
                  <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Invalid Reset Link</h5>
                    <p>This password reset link is invalid or has expired.</p>
                    <hr />
                    <p className="mb-0">
                      Please request a new password reset link.
                    </p>
                  </div>
                  <Link to="/forgot-password" className="btn btn-primary">
                    Request New Reset Link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem 0",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            {/* Logo and Header */}
            <div className="text-center mb-5">
              <img
                src="/assets/logo.png"
                alt="Gabay Laguna Logo"
                className="mb-4"
                style={{
                  width: "90px",
                  height: "auto",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                }}
              />
              <h1 className="text-white fw-bold mb-3">Reset Password</h1>
              <p className="text-white-50 lead mb-0">
                {success
                  ? "Password reset successful!"
                  : "Enter your new password"}
              </p>
            </div>

            {/* Form Card */}
            <div
              className="card"
              style={{
                borderRadius: "var(--radius-2xl)",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="card-body p-5">
                {success ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <FaCheckCircle
                        className="text-success"
                        style={{ fontSize: "4rem" }}
                      />
                    </div>
                    <h4 className="mb-3">Password Reset Successful!</h4>
                    <p className="text-muted mb-4">
                      Your password has been successfully reset. You can now log in with your new password.
                    </p>
                    <p className="text-muted small mb-4">
                      Redirecting to login page...
                    </p>
                    <Link to="/login" className="btn btn-primary">
                      Go to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    {serverError && (
                      <div
                        className="alert alert-danger d-flex align-items-center"
                        role="alert"
                      >
                        <div className="me-2">⚠️</div>
                        <div>{serverError}</div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                      {/* Email Field (hidden but required) */}
                      <input type="hidden" id="email" value={form.email} />
                      <input type="hidden" id="token" value={form.token} />

                      {/* Password Field */}
                      <div className="mb-4">
                        <label
                          htmlFor="password"
                          className="form-label fw-semibold text-muted"
                        >
                          <FaLock className="me-2" />
                          New Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`form-control form-control-lg ${
                              errors.password ? "is-invalid" : ""
                            }`}
                            id="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter new password (min 8 characters)"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ borderLeft: "none" }}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          {errors.password && (
                            <div className="invalid-feedback">
                              {errors.password}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div className="mb-4">
                        <label
                          htmlFor="password_confirmation"
                          className="form-label fw-semibold text-muted"
                        >
                          <FaLock className="me-2" />
                          Confirm New Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`form-control form-control-lg ${
                              errors.password_confirmation ? "is-invalid" : ""
                            }`}
                            id="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            style={{ borderLeft: "none" }}
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                          {errors.password_confirmation && (
                            <div className="invalid-feedback">
                              {errors.password_confirmation}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 mb-4"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Resetting...
                          </>
                        ) : (
                          <>
                            <FaLock className="me-2" />
                            Reset Password
                          </>
                        )}
                      </button>

                      {/* Navigation Links */}
                      <div className="text-center">
                        <Link
                          to="/login"
                          className="btn btn-link text-decoration-none"
                          style={{ color: "#667eea" }}
                        >
                          <FaArrowLeft className="me-2" />
                          Back to Login
                        </Link>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                Secure password reset powered by Gabay Laguna
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;



