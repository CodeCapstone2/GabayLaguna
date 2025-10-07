import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaStar,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaArrowLeft,
  FaSignInAlt,
  FaFileUpload,
  FaExclamationTriangle,
} from "react-icons/fa";

const SignupGuide = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contact: "",
    address: "",
    licenseNumber: "",
    experience: "",
    password: "",
    confirmPassword: "",
  });

  const [certificate, setCertificate] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (!/^\d{10,15}$/.test(form.contact))
      errs.contact = "Valid contact number required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.licenseNumber.trim())
      errs.licenseNumber = "License number is required";
    if (!form.experience || form.experience < 0)
      errs.experience = "Valid experience required";
    if (form.password.length < 6)
      errs.password = "Minimum 6 characters required";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (!certificate) {
      errs.certificate = "Certificate upload is required";
    } else if (
      !["application/pdf", "image/jpeg", "image/png"].includes(certificate.type)
    ) {
      errs.certificate = "Only PDF or image formats allowed";
    } else if (certificate.size > 5 * 1024 * 1024) {
      errs.certificate = "File must be smaller than 5MB";
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
    const errs = validate();
    setErrors(errs);
    setServerMessage("");

    if (Object.keys(errs).length === 0) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => formData.append(key, val));
        formData.append("certificate", certificate);

        const res = await axios.post(
          `${API_CONFIG.BASE_URL}/api/guide/register`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert(
          "🎉 Registration successful! Please wait for verification before logging in."
        );
        navigate("/login");
      } catch (error) {
        setServerMessage(
          error.response?.data?.message || "Registration failed."
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
          <div className="col-lg-7 col-md-9">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <FaUserPlus size={40} style={{ color: "#667eea" }} />
              </div>
              <h2 className="text-white fw-bold mb-2">Join as a Tour Guide</h2>
              <p className="text-white-50 mb-0">
                Share your expertise and help tourists explore Laguna
              </p>
            </div>

            {/* Signup Form Card */}
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                {serverMessage && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <div className="me-2">⚠️</div>
                    <div>{serverMessage}</div>
                  </div>
                )}

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

                  {/* Contact Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="contact"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaPhone className="me-2" />
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      className={`form-control form-control-lg ${
                        errors.contact ? "is-invalid" : ""
                      }`}
                      id="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="Enter your contact number"
                      required
                    />
                    {errors.contact && (
                      <div className="invalid-feedback">{errors.contact}</div>
                    )}
                  </div>

                  {/* Address Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="address"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaMapMarkerAlt className="me-2" />
                      Address
                    </label>
                    <textarea
                      className={`form-control form-control-lg ${
                        errors.address ? "is-invalid" : ""
                      }`}
                      id="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your complete address"
                      rows="3"
                      required
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>

                  {/* License Number Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="licenseNumber"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaIdCard className="me-2" />
                      License Number
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.licenseNumber ? "is-invalid" : ""
                      }`}
                      id="licenseNumber"
                      value={form.licenseNumber}
                      onChange={handleChange}
                      placeholder="Enter your tour guide license number"
                      required
                    />
                    {errors.licenseNumber && (
                      <div className="invalid-feedback">
                        {errors.licenseNumber}
                      </div>
                    )}
                  </div>

                  {/* Experience Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="experience"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaStar className="me-2" />
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      className={`form-control form-control-lg ${
                        errors.experience ? "is-invalid" : ""
                      }`}
                      id="experience"
                      value={form.experience}
                      onChange={handleChange}
                      placeholder="Enter years of experience"
                      min="0"
                      required
                    />
                    {errors.experience && (
                      <div className="invalid-feedback">
                        {errors.experience}
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

                  {/* Certificate Upload Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="certificate"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaFileUpload className="me-2" />
                      Upload Certificate
                    </label>
                    <input
                      type="file"
                      className={`form-control form-control-lg ${
                        errors.certificate ? "is-invalid" : ""
                      }`}
                      id="certificate"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(e) => setCertificate(e.target.files[0])}
                      required
                    />
                    {errors.certificate && (
                      <div className="invalid-feedback">
                        {errors.certificate}
                      </div>
                    )}
                    <small className="text-muted">
                      Accepted formats: PDF, JPEG, PNG (Max size: 5MB)
                    </small>
                  </div>

                  {/* Verification Notice */}
                  <div
                    className="alert alert-warning d-flex align-items-start"
                    role="alert"
                  >
                    <FaExclamationTriangle className="me-2 mt-1" />
                    <div>
                      <strong>Verification Required:</strong> Your account will
                      require verification by the admin before you can log in.
                      This process typically takes 24-48 hours.
                    </div>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="me-2" />
                        Create Guide Account
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
                Join our network of professional tour guides in Laguna
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupGuide;
