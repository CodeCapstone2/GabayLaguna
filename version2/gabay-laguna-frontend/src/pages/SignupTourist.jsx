import React, { useState, useEffect } from "react";
import API_CONFIG from "../config/api";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaArrowLeft,
  FaSignInAlt,
} from "react-icons/fa";
import "../theme.css";

const SignupTourist = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/tourist-dashboard");
  }, [navigate]);

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.includes("@") || !form.email.includes("."))
      errs.email = "Valid email address required";
    if (!/^\d{10,15}$/.test(form.phone))
      errs.phone = "Phone number must be 10-15 digits";
    if (!form.nationality.trim()) errs.nationality = "Nationality is required";

    if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      errs.password = "Password must include a capital letter and a number";
    }

    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords must match";

    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) {
      alert("Please fix the errors before submitting.");
      return;
    }

    setIsLoading(true);
    try {
      // Call the Laravel API to register the user
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality,
          password: form.password,
          password_confirmation: form.confirmPassword,
          user_type: "tourist",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - save user data and token
        const userData = {
          ...data.user,
          token: data.token || null,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.token || null);

        alert("🎉 Tourist account registered successfully!");
        navigate("/tourist-dashboard");
      } else {
        // Handle API errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join("\n");
          alert(`Registration failed:\n${errorMessages}`);
        } else {
          alert(`Registration failed: ${data.message || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        padding: "2rem 0",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <FaUserPlus size={40} style={{ color: "#11998e" }} />
              </div>
              <h2 className="text-white fw-bold mb-2">Join as a Tourist</h2>
              <p className="text-white-50 mb-0">
                Start your adventure in Laguna today
              </p>
            </div>

            {/* Signup Form Card */}
            <div 
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "var(--radius-2xl)",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="fullName"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaUser className="me-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.fullName ? "is-invalid" : ""
                      }`}
                      id="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">{errors.fullName}</div>
                    )}
                  </div>

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
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="phone"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaPhone className="me-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className={`form-control form-control-lg ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      id="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>

                  {/* Nationality Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="nationality"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaGlobe className="me-2" />
                      Nationality
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.nationality ? "is-invalid" : ""
                      }`}
                      id="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      placeholder="Enter your nationality"
                      required
                    />
                    {errors.nationality && (
                      <div className="invalid-feedback">
                        {errors.nationality}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaLock className="me-2" />
                      Password
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
                        placeholder="Create a strong password"
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
                    <small className="text-muted">
                      Must be at least 6 characters with a capital letter and
                      number
                    </small>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="confirmPassword"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaLock className="me-2" />
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${
                          errors.confirmPassword ? "is-invalid" : ""
                        }`}
                        id="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
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
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100 mb-4 fw-semibold"
                    disabled={isLoading}
                    style={{
                      background:
                        "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="me-2" />
                        Create Tourist Account
                      </>
                    )}
                  </button>

                  {/* Navigation Links */}
                  <div className="text-center">
                    <div className="d-grid gap-2 mb-3">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate("/")}
                      >
                        <FaArrowLeft className="me-2" />
                        Back to Home
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => navigate("/login")}
                      >
                        <FaSignInAlt className="me-2" />
                        Already have an account? Sign In
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                Join thousands of tourists exploring Laguna with Gabay Laguna
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupTourist;
