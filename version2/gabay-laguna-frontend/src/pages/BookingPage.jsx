import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const BookingPage = () => {
  const { guideId, poiId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState({
    guide_id: guideId,
    poi_id: poiId,
    date: "",
    start_time: "",
    duration: 2,
    participants: 1,
    special_requests: "",
    payment_method: "paypal",
  });

  const [guide, setGuide] = useState(null);
  const [poi, setPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    // Load guide and POI data
    loadBookingData();
  }, [guideId, poiId, navigate]);

  const loadBookingData = async () => {
    try {
      setLoading(true);

      // Load guide data
      if (guideId) {
        const guideResponse = await axios.get(
          `http://127.0.0.1:8000/api/guides/${guideId}`
        );
        setGuide(guideResponse.data);
      }

      // Load POI data
      if (poiId) {
        const poiResponse = await axios.get(
          `http://127.0.0.1:8000/api/pois/${poiId}`
        );
        setPoi(poiResponse.data);
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
      alert("Error loading booking information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!booking.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    if (!booking.start_time) {
      newErrors.start_time = "Start time is required";
    }

    if (booking.participants < 1) {
      newErrors.participants = "At least 1 participant is required";
    }

    if (booking.participants > 20) {
      newErrors.participants = "Maximum 20 participants allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalPrice = () => {
    if (!guide) return 0;
    const basePrice = guide.hourly_rate || 500;
    return basePrice * booking.duration * booking.participants;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        ...booking,
        total_amount: calculateTotalPrice(),
        tourist_id: user.id,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/bookings",
        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert(
          "🎉 Booking created successfully! You will receive a confirmation email shortly."
        );
        navigate("/tourist-dashboard");
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.response?.data?.message || "Booking failed. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBooking((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (loading) {
    return (
      <div
        className="container py-5 text-center"
        style={{ fontFamily: "var(--font-family-primary)" }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{
            color: "var(--color-success)",
            width: "3rem",
            height: "3rem",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p
          className="mt-3"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.1rem",
          }}
        >
          Loading booking information...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="container py-5 text-center"
        style={{ fontFamily: "var(--font-family-primary)" }}
      >
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.1rem",
          }}
        >
          Please log in to make a booking.
        </p>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{ fontFamily: "var(--font-family-primary)" }}
    >
      <div className="row">
        <div className="col-lg-8">
          <div
            className="card shadow-lg border-0"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="card-header"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                color: "white",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                border: "none",
              }}
            >
              <h3
                className="mb-0"
                style={{
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                📅 Book Your Tour
              </h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Guide Information */}
                {guide && (
                  <div
                    className="mb-4 p-4"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    <h5
                      style={{
                        color: "var(--color-text)",
                        fontFamily: "var(--font-family-heading)",
                        fontWeight: "600",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      👤 Tour Guide
                    </h5>
                    <div className="row">
                      <div className="col-md-3">
                        <img
                          src={
                            guide.profile_picture ||
                            "/assets/guides/default.jpg"
                          }
                          alt={guide.name}
                          className="img-fluid rounded"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            border: "3px solid var(--color-border)",
                            boxShadow: "var(--shadow-md)",
                          }}
                        />
                      </div>
                      <div className="col-md-9">
                        <h6
                          style={{
                            color: "var(--color-text)",
                            fontFamily: "var(--font-family-heading)",
                            fontWeight: "600",
                          }}
                        >
                          {guide.name}
                        </h6>
                        <p
                          style={{
                            color: "var(--color-text-secondary)",
                            marginBottom: "var(--spacing-xs)",
                          }}
                        >
                          ⭐ {guide.rating || 4.5} / 5
                        </p>
                        <p
                          style={{
                            color: "var(--color-text-secondary)",
                            marginBottom: "var(--spacing-xs)",
                          }}
                        >
                          💵 PHP {guide.hourly_rate || 500} per hour
                        </p>
                        <p
                          style={{
                            color: "var(--color-text-secondary)",
                            marginBottom: "0",
                          }}
                        >
                          {guide.bio || "Experienced tour guide"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* POI Information */}
                {poi && (
                  <div
                    className="mb-4 p-4"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    <h5
                      style={{
                        color: "var(--color-text)",
                        fontFamily: "var(--font-family-heading)",
                        fontWeight: "600",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      📍 Destination
                    </h5>
                    <h6
                      style={{
                        color: "var(--color-text)",
                        fontFamily: "var(--font-family-heading)",
                        fontWeight: "600",
                      }}
                    >
                      {poi.name}
                    </h6>
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        marginBottom: "0",
                      }}
                    >
                      {poi.description}
                    </p>
                  </div>
                )}

                {/* Date and Time */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="date"
                      className="form-label"
                      style={{
                        color: "var(--color-text)",
                        fontWeight: "500",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      📅 Date
                    </label>
                    <input
                      type="date"
                      className={`form-control ${
                        errors.date ? "is-invalid" : ""
                      }`}
                      id="date"
                      name="date"
                      value={booking.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text)",
                        transition: "var(--transition-fast)",
                      }}
                    />
                    {errors.date && (
                      <div className="invalid-feedback">{errors.date}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="start_time"
                      className="form-label"
                      style={{
                        color: "var(--color-text)",
                        fontWeight: "500",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      🕐 Start Time
                    </label>
                    <input
                      type="time"
                      className={`form-control ${
                        errors.start_time ? "is-invalid" : ""
                      }`}
                      id="start_time"
                      name="start_time"
                      value={booking.start_time}
                      onChange={handleChange}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text)",
                        transition: "var(--transition-fast)",
                      }}
                    />
                    {errors.start_time && (
                      <div className="invalid-feedback">
                        {errors.start_time}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration and Participants */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="duration"
                      className="form-label"
                      style={{
                        color: "var(--color-text)",
                        fontWeight: "500",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      ⏱️ Duration (hours)
                    </label>
                    <select
                      className="form-select"
                      id="duration"
                      name="duration"
                      value={booking.duration}
                      onChange={handleChange}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text)",
                        transition: "var(--transition-fast)",
                      }}
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={5}>5 hours</option>
                      <option value={6}>6 hours</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="participants"
                      className="form-label"
                      style={{
                        color: "var(--color-text)",
                        fontWeight: "500",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      👥 Number of Participants
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.participants ? "is-invalid" : ""
                      }`}
                      id="participants"
                      name="participants"
                      value={booking.participants}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text)",
                        transition: "var(--transition-fast)",
                      }}
                    />
                    {errors.participants && (
                      <div className="invalid-feedback">
                        {errors.participants}
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-3">
                  <label
                    htmlFor="special_requests"
                    className="form-label"
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "500",
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    📝 Special Requests (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="special_requests"
                    name="special_requests"
                    value={booking.special_requests}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requirements or requests..."
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--spacing-md)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      transition: "var(--transition-fast)",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label
                    className="form-label"
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "500",
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    💳 Payment Method
                  </label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="payment_method"
                        id="paypal"
                        value="paypal"
                        checked={booking.payment_method === "paypal"}
                        onChange={handleChange}
                        style={{
                          accentColor: "var(--color-success)",
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="paypal"
                        style={{
                          color: "var(--color-text)",
                          cursor: "pointer",
                        }}
                      >
                        PayPal
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="payment_method"
                        id="paymongo"
                        value="paymongo"
                        checked={booking.payment_method === "paymongo"}
                        onChange={handleChange}
                        style={{
                          accentColor: "var(--color-success)",
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="paymongo"
                        style={{
                          color: "var(--color-text)",
                          cursor: "pointer",
                        }}
                      >
                        PayMongo
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100"
                  disabled={submitting}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    color: "white",
                    fontWeight: "600",
                    padding: "var(--spacing-md)",
                    transition: "var(--transition-normal)",
                    boxShadow: "var(--shadow-md)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "var(--shadow-lg)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "var(--shadow-md)";
                  }}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    "💳 Proceed to Payment"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="col-lg-4">
          <div
            className="card shadow-lg border-0 sticky-top"
            style={{
              top: "2rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="card-header"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
                color: "white",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                border: "none",
              }}
            >
              <h5
                className="mb-0"
                style={{
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                📋 Booking Summary
              </h5>
            </div>
            <div className="card-body" style={{ color: "var(--color-text)" }}>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Guide Rate:
                </span>
                <span style={{ fontWeight: "500" }}>
                  PHP {guide?.hourly_rate || 500}/hour
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Duration:
                </span>
                <span style={{ fontWeight: "500" }}>
                  {booking.duration} hour(s)
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Participants:
                </span>
                <span style={{ fontWeight: "500" }}>
                  {booking.participants}
                </span>
              </div>
              <hr style={{ borderColor: "var(--color-border)" }} />
              <div className="d-flex justify-content-between mb-2">
                <strong style={{ color: "var(--color-text)" }}>
                  Subtotal:
                </strong>
                <strong style={{ color: "var(--color-text)" }}>
                  PHP {calculateTotalPrice()}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Service Fee:
                </span>
                <span style={{ fontWeight: "500" }}>PHP 50</span>
              </div>
              <hr style={{ borderColor: "var(--color-border)" }} />
              <div className="d-flex justify-content-between">
                <h6
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                  }}
                >
                  Total:
                </h6>
                <h6
                  style={{
                    color: "var(--color-success)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  PHP {calculateTotalPrice() + 50}
                </h6>
              </div>

              <div
                className="mt-3 p-3"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                <small style={{ color: "var(--color-text-secondary)" }}>
                  <strong style={{ color: "var(--color-text)" }}>
                    📋 Booking Policy:
                  </strong>
                  <br />
                  • Cancellation: Free up to 24 hours before
                  <br />
                  • Payment: Required at booking
                  <br />• Confirmation: Email sent within 1 hour
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
