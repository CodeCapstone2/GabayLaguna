import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "../theme.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email || !email.includes("@")) {
      errs.email = "Valid email is required";
    }
    return errs;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: "" });
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
          `${API_CONFIG.BASE_URL}/api/forgot-password`,
          { email },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: false,
          }
        );

        // Success response (always returns 200 to prevent email enumeration)
        setSuccess(true);
      } catch (error) {
        if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
          setServerError(
            "Network Error: Unable to connect to the server. Please check your connection."
          );
        } else {
          const errMsg = error.response?.data?.message || error.message || "Request failed.";
          setServerError(errMsg);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

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
              <h1 className="text-white fw-bold mb-3">Forgot Password?</h1>
              <p className="text-white-50 lead mb-0">
                {success
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive a password reset link"}
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
                    <h4 className="mb-3">Email Sent!</h4>
                    <p className="text-muted mb-4">
                      If an account with the email <strong>{email}</strong> exists,
                      you will receive a password reset link shortly.
                    </p>
                    <p className="text-muted small mb-4">
                      Please check your inbox and spam folder. The link will expire in 60 minutes.
                    </p>
                    <div className="d-grid gap-2">
                      <Link
                        to="/login"
                        className="btn btn-primary"
                      >
                        <FaArrowLeft className="me-2" />
                        Back to Login
                      </Link>
                    </div>
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
                      {/* Email Field */}
                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="form-label fw-semibold text-muted"
                        >
                          <FaEnvelope className="me-2" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          className={`form-control form-control-lg ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          id="email"
                          value={email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          required
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
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
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaEnvelope className="me-2" />
                            Send Reset Link
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

export default ForgotPassword;



