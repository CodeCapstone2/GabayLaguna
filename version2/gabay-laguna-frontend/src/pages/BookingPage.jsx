import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const BookingPage = () => {
  const { guideId, poiId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state if available
  const { poi: navPoi, city: navCity, guide: navGuide } = location.state || {};


  const [booking, setBooking] = useState({
    tour_guide_id: guideId || navGuide?.id || "",
    point_of_interest_id: poiId || navPoi?.id || "",
    tour_date: "",
    start_time: "",
    end_time: "",
    duration_hours: 2,
    number_of_people: 1,
    special_requests: "",
  });

  const [guide, setGuide] = useState(navGuide || null);
  const [poi, setPoi] = useState(navPoi || null);
  const [city, setCity] = useState(navCity || null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

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
  }, [guideId, poiId, navigate]);

  useEffect(() => {
    if (booking.start_time && booking.duration_hours) {
      const startTime = new Date(`2000-01-01T${booking.start_time}`);
      const endTime = new Date(startTime.getTime() + booking.duration_hours * 60 * 60 * 1000);
      const endTimeStr = endTime.toTimeString().slice(0, 5);
      setBooking(prev => ({ ...prev, end_time: endTimeStr }));
    }
  }, [booking.start_time, booking.duration_hours]);

  const loadBookingData = async () => {
    try {
      setLoading(true);

      // Load guide data from URL parameter if provided
      if (guideId && !guide) {
        try {
          const guideResponse = await axios.get(
            `http://127.0.0.1:8000/api/guides/${guideId}`
          );
          setGuide(guideResponse.data.tour_guide || guideResponse.data);
        } catch (error) {
          console.error("Error loading guide:", error);
        }
      }

      // Load POI data from URL parameter if provided
      if (poiId && !poi) {
        try {
          const poiResponse = await axios.get(
            `http://127.0.0.1:8000/api/pois/${poiId}`
          );
          setPoi(poiResponse.data.point_of_interest || poiResponse.data);
        } catch (error) {
          console.error("Error loading POI:", error);
        }
      }


      // Load available time slots for the guide
      if (guideId || booking.tour_guide_id) {
        await loadAvailableTimeSlots();
      }

    } catch (error) {
      console.error("Error loading booking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTimeSlots = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/guides/${guideId || booking.tour_guide_id}/availability`
      );
      setTimeSlots(response.data || []);
    } catch (error) {
      console.error("Error loading time slots:", error);
    }
  };

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

    if (!booking.tour_guide_id) {
      newErrors.tour_guide_id = "Please select a guide";
    }

    if (!booking.point_of_interest_id) {
      newErrors.point_of_interest_id = "Please select a destination";
    }

    if (booking.number_of_people < 1) {
      newErrors.number_of_people = "At least 1 participant is required";
    }

    if (booking.number_of_people > 20) {
      newErrors.number_of_people = "Maximum 20 participants allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalPrice = () => {
    if (!guide) return 0;
    const basePrice = guide.hourly_rate || 500;
    return basePrice * booking.duration_hours;
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

      if (response.data) {
        alert("🎉 Booking created successfully! You will receive a confirmation email shortly.");
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleGuideSelect = (selectedGuide) => {
    setGuide(selectedGuide);
    setBooking(prev => ({
      ...prev,
      tour_guide_id: selectedGuide.id
    }));
  };

  const handlePoiSelect = (selectedPoi) => {
    setPoi(selectedPoi);
    setBooking(prev => ({
      ...prev,
      point_of_interest_id: selectedPoi.id
    }));
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
                {/* Guide Selection */}
                {!guide && (
                  <div className="mb-4">
                    <label className="form-label">👤 Select a Guide</label>
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={() => navigate(`/poi/${poi?.id}/guides`)}
                    >
                      Browse Available Guides
                    </button>
                    {errors.tour_guide_id && (
                      <div className="text-danger small">{errors.tour_guide_id}</div>
                    )}
                  </div>
                )}

                {/* Guide Information */}
                {guide && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5>👤 Selected Guide</h5>
                        <div className="row">
                          <div className="col-md-3">
                            <img
                              src={guide.user?.profile_picture || "/assets/guides/default.jpg"}
                              alt={guide.user?.name}
                              className="img-fluid rounded"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <div className="col-md-9">
                            <h6>{guide.user?.name}</h6>
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
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setGuide(null)}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* POI Information */}
                {poi && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h5>📍 Selected Destination</h5>
                    <h6>{poi.name}</h6>
                    <p className="text-muted mb-0">{poi.description}</p>
                    {poi.address && (
                      <p className="text-muted small">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {poi.address}
                      </p>
                    )}
                  </div>
                )}

                {/* Date and Time */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="tour_date" className="form-label">
                      📅 Date
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.tour_date ? "is-invalid" : ""}`}
                      id="tour_date"
                      name="tour_date"
                      value={booking.tour_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.tour_date && (
                      <div className="invalid-feedback">{errors.tour_date}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="start_time" className="form-label">
                      🕐 Start Time
                    </label>
                    <input
                      type="time"
                      className={`form-control ${errors.start_time ? "is-invalid" : ""}`}
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
                    <label htmlFor="duration_hours" className="form-label">
                      ⏱️ Duration (hours)
                    </label>
                    <select
                      className="form-select"
                      id="duration_hours"
                      name="duration_hours"
                      value={booking.duration_hours}
                      onChange={handleChange}
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={5}>5 hours</option>
                      <option value={6}>6 hours</option>
                      <option value={7}>7 hours</option>
                      <option value={8}>8 hours</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="number_of_people" className="form-label">
                      👥 Number of Participants
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.number_of_people ? "is-invalid" : ""}`}
                      id="number_of_people"
                      name="number_of_people"
                      value={booking.number_of_people}
                      onChange={handleChange}
                      min="1"
                      max="20"
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
            className="card shadow border-0 sticky-top"
            style={{ top: "2rem" }}
          >
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Booking Summary</h5>
            </div>
            <div className="card-body">
              {guide && (
                <div className="mb-3">
                  <h6>Guide: {guide.user?.name}</h6>
                  <p className="text-muted mb-0">Rate: PHP {guide.hourly_rate || 500}/hour</p>
                </div>
              )}

              {poi && (
                <div className="mb-3">
                  <h6>Destination: {poi.name}</h6>
                  <p className="text-muted mb-0">{poi.address}</p>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span>Duration:</span>
                <span>{booking.duration_hours} hour(s)</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Participants:</span>
                <span>{booking.number_of_people}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <strong>Subtotal:</strong>
                <strong>PHP {calculateTotalPrice()}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <h6>Total:</h6>
                <h6 className="text-success">
                  PHP {calculateTotalPrice()}
                </h6>
              </div>

              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>📋 Booking Policy:</strong>
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