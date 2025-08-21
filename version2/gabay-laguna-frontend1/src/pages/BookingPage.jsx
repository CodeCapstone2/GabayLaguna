import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

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
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading booking information...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Please log in to make a booking.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow border-0">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">📅 Book Your Tour</h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Guide Information */}
                {guide && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h5>👤 Tour Guide</h5>
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
                          }}
                        />
                      </div>
                      <div className="col-md-9">
                        <h6>{guide.name}</h6>
                        <p className="text-muted mb-1">
                          ⭐ {guide.rating || 4.5} / 5
                        </p>
                        <p className="text-muted mb-1">
                          💵 PHP {guide.hourly_rate || 500} per hour
                        </p>
                        <p className="text-muted mb-0">
                          {guide.bio || "Experienced tour guide"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* POI Information */}
                {poi && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h5>📍 Destination</h5>
                    <h6>{poi.name}</h6>
                    <p className="text-muted mb-0">{poi.description}</p>
                  </div>
                )}

                {/* Date and Time */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label">
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
                    />
                    {errors.date && (
                      <div className="invalid-feedback">{errors.date}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="start_time" className="form-label">
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
                    <label htmlFor="duration" className="form-label">
                      ⏱️ Duration (hours)
                    </label>
                    <select
                      className="form-select"
                      id="duration"
                      name="duration"
                      value={booking.duration}
                      onChange={handleChange}
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
                    <label htmlFor="participants" className="form-label">
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
                  <label htmlFor="special_requests" className="form-label">
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
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="form-label">💳 Payment Method</label>
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
                      />
                      <label className="form-check-label" htmlFor="paypal">
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
                      />
                      <label className="form-check-label" htmlFor="paymongo">
                        PayMongo
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100"
                  disabled={submitting}
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
            className="card shadow border-0 sticky-top"
            style={{ top: "2rem" }}
          >
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Booking Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Guide Rate:</span>
                <span>PHP {guide?.hourly_rate || 500}/hour</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Duration:</span>
                <span>{booking.duration} hour(s)</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Participants:</span>
                <span>{booking.participants}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <strong>Subtotal:</strong>
                <strong>PHP {calculateTotalPrice()}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Service Fee:</span>
                <span>PHP 50</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <h6>Total:</h6>
                <h6 className="text-success">
                  PHP {calculateTotalPrice() + 50}
                </h6>
              </div>

              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>📋 Booking Policy:</strong>
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
