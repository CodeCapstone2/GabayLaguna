import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";
import GuideLocationUpdater from "../components/GuideLocationUpdater";

const GuideBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showLocationUpdater, setShowLocationUpdater] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [bookingToReject, setBookingToReject] = useState(null);

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

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/guide/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

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

  const handleRejectClick = (bookingId) => {
    setBookingToReject(bookingId);
    setShowRejectConfirm(true);
  };

  const updateBookingStatus = async (bookingId, status) => {
    // If rejecting, show confirmation modal first
    if (status === 'rejected') {
      handleRejectClick(bookingId);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/api/guide/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // Show success message with proper status formatting
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      alert(`Booking ${statusText} successfully!`);
      loadBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to update booking status. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const statusCode = error.response.status;
        const responseData = error.response.data;
        
        if (statusCode === 422) {
          // Validation error
          errorMessage = responseData.message || "Invalid booking status. Please try again.";
        } else if (statusCode === 404) {
          errorMessage = "Booking not found. It may have been deleted.";
        } else if (statusCode === 403) {
          errorMessage = "You don't have permission to update this booking.";
        } else if (statusCode === 401) {
          errorMessage = "Please log in again to continue.";
        } else {
          errorMessage = responseData.message || `Server error (${statusCode}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      alert(errorMessage);
    }
  };

  const confirmRejectBooking = async () => {
    if (!bookingToReject) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/api/guide/bookings/${bookingToReject}/status`,
        { status: 'rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      setShowRejectConfirm(false);
      setBookingToReject(null);
      alert("Booking rejected successfully!");
      loadBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to reject booking. Please try again.";
      
      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;
        
        if (statusCode === 422) {
          errorMessage = responseData.message || "Invalid booking status. Please try again.";
        } else if (statusCode === 404) {
          errorMessage = "Booking not found. It may have been deleted.";
        } else if (statusCode === 403) {
          errorMessage = "You don't have permission to update this booking.";
        } else if (statusCode === 401) {
          errorMessage = "Please log in again to continue.";
        } else {
          errorMessage = responseData.message || `Server error (${statusCode}). Please try again.`;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      alert(errorMessage);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: "bg-warning", text: "Pending" },
      confirmed: { class: "bg-success", text: "Confirmed" },
      completed: { class: "bg-info", text: "Completed" },
      cancelled: { class: "bg-danger", text: "Cancelled" },
      rejected: { class: "bg-secondary", text: "Rejected" },
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
      end_time: booking.end_time,
      duration: booking.duration_hours || booking.duration,
      participants: booking.number_of_people || booking.participants,
      total_amount: booking.total_amount,
      special_requests: booking.special_requests,

      // Tourist information
      tourist_name:
        booking.tourist?.name || booking.tourist_name || "Unknown Tourist",
      tourist_email:
        booking.tourist?.email || booking.tourist_email || "No email provided",
      tourist_phone:
        booking.tourist?.phone || booking.tourist_phone || "No phone provided",

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
    return bookings.filter((booking) => {
      const bookingInfo = getBookingInfo(booking);

      if (activeTab === "pending") {
        return bookingInfo.status === "pending";
      } else if (activeTab === "confirmed") {
        return bookingInfo.status === "confirmed";
      } else if (activeTab === "completed") {
        return bookingInfo.status === "completed";
      } else if (activeTab === "cancelled") {
        return (
          bookingInfo.status === "cancelled" ||
          bookingInfo.status === "rejected"
        );
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1
            className="fw-bold mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            My Tour Bookings
          </h1>
          <p className="lead mb-0">
            Manage your tour bookings and respond to tourist requests
          </p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/guide-dashboard")}
        >
          🏠 Back to Dashboard
        </button>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4" id="bookingTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            ⏳ Pending (
            {
              bookings.filter((booking) => {
                const bookingInfo = getBookingInfo(booking);
                return bookingInfo.status === "pending";
              }).length
            }
            )
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "confirmed" ? "active" : ""}`}
            onClick={() => setActiveTab("confirmed")}
          >
            ✅ Confirmed (
            {
              bookings.filter((booking) => {
                const bookingInfo = getBookingInfo(booking);
                return bookingInfo.status === "confirmed";
              }).length
            }
            )
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            🎉 Completed (
            {
              bookings.filter((booking) => {
                const bookingInfo = getBookingInfo(booking);
                return bookingInfo.status === "completed";
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
                return (
                  bookingInfo.status === "cancelled" ||
                  bookingInfo.status === "rejected"
                );
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
            {activeTab === "pending"
              ? "No pending booking requests at the moment."
              : activeTab === "confirmed"
              ? "No confirmed bookings scheduled."
              : activeTab === "completed"
              ? "No completed tours yet."
              : "No cancelled or rejected bookings."}
          </p>
        </div>
      ) : (
        <div className="row">
          {filteredBookings.map((booking) => {
            const bookingInfo = getBookingInfo(booking);

            return (
              <div key={booking.id} className="col-12 mb-4">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">
                            {bookingInfo.poi_name}
                          </h5>
                          {getStatusBadge(bookingInfo.status)}
                        </div>

                        <div className="row text-muted small mb-2">
                          <div className="col-md-6">
                            <p className="mb-1">
                              <strong>👤 Tourist:</strong>{" "}
                              {bookingInfo.tourist_name}
                            </p>
                            <p className="mb-1">
                              <strong>📧 Email:</strong>{" "}
                              {bookingInfo.tourist_email}
                            </p>
                            <p className="mb-1">
                              <strong>📞 Phone:</strong>{" "}
                              {bookingInfo.tourist_phone}
                            </p>
                            <p className="mb-1">
                              <strong>📍 Location:</strong>{" "}
                              {bookingInfo.poi_address}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p className="mb-1">
                              <strong>📅 Date:</strong>{" "}
                              {formatDate(bookingInfo.date)}
                            </p>
                            <p className="mb-1">
                              <strong>🕐 Time:</strong>{" "}
                              {formatTime(bookingInfo.start_time)} -{" "}
                              {formatTime(bookingInfo.end_time)}
                            </p>
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
                          {bookingInfo.status === "pending" && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  updateBookingStatus(booking.id, "confirmed")
                                }
                              >
                                ✅ Accept Booking
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRejectClick(booking.id)}
                              >
                                ❌ Reject Booking
                              </button>
                            </>
                          )}

                          {bookingInfo.status === "confirmed" && (
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() =>
                                updateBookingStatus(booking.id, "completed")
                              }
                            >
                              🎉 Mark as Completed
                            </button>
                          )}

                          {/* Location Tracking Button for confirmed/in_progress bookings */}
                          {(bookingInfo.status === "confirmed" ||
                            bookingInfo.status === "in_progress") && (
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowLocationUpdater(true);
                              }}
                            >
                              📍 Share Location
                            </button>
                          )}

                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              setSelectedBooking({
                                id: booking.id,
                                tourist_name: bookingInfo.tourist_name,
                                tourist_email: bookingInfo.tourist_email,
                                tourist_phone: bookingInfo.tourist_phone,
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
                            📞 Contact Tourist
                          </button>

                          <button
                            className="btn btn-outline-primary btn-sm"
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

      {/* Location Updater Modal */}
      {showLocationUpdater && selectedBooking && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-location-arrow text-primary me-2"></i>
                  Share Your Location
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowLocationUpdater(false);
                    setSelectedBooking(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {selectedBooking && (
                  <GuideLocationUpdater
                    bookingId={selectedBooking.id}
                    onLocationUpdate={(locationData) => {
                      console.log("Location updated:", locationData);
                    }}
                  />
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLocationUpdater(false);
                    setSelectedBooking(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Tourist Modal */}
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
                  background: "linear-gradient(135deg, var(--color-info) 0%, var(--color-info-light) 100%)",
                  borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
                  border: "none",
                }}
              >
                <h5 className="modal-title text-white d-flex align-items-center">
                  <i className="fas fa-user me-2"></i>
                  Tourist Contact Information
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowContactModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <h6
                  className="mb-4"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-user-circle me-2 text-primary"></i>
                  Contact Details for {selectedBooking.tourist_name}
                </h6>
                <div className="row g-3">
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
                        <i className="fas fa-user me-2 text-primary"></i>
                        <strong style={{ color: "var(--color-text)" }}>Name:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {selectedBooking.tourist_name}
                      </p>
                    </div>
                  </div>
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
                        <i className="fas fa-envelope me-2 text-danger"></i>
                        <strong style={{ color: "var(--color-text)" }}>Email:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        <a
                          href={`mailto:${selectedBooking.tourist_email}`}
                          style={{
                            color: "var(--color-primary)",
                            textDecoration: "none",
                          }}
                        >
                          {selectedBooking.tourist_email}
                        </a>
                      </p>
                    </div>
                  </div>
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
                        <i className="fas fa-phone me-2 text-success"></i>
                        <strong style={{ color: "var(--color-text)" }}>Phone:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        <a
                          href={`tel:${selectedBooking.tourist_phone}`}
                          style={{
                            color: "var(--color-primary)",
                            textDecoration: "none",
                          }}
                        >
                          {selectedBooking.tourist_phone}
                        </a>
                      </p>
                    </div>
                  </div>
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
                  className="btn btn-info"
                  onClick={() => {
                    window.location.href = `mailto:${selectedBooking.tourist_email}`;
                  }}
                  style={{
                    background: "linear-gradient(135deg, var(--color-info) 0%, var(--color-info-light) 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-envelope me-2"></i>
                  Send Email
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    window.location.href = `tel:${selectedBooking.tourist_phone}`;
                  }}
                  style={{
                    background: "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-phone me-2"></i>
                  Call Now
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
                        <i className="fas fa-user me-2 text-primary"></i>
                        <strong style={{ color: "var(--color-text)" }}>Tourist:</strong>
                      </div>
                      <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                        {selectedBooking.tourist_name}
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
                        {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
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

      {/* Reject Booking Confirmation Modal */}
      {showRejectConfirm && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setShowRejectConfirm(false);
            setBookingToReject(null);
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
                  Confirm Rejection
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowRejectConfirm(false);
                    setBookingToReject(null);
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
                  Are you sure you want to reject this booking?
                </h6>
                <p
                  className="text-center mb-0"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  This action cannot be undone. The tourist will be notified of your rejection.
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
                    setShowRejectConfirm(false);
                    setBookingToReject(null);
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
                  onClick={confirmRejectBooking}
                  style={{
                    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-check me-2"></i>
                  Yes, Reject Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideBookings;
