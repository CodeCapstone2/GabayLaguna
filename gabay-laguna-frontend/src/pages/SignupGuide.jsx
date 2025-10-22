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
  FaExclamationTriangle,
} from "react-icons/fa";

const SignupGuide = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    experience_years: "",
    password: "",
    password_confirmation: "",
    bio: "",
    hourly_rate: "",
    languages: "",
    transportation_type: "",
  });

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (!/^\d{10,15}$/.test(form.phone))
      errs.phone = "Valid contact number required";
    if (!form.license_number.trim())
      errs.license_number = "License number is required";
    if (!form.experience_years || form.experience_years < 0)
      errs.experience_years = "Valid experience required";
    if (form.password.length < 6)
      errs.password = "Minimum 6 characters required";
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = "Passwords do not match";
    if (!form.bio.trim()) errs.bio = "Bio is required";
    if (!form.hourly_rate || form.hourly_rate < 0)
      errs.hourly_rate = "Valid hourly rate required";
    if (!form.languages.trim()) errs.languages = "Languages are required";


    return errs;
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    let processedValue = value;
    
    // Convert numeric fields to numbers
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }
    
    setForm({ ...form, [id]: processedValue });
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
        // Clean the form data - remove empty strings and convert to proper types
        const cleanedForm = {
          ...form,
          experience_years: form.experience_years ? Number(form.experience_years) : 0,
          hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : 0,
        };
        
        console.log("Sending form data:", cleanedForm);
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/api/guide/register`,
          cleanedForm
        );

        alert(
          "🎉 Registration successful! Please wait for verification before logging in."
        );
        navigate("/login");
      } catch (error) {
        console.log("Error response:", error.response?.data);
        console.log("Error status:", error.response?.status);
        
        if (error.response?.data?.errors) {
          // Show specific validation errors
          const errorMessages = Object.values(error.response.data.errors).flat();
          setServerMessage(`Validation failed: ${errorMessages.join(', ')}`);
        } else {
          setServerMessage(
            error.response?.data?.message || "Registration failed."
          );
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
                      htmlFor="name"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaUser className="me-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
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
                      htmlFor="phone"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaPhone className="me-2" />
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      className={`form-control form-control-lg ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      id="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your contact number"
                      required
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>


                  {/* License Number Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="license_number"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaIdCard className="me-2" />
                      License Number
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.license_number ? "is-invalid" : ""
                      }`}
                      id="license_number"
                      value={form.license_number}
                      onChange={handleChange}
                      placeholder="Enter your tour guide license number"
                      required
                    />
                    {errors.license_number && (
                      <div className="invalid-feedback">
                        {errors.license_number}
                      </div>
                    )}
                  </div>

                  {/* Experience Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="experience_years"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaStar className="me-2" />
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      className={`form-control form-control-lg ${
                        errors.experience_years ? "is-invalid" : ""
                      }`}
                      id="experience_years"
                      value={form.experience_years}
                      onChange={handleChange}
                      placeholder="Enter years of experience"
                      min="0"
                      required
                    />
                    {errors.experience_years && (
                      <div className="invalid-feedback">
                        {errors.experience_years}
                      </div>
                    )}
                  </div>

                  {/* Bio Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="bio"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaUser className="me-2" />
                      Bio
                    </label>
                    <textarea
                      className={`form-control form-control-lg ${
                        errors.bio ? "is-invalid" : ""
                      }`}
                      id="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself and your guiding experience"
                      rows="3"
                      required
                    />
                    {errors.bio && (
                      <div className="invalid-feedback">{errors.bio}</div>
                    )}
                  </div>

                  {/* Hourly Rate Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="hourly_rate"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaStar className="me-2" />
                      Hourly Rate (PHP)
                    </label>
                    <input
                      type="number"
                      className={`form-control form-control-lg ${
                        errors.hourly_rate ? "is-invalid" : ""
                      }`}
                      id="hourly_rate"
                      value={form.hourly_rate}
                      onChange={handleChange}
                      placeholder="Enter your hourly rate in PHP"
                      min="0"
                      step="0.01"
                      required
                    />
                    {errors.hourly_rate && (
                      <div className="invalid-feedback">
                        {errors.hourly_rate}
                      </div>
                    )}
                  </div>

                  {/* Languages Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="languages"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaUser className="me-2" />
                      Languages
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        errors.languages ? "is-invalid" : ""
                      }`}
                      id="languages"
                      value={form.languages}
                      onChange={handleChange}
                      placeholder="e.g., English, Tagalog, Spanish"
                      required
                    />
                    {errors.languages && (
                      <div className="invalid-feedback">{errors.languages}</div>
                    )}
                  </div>

                  {/* Transportation Type Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="transportation_type"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaMapMarkerAlt className="me-2" />
                      Transportation Type
                    </label>
                    <select
                      className={`form-control form-control-lg ${
                        errors.transportation_type ? "is-invalid" : ""
                      }`}
                      id="transportation_type"
                      value={form.transportation_type}
                      onChange={handleChange}
                    >
                      <option value="">Select transportation type</option>
                      <option value="car">Car</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="walking">Walking</option>
                      <option value="public_transport">Public Transport</option>
                    </select>
                    {errors.transportation_type && (
                      <div className="invalid-feedback">
                        {errors.transportation_type}
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
                      htmlFor="password_confirmation"
                      className="form-label fw-semibold text-muted"
                    >
                      <FaLock className="me-2" />
                      Confirm Password
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
                      {errors.password_confirmation && (
                        <div className="invalid-feedback">
                          {errors.password_confirmation}
                        </div>
                      )}
                    </div>
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
