import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const GuideBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

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
        "http://127.0.0.1:8000/api/guides/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setBookings(response.data.bookings || []);
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

      await axios.patch(
        `http://127.0.0.1:8000/api/bookings/${bookingId}/status`,
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filterBookings = () => {
    return bookings.filter((booking) => {
      if (activeTab === "pending") {
        return booking.status === "pending";
      } else if (activeTab === "confirmed") {
        return booking.status === "confirmed";
      } else if (activeTab === "completed") {
        return booking.status === "completed";
      } else if (activeTab === "cancelled") {
        return booking.status === "cancelled" || booking.status === "rejected";
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
          <h2 className="fw-bold text-success">📋 My Tour Bookings</h2>
          <p className="text-muted mb-0">
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
            {filteredBookings.filter((b) => b.status === "pending").length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "confirmed" ? "active" : ""}`}
            onClick={() => setActiveTab("confirmed")}
          >
            ✅ Confirmed (
            {filteredBookings.filter((b) => b.status === "confirmed").length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            🎉 Completed (
            {filteredBookings.filter((b) => b.status === "completed").length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveTab("cancelled")}
          >
            ❌ Cancelled (
            {
              filteredBookings.filter(
                (b) => b.status === "cancelled" || b.status === "rejected"
              ).length
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
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="col-12 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{booking.poi_name}</h5>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="row text-muted small mb-2">
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>👤 Tourist:</strong> {booking.tourist_name}
                          </p>
                          <p className="mb-1">
                            <strong>📧 Email:</strong> {booking.tourist_email}
                          </p>
                          <p className="mb-1">
                            <strong>📞 Phone:</strong> {booking.tourist_phone}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>📅 Date:</strong> {formatDate(booking.date)}
                          </p>
                          <p className="mb-1">
                            <strong>🕐 Time:</strong>{" "}
                            {formatTime(booking.start_time)}
                          </p>
                          <p className="mb-1">
                            <strong>⏱️ Duration:</strong> {booking.duration}{" "}
                            hour(s)
                          </p>
                          <p className="mb-1">
                            <strong>👥 Participants:</strong>{" "}
                            {booking.participants}
                          </p>
                          <p className="mb-1">
                            <strong>💵 Total:</strong> PHP{" "}
                            {booking.total_amount}
                          </p>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <strong>📝 Special Requests:</strong>{" "}
                            {booking.special_requests}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="col-md-4 text-end">
                      <div className="d-grid gap-2">
                        {booking.status === "pending" && (
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

                        {booking.status === "confirmed" && (
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              updateBookingStatus(booking.id, "completed")
                            }
                          >
                            🎉 Mark as Completed
                          </button>
                        )}

                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            alert("Contact details will be shown here")
                          }
                        >
                          📞 Contact Tourist
                        </button>

                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            alert("Booking details will be shown here")
                          }
                        >
                          📋 View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuideBookings;
