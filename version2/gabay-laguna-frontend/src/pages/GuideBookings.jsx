import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import GuideLocationUpdater from "../components/GuideLocationUpdater";

const GuideBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showLocationUpdater, setShowLocationUpdater] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
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

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
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

      alert(`Booking ${status} successfully!`);
      loadBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status. Please try again.");
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
                                onClick={() =>
                                  updateBookingStatus(booking.id, "rejected")
                                }
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
                              alert(`Tourist Contact Information:\n
Name: ${bookingInfo.tourist_name}\n
Email: ${bookingInfo.tourist_email}\n
Phone: ${bookingInfo.tourist_phone}`);
                            }}
                          >
                            📞 Contact Tourist
                          </button>

                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              alert(`Booking Details:\n
Status: ${bookingInfo.status}\n
Tourist: ${bookingInfo.tourist_name}\n
Location: ${bookingInfo.poi_name}\n
Address: ${bookingInfo.poi_address}\n
Date: ${formatDate(bookingInfo.date)}\n
Time: ${formatTime(bookingInfo.start_time)} - ${formatTime(
                                bookingInfo.end_time
                              )}\n
Duration: ${bookingInfo.duration} hours\n
Participants: ${bookingInfo.participants}\n
Total: PHP ${bookingInfo.total_amount || "0.00"}\n
Special Requests: ${bookingInfo.special_requests || "None"}`);
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
    </div>
  );
};

export default GuideBookings;
