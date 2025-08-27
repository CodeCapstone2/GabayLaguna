import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaSignInAlt,
} from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email || !form.email.includes("@")) {
      errs.email = "Valid email is required";
    }
    if (!form.password || form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!form.role) {
      errs.role = "Please select a role";
    }
    if (form.role === "admin") {
      errs.role = "Admins must use the Admin Login page";
    }
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
    setServerError("");

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/login",
          form
        );
        const { user, token } = response.data;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        alert(
          `Login successful as ${
            form.role
              ? form.role.charAt(0).toUpperCase() + form.role.slice(1)
              : "User"
          }!`
        );

        if (form.role === "tourist") {
          navigate("/tourist-dashboard");
        } else if (form.role === "guide") {
          navigate("/guide-dashboard");
        } else if (form.role === "admin") {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        setServerError(
          error.response?.data?.message || "Login failed. Please try again."
        );
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
            <div className="text-center mb-4">
              <img
                src="/assets/logo.png"
                alt="Gabay Laguna Logo"
                className="mb-3"
                style={{
                  width: "80px",
                  height: "auto",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                }}
              />
              <h2 className="text-white fw-bold mb-2">Welcome Back</h2>
              <p className="text-white-50 mb-0">Sign in to your account</p>
            </div>

            {/* Login Form Card */}
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
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
                    <div className="input-group">
                      <input
                        type="email"
                        className={`form-control form-control-lg ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        id="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
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
                        placeholder="Enter your password"
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

                  {/* Role Selection */}
                  <div className="mb-4">
                    <label
                      htmlFor="role"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaUserTag className="me-2" />
                      Select Role
                    </label>
                    <select
                      className={`form-select form-select-lg ${
                        errors.role ? "is-invalid" : ""
                      }`}
                      id="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose your role</option>
                      <option value="tourist">🧳 Tourist</option>
                      <option value="guide">🧭 Tour Guide</option>
                    </select>
                    {errors.role && (
                      <div className="invalid-feedback">{errors.role}</div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-4 fw-semibold"
                    disabled={isLoading}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Sign In
                      </>
                    )}
                  </button>

                  {/* Navigation Links */}
                  <div className="text-center">
                    <p className="text-muted mb-3">
                      Don't have an account? Choose your path:
                    </p>
                    <div className="d-grid gap-2 mb-3">
                      <Link
                        to="/signup/tourist"
                        className="btn btn-outline-success btn-sm"
                      >
                        🧳 Sign Up as Tourist
                      </Link>
                      <Link
                        to="/signup/guide"
                        className="btn btn-outline-info btn-sm"
                      >
                        🧭 Sign Up as Guide
                      </Link>
                    </div>
                    <Link
                      to="/"
                      className="btn btn-link text-decoration-none"
                      style={{ color: "#667eea" }}
                    >
                      ← Back to Home
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                Secure login powered by Gabay Laguna
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
