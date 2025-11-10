import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";
import PaymentModal from "../components/PaymentModal";
import ReviewModal from "../components/ReviewModal";
import API_CONFIG from "../config/api";
import GuideLocationTracker from "../components/GuideLocationTracker";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        // User data parsed but not stored in state
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    loadBookings();
  }, [navigate]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Handle different API response formats
      let bookingsData = [];

      if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.data.bookings) {
        bookingsData = response.data.bookings.data || response.data.bookings;
      } else if (response.data.data) {
        bookingsData = response.data.data;
      } else {
        bookingsData = [];
      }

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowCancelConfirm(true);
  };

  const cancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_CONFIG.BASE_URL}/api/bookings/${bookingToCancel}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setShowCancelConfirm(false);
      setBookingToCancel(null);
      alert("Booking cancelled successfully!");
      loadBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: "bg-warning", text: "Pending" },
      confirmed: { class: "bg-success", text: "Confirmed" },
      completed: { class: "bg-info", text: "Completed" },
      cancelled: { class: "bg-danger", text: "Cancelled" },
      rejected: { class: "bg-danger", text: "Cancelled" }, // Show as "Cancelled" for user clarity
    };

    const config = statusConfig[status] || {
      class: "bg-secondary",
      text: status,
    };

    return (
      <span className={`badge ${config.class} text-white`}>{config.text}</span>
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return "N/A";

      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  // Helper function to extract data from booking object
  const getBookingInfo = (booking) => {
    // Handle different response formats
    return {
      id: booking.id,
      status: booking.status,
      date: booking.tour_date || booking.date,
      start_time: booking.start_time,
      duration: booking.duration_hours || booking.duration,
      participants: booking.number_of_people || booking.participants,
      total_amount: booking.total_amount,
      special_requests: booking.special_requests,

      // Guide information
      guide_name:
        booking.tour_guide?.user?.name ||
        booking.guide_name ||
        booking.tour_guide_name ||
        "Unknown Guide",

      // POI information
      poi_name:
        booking.point_of_interest?.name ||
        booking.poi_name ||
        booking.point_of_interest_name ||
        "Unknown Location",

      poi_address:
        booking.point_of_interest?.address ||
        booking.poi_address ||
        "Address not available",
    };
  };

  const filterBookings = () => {
    const now = new Date();
    now.setSeconds(0, 0);

    return bookings.filter((booking) => {
      const bookingInfo = getBookingInfo(booking);
      const start = new Date(bookingInfo.date);
      const isCompleted = bookingInfo.status === "completed" || start < now;

      if (activeTab === "upcoming") {
        return !isCompleted && bookingInfo.status !== "cancelled" && bookingInfo.status !== "rejected";
      } else if (activeTab === "past") {
        return (isCompleted || bookingInfo.status === "completed") && bookingInfo.status !== "cancelled" && bookingInfo.status !== "rejected";
      } else if (activeTab === "cancelled") {
        return bookingInfo.status === "cancelled" || bookingInfo.status === "rejected";
      }

      return true;
    });
  };

  const filteredBookings = filterBookings();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 
            className="fw-bold"
            style={{
              color: "var(--color-success)",
              fontFamily: "var(--font-family-heading)",
            }}
          >
            📋 My Bookings
          </h2>
          <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
            Manage your tour bookings and view booking history
          </p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/cities")}
          style={{
            borderRadius: "var(--radius-lg)",
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
            fontWeight: "600",
          }}
        >
          🗺️ Explore More Tours
        </button>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4" id="bookingTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            🔮 Upcoming (
            {
              bookings.filter((booking) => {
                const bookingInfo = getBookingInfo(booking);
                const now = new Date();
                now.setSeconds(0, 0);
                const start = new Date(bookingInfo.date);
                const isCompleted = bookingInfo.status === "completed" || start < now;
                return !isCompleted && bookingInfo.status !== "cancelled" && bookingInfo.status !== "rejected";
              }).length
            }
            )
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            📚 Past (
            {
              bookings.filter((booking) => {
                const bookingInfo = getBookingInfo(booking);
                const now = new Date();
                now.setSeconds(0, 0);
                const start = new Date(bookingInfo.date);
                const isCompleted = bookingInfo.status === "completed" || start < now;
                return (isCompleted || bookingInfo.status === "completed") && bookingInfo.status !== "cancelled" && bookingInfo.status !== "rejected";
              }).length
            }
            )
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveTab("cancelled")}
          >
            ❌ Cancelled (
            {
              bookings.filter((booking) => {
                const bookingInfo = getBookingInfo(booking);
                return bookingInfo.status === "cancelled" || bookingInfo.status === "rejected";
              }).length
            }
            )
          </button>
        </li>
      </ul>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="fas fa-calendar-times fa-3x text-muted"></i>
          </div>
          <h5 className="text-muted">No {activeTab} bookings found</h5>
          <p className="text-muted">
            {activeTab === "upcoming"
              ? "Start exploring and book your next adventure!"
              : activeTab === "past"
              ? "Your completed tours will appear here."
              : "Cancelled bookings will appear here."}
          </p>
          {activeTab === "upcoming" && (
            <button
              className="btn btn-success"
              onClick={() => navigate("/cities")}
            >
              🗺️ Explore Tours
            </button>
          )}
        </div>
      ) : (
        <div className="row">
          {filteredBookings.map((booking) => {
            const bookingInfo = getBookingInfo(booking);

            return (
              <div key={booking.id} className="col-12 mb-4">
                <div 
                  className="card shadow-sm"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 
                            className="card-title mb-0"
                            style={{
                              color: "var(--color-text)",
                              fontFamily: "var(--font-family-heading)",
                              fontWeight: "600",
                            }}
                          >
                            {bookingInfo.poi_name}
                          </h5>
                          {getStatusBadge(bookingInfo.status)}
                        </div>

                        <div className="row small mb-2" style={{ color: "var(--color-text-secondary)" }}>
                          <div className="col-md-6">
                            <p className="mb-1">
                              <strong>👤 Guide:</strong>{" "}
                              {bookingInfo.guide_name}
                            </p>
                            <p className="mb-1">
                              <strong>📅 Date:</strong>{" "}
                              {formatDate(bookingInfo.date)}
                            </p>
                            <p className="mb-1">
                              <strong>🕐 Time:</strong>{" "}
                              {formatTime(bookingInfo.start_time)}
                            </p>
                            <p className="mb-1">
                              <strong>📍 Address:</strong>{" "}
                              {bookingInfo.poi_address}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p className="mb-1">
                              <strong>⏱️ Duration:</strong>{" "}
                              {bookingInfo.duration} hour(s)
                            </p>
                            <p className="mb-1">
                              <strong>👥 Participants:</strong>{" "}
                              {bookingInfo.participants}
                            </p>
                            <p className="mb-1">
                              <strong>💵 Total:</strong> PHP{" "}
                              {bookingInfo.total_amount || "0.00"}
                            </p>
                          </div>
                        </div>

                        {bookingInfo.special_requests && (
                          <div className="mb-2">
                            <small className="text-muted">
                              <strong>📝 Special Requests:</strong>{" "}
                              {bookingInfo.special_requests}
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 text-end">
                        <div className="d-grid gap-2">
                          {bookingInfo.status === "confirmed" && (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => {
                                setSelectedBooking({
                                  id: booking.id,
                                  guide_name: bookingInfo.guide_name,
                                  poi_name: bookingInfo.poi_name,
                                  date: bookingInfo.date,
                                });
                                setShowContactModal(true);
                              }}
                              style={{
                                borderRadius: "var(--radius-md)",
                                fontWeight: "600",
                              }}
                            >
                              📞 Contact Guide
                            </button>
                          )}

                          {bookingInfo.status === "pending" && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleCancelClick(booking.id)}
                            >
                              ❌ Cancel Booking
                            </button>
                          )}
                          {bookingInfo.status === "pending" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                setSelectedBooking({
                                  id: booking.id,
                                  poi_name: bookingInfo.poi_name,
                                  total_amount: bookingInfo.total_amount,
                                });
                                setShowPayment(true);
                              }}
                            >
                              💳 Pay Now
                            </button>
                          )}

                          {bookingInfo.status === "completed" && (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                setSelectedBooking({
                                  id: booking.id,
                                  guide_id:
                                    booking.tour_guide_id ||
                                    booking.tour_guide?.id,
                                });
                                setShowReview(true);
                              }}
                            >
                              ⭐ Leave Review
                            </button>
                          )}

                          {(bookingInfo.status === "confirmed" ||
                            bookingInfo.status === "in_progress") && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedBooking({
                                  id: booking.id,
                                  guide: {
                                    name: bookingInfo.guide_name,
                                  },
                                  poi: {
                                    name: bookingInfo.poi_name,
                                    // Optional lat/lng if available in booking payloads
                                    latitude:
                                      booking.point_of_interest?.latitude ||
                                      null,
                                    longitude:
                                      booking.point_of_interest?.longitude ||
                                      null,
                                  },
                                });
                                setShowLocationTracker(true);
                              }}
                            >
                              📍 Track Guide
                            </button>
                          )}

                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              setSelectedBooking({
                                id: booking.id,
                                ...bookingInfo,
                                booking: booking,
                              });
                              setShowDetailsModal(true);
                            }}
                            style={{
                              borderRadius: "var(--radius-md)",
                              fontWeight: "600",
                            }}
                          >
                            📋 View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Location Tracker Modal */}
      {showLocationTracker && selectedBooking && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                  Track Guide
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLocationTracker(false)}
                ></button>
              </div>
              <div className="modal-body">
                <GuideLocationTracker
                  bookingId={selectedBooking.id}
                  guide={selectedBooking.guide}
                  poi={selectedBooking.poi}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLocationTracker(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedBooking && (
        <PaymentModal
          booking={selectedBooking}
          onClose={() => setShowPayment(false)}
          onSuccess={(data) => {
            setShowPayment(false);
            alert("Payment successful! Booking confirmed.");
            loadBookings();
          }}
        />
      )}

      {/* Review Modal */}
      {showReview && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          guideId={selectedBooking.guide_id}
          onClose={() => setShowReview(false)}
          onSubmitted={() => {
            setShowReview(false);
            alert("Thanks for your feedback!");
          }}
        />
      )}

      {/* Contact Guide Modal */}
      {showContactModal && selectedBooking && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "var(--radius-2xl)",
                border: "none",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div
                className="modal-header"
                style={{
                  background: "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                  borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
                  border: "none",
                }}
              >
                <h5 className="modal-title text-white d-flex align-items-center">
                  <i className="fas fa-phone me-2"></i>
                  Contact Your Guide
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowContactModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <h6
                  className="text-center mb-3"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-envelope me-2 text-success"></i>
                  Contact Information
                </h6>
                <p
                  className="text-center mb-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Contact details for <strong>{selectedBooking.guide_name}</strong> will be sent to your registered email address.
                </p>
                <div
                  className="alert alert-info mb-0"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    border: "none",
                    borderLeft: "4px solid var(--color-info)",
                  }}
                >
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> You will receive an email with the guide's contact information shortly.
                </div>
              </div>
              <div
                className="modal-footer"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowContactModal(false)}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    setShowContactModal(false);
                    alert("Contact details will be sent to your email!");
                  }}
                  style={{
                    background: "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Contact Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "var(--radius-2xl)",
                border: "none",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div
                className="modal-header"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
                  border: "none",
                }}
              >
                <h5 className="modal-title text-white d-flex align-items-center">
                  <i className="fas fa-file-alt me-2"></i>
                  Booking Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-user-circle me-2 text-primary"></i>
                        <strong style={{ color: "var(--color-text)" }}>Guide:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {selectedBooking.guide_name}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                        <strong style={{ color: "var(--color-text)" }}>Location:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {selectedBooking.poi_name}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-calendar me-2 text-success"></i>
                        <strong style={{ color: "var(--color-text)" }}>Date:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {formatDate(selectedBooking.date)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-clock me-2 text-warning"></i>
                        <strong style={{ color: "var(--color-text)" }}>Time:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {formatTime(selectedBooking.start_time)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-hourglass-half me-2 text-info"></i>
                        <strong style={{ color: "var(--color-text)" }}>Duration:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {selectedBooking.duration} hour(s)
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-users me-2 text-primary"></i>
                        <strong style={{ color: "var(--color-text)" }}>Participants:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {selectedBooking.participants}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-tag me-2 text-success"></i>
                        <strong style={{ color: "var(--color-text)" }}>Status:</strong>
                      </div>
                      <p className="mb-0">
                        {getStatusBadge(selectedBooking.status)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-money-bill-wave me-2 text-success"></i>
                        <strong style={{ color: "var(--color-text)" }}>Total Amount:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-success)", fontWeight: "600" }}>
                        PHP {selectedBooking.total_amount || "0.00"}
                      </p>
                    </div>
                  </div>
                  {selectedBooking.special_requests && (
                    <div className="col-12">
                      <div
                        className="p-3"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-sticky-note me-2 text-warning"></i>
                          <strong style={{ color: "var(--color-text)" }}>Special Requests:</strong>
                        </div>
                        <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                          {selectedBooking.special_requests}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedBooking.poi_address && (
                    <div className="col-12">
                      <div
                        className="p-3"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-map-pin me-2 text-danger"></i>
                          <strong style={{ color: "var(--color-text)" }}>Address:</strong>
                        </div>
                        <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                          {selectedBooking.poi_address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="modal-footer"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-check me-2"></i>
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setShowCancelConfirm(false);
            setBookingToCancel(null);
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: "var(--radius-2xl)",
                border: "none",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div
                className="modal-header"
                style={{
                  background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                  borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
                  border: "none",
                }}
              >
                <h5 className="modal-title text-white d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Confirm Cancellation
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setBookingToCancel(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  <i className="fas fa-question-circle fa-3x text-warning mb-3"></i>
                </div>
                <h6
                  className="text-center mb-3"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                  }}
                >
                  Are you sure you want to cancel this booking?
                </h6>
                <p
                  className="text-center mb-0"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  This action cannot be undone. If you cancel within 24 hours of booking, you may be eligible for a refund.
                </p>
              </div>
              <div
                className="modal-footer"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setBookingToCancel(null);
                  }}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  No, Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={cancelBooking}
                  style={{
                    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-check me-2"></i>
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
