import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const GuideDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    averageRating: 0,
    monthlyEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

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

    loadGuideStats();
  }, [navigate]);

  const loadGuideStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/guide/dashboard-stats",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStats(
        response.data.stats || {
          activeBookings: 0,
          averageRating: 0,
          monthlyEarnings: 0,
        }
      );
    } catch (error) {
      console.error("Error loading guide stats:", error);
      // Set default values when API is not available
      setStats({
        activeBookings: 0,
        averageRating: 0,
        monthlyEarnings: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-success">
            🧭 Welcome, {user?.name || "Guide"}!
          </h2>
          <p className="text-muted mb-0">
            Manage your tours, bookings, and profile information
          </p>
        </div>
        <button
          className="btn btn-outline-success"
          onClick={loadGuideStats}
          disabled={loading}
        >
          {loading ? "🔄 Loading..." : "🔄 Refresh Stats"}
        </button>
        <div>
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => navigate("/guide-profile")}
          >
            👤 View Profile
          </button>
          <button
            className="btn btn-outline-success me-2"
            onClick={() => navigate("/guide/location-applications")}
          >
            📍 Apply Locations
          </button>
          <button
            className="btn btn-outline-warning me-2"
            onClick={() => navigate("/guide/duty-locations")}
          >
            🎯 Duty Locations
          </button>
          <button
            className="btn btn-outline-info"
            onClick={() => navigate("/guide/spot-suggestions")}
          >
            🗺️ Suggest Spot
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-success">📋 Manage Bookings</h5>
              <p className="card-text">
                View and respond to booking requests, manage your schedule, and
                track tour status.
              </p>
              <button
                className="btn btn-success"
                onClick={() => navigate("/guide-bookings")}
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-warning">🎯 Duty Locations</h5>
              <p className="card-text">
                Select cities and specific locations where you want to work as a
                tour guide.
              </p>
              <button
                className="btn btn-warning"
                onClick={() => navigate("/guide/duty-locations")}
              >
                Manage Locations
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-primary">👤 Profile & Settings</h5>
              <p className="card-text">
                Update your profile information, availability, and tour guide
                preferences.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/guide-profile")}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h3 className="text-success">{stats.activeBookings}</h3>
              <p className="text-muted mb-0">Active Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h3 className="text-info">{stats.averageRating.toFixed(1)}</h3>
              <p className="text-muted mb-0">Average Rating</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h3 className="text-warning">
                PHP {stats.monthlyEarnings.toLocaleString()}
              </h3>
              <p className="text-muted mb-0">This Month's Earnings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;
