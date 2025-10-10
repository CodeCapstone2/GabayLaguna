import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
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
        `${API_CONFIG.BASE_URL}/api/guide/dashboard-stats`,
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1
            className="fw-bold mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            Welcome back, {user?.name || "Guide"}!
          </h1>
          <p className="lead mb-0">
            Manage your tours, bookings, and profile information
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={loadGuideStats}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            {loading ? "Loading..." : "Refresh Stats"}
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/guide-profile")}
          >
            <i className="fas fa-user me-2"></i>
            Profile
          </button>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-calendar-check fa-3x text-success"></i>
              </div>
              <h4 className="card-title mb-3">Manage Bookings</h4>
              <p className="card-text mb-4">
                View and respond to booking requests, manage your schedule, and
                track tour status.
              </p>
              <button
                className="btn btn-success btn-lg"
                onClick={() => navigate("/guide-bookings")}
              >
                <i className="fas fa-list me-2"></i>
                View Bookings
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-map-marker-alt fa-3x text-warning"></i>
              </div>
              <h4 className="card-title mb-3">Duty Locations</h4>
              <p className="card-text mb-4">
                Select cities and specific locations where you want to work as a
                tour guide.
              </p>
              <button
                className="btn btn-warning btn-lg"
                onClick={() => navigate("/guide/duty-locations")}
              >
                <i className="fas fa-map me-2"></i>
                Manage Locations
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-user-cog fa-3x text-primary"></i>
              </div>
              <h4 className="card-title mb-3">Profile & Settings</h4>
              <p className="card-text mb-4">
                Update your profile information, availability, and tour guide
                preferences.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/guide-profile")}
              >
                <i className="fas fa-edit me-2"></i>
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
