import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import GuideAvailabilitySchedule from "../components/GuideAvailabilitySchedule";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const BookingPage = () => {
  const { guideId, poiId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state if available
  const { poi: navPoi, guide: navGuide } = location.state || {};

  const [booking, setBooking] = useState({
    tour_guide_id: guideId || navGuide?.id || "",
    point_of_interest_id: poiId || navPoi?.id || "",
    tour_date: "",
    start_time: "",
    end_time: "",
    duration_hours: 2,
    number_of_people: 1,
    special_requests: "",
    payment_method: "paymongo", // default
  });

  const [guide, setGuide] = useState(navGuide || null);
  const [poi, setPoi] = useState(navPoi || null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const loadAvailableTimeSlots = useCallback(async () => {
    try {
      await axios.get(
        `${API_CONFIG.BASE_URL}/api/guides/${
          guideId || booking.tour_guide_id
        }/availability`
      );
      // Time slots are not used in the current implementation
    } catch (error) {
      console.error("Error loading time slots:", error);
    }
  }, [guideId, booking.tour_guide_id]);

  const loadBookingData = useCallback(async () => {
    try {
      setLoading(true);

      // Load guide data
      if (guideId && !guide) {
        const guideResponse = await axios.get(
          `${API_CONFIG.BASE_URL}/api/guides/${guideId}`
        );
        setGuide(guideResponse.data.tour_guide || guideResponse.data);
      }

      // Load POI data
      if (poiId && !poi) {
        const poiResponse = await axios.get(
          `${API_CONFIG.BASE_URL}/api/pois/${poiId}`
        );
        setPoi(poiResponse.data.point_of_interest || poiResponse.data);
      }

      // Load time slots
      if (guideId || booking.tour_guide_id) {
        await loadAvailableTimeSlots();
      }
    } catch (error) {
      console.error("Error loading booking data:", error);
    } finally {
      setLoading(false);
    }
  }, [guideId, poiId, guide, poi, loadAvailableTimeSlots, booking.tour_guide_id]);

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

    loadBookingData();
  }, [guideId, poiId, navigate, loadBookingData]);

  // Update end_time when start_time or duration changes
  useEffect(() => {
    if (booking.start_time && booking.duration_hours) {
      const startTime = new Date(`2000-01-01T${booking.start_time}`);
      const endTime = new Date(
        startTime.getTime() + booking.duration_hours * 60 * 60 * 1000
      );
      const endTimeStr = endTime.toTimeString().slice(0, 5);
      setBooking((prev) => ({ ...prev, end_time: endTimeStr }));
    }
  }, [booking.start_time, booking.duration_hours]);

  const validateForm = () => {
    const newErrors = {};

    if (!booking.tour_date) {
      newErrors.tour_date = "Date is required";
    } else {
      const selectedDate = new Date(booking.tour_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.tour_date = "Date cannot be in the past";
      }
    }

    if (!booking.start_time) {
      newErrors.start_time = "Start time is required";
    }

    if (!selectedTimeSlot) {
      newErrors.time_slot = "Please select an available time slot";
    }

    if (!booking.tour_guide_id) {
      newErrors.tour_guide_id = "Please select a guide";
    }

    if (!booking.point_of_interest_id) {
      newErrors.point_of_interest_id = "Please select a destination";
    }

    if (booking.number_of_people < 1) {
      newErrors.number_of_people = "At least 1 participant is required";
    } else if (booking.number_of_people > 20) {
      newErrors.number_of_people = "Maximum 20 participants allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = () => {
    return (guide?.hourly_rate || 500) * booking.duration_hours;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + 50; // +50 service fee
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const bookingData = {
        ...booking,
        total_amount: calculateTotal(),
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/bookings`,
        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        alert(
          "🎉 Booking created successfully! You will receive a confirmation email shortly."
        );
        navigate("/my-bookings");
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

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Clear selected time slot when date changes
    if (name === 'tour_date') {
      setSelectedTimeSlot(null);
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setBooking((prev) => ({
      ...prev,
      start_time: timeSlot.startTime,
      end_time: timeSlot.endTime
    }));
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
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
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
        {/* Main Booking Form */}
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
                {/* Guide Selection */}
                {!guide && (
                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-user me-2"></i>
                      Select a Tour Guide
                    </label>
                    <p className="text-muted small mb-2">
                      Browse available tour guides with their Name, Rating, and Price. 
                      Select a guide profile to view their Bio, Services, and Availability.
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={() => {
                        // Navigate to guide selection page
                        if (poi?.id) {
                          navigate(`/poi/${poi.id}/guides`, {
                            state: { poi: poi }
                          });
                        } else {
                          navigate('/cities');
                        }
                      }}
                    >
                      <i className="fas fa-users me-2"></i>
                      Browse Available Guides
                    </button>
                    {errors.tour_guide_id && (
                      <div className="text-danger small">
                        {errors.tour_guide_id}
                      </div>
                    )}
                  </div>
                )}

                {/* Guide Info */}
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
                            "/assets/logo.png"
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
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary mt-3"
                      onClick={() => {
                        // Change Guide - allows user to go back and select a different guide
                        // This aligns with the activity diagram where tourist can change guide if not satisfied
                        setGuide(null);
                        setBooking(prev => ({ ...prev, tour_guide_id: "" }));
                      }}
                    >
                      <i className="fas fa-exchange-alt me-2"></i>
                      Change Guide
                    </button>
                  </div>
                )}

                {/* POI Info */}
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

                {/* Date & Time */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="tour_date"
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
                        errors.tour_date ? "is-invalid" : ""
                      }`}
                      id="tour_date"
                      name="tour_date"
                      value={booking.tour_date}
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
                    {errors.tour_date && (
                      <div className="invalid-feedback">{errors.tour_date}</div>
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

                {/* Guide Availability Schedule */}
                {guide && booking.tour_date && (
                  <div
                    className="mb-4 p-4"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    <GuideAvailabilitySchedule
                      guideId={guide.id}
                      selectedDate={booking.tour_date}
                      onTimeSlotSelect={handleTimeSlotSelect}
                      selectedTimeSlot={selectedTimeSlot}
                      duration={booking.duration_hours}
                    />
                    {errors.time_slot && (
                      <div className="text-danger small mt-2">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {errors.time_slot}
                      </div>
                    )}
                  </div>
                )}

                {/* Duration & Participants */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="duration_hours"
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
                      id="duration_hours"
                      name="duration_hours"
                      value={booking.duration_hours}
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
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                        <option key={hours} value={hours}>
                          {hours} hour{hours > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="number_of_people"
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
                        errors.number_of_people ? "is-invalid" : ""
                      }`}
                      id="number_of_people"
                      name="number_of_people"
                      value={booking.number_of_people}
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
                    {errors.number_of_people && (
                      <div className="invalid-feedback">
                        {errors.number_of_people}
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

                {/* Submit Button */}
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
                    "📋 Create Booking"
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
                  {booking.duration_hours} hour(s)
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Participants:
                </span>
                <span style={{ fontWeight: "500" }}>
                  {booking.number_of_people}
                </span>
              </div>
              {selectedTimeSlot && (
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Time Slot:
                  </span>
                  <span style={{ fontWeight: "500" }}>
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                  </span>
                </div>
              )}
              {booking.tour_date && (
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Date:
                  </span>
                  <span style={{ fontWeight: "500" }}>
                    {new Date(booking.tour_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              <hr style={{ borderColor: "var(--color-border)" }} />
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Subtotal:
                </span>
                <span style={{ fontWeight: "500" }}>
                  PHP {calculateSubtotal()}
                </span>
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
                  PHP {calculateTotal()}
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
                  • Payment: Required at booking confirmation
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
