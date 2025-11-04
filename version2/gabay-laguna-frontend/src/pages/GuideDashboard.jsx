import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const GuideDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    averageRating: 0,
    monthlyEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(null);

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
      setPeriod(response.data.period || null);
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
            style={{ 
              color: "var(--color-primary)",
              fontFamily: "var(--font-family-heading)",
            }}
          >
            Welcome back, {user?.name || "Guide"}!
          </h1>
          <p className="lead mb-0" style={{ color: "var(--color-text-secondary)" }}>
            Manage your tours, bookings, and profile information
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={loadGuideStats}
            disabled={loading}
            style={{
              borderRadius: "var(--radius-lg)",
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              fontWeight: "600",
            }}
          >
            <i className="fas fa-sync-alt me-2"></i>
            {loading ? "Loading..." : "Refresh Stats"}
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/guide-profile")}
            style={{
              borderRadius: "var(--radius-lg)",
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              fontWeight: "600",
            }}
          >
            <i className="fas fa-user me-2"></i>
            Profile
          </button>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div 
            className="card h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
          >
            <div className="card-body text-center p-4">
              <h4 
                className="card-title mb-3"
                style={{ 
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                Manage Bookings
              </h4>
              <p className="card-text mb-4" style={{ color: "var(--color-text-secondary)" }}>
                View and respond to booking requests, manage your schedule, and
                track tour status.
              </p>
              <button
                className="btn btn-success btn-lg"
                onClick={() => navigate("/guide-bookings")}
                style={{
                  background: "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  fontWeight: "600",
                }}
              >
                <i className="fas fa-list me-2"></i>
                View Bookings
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div 
            className="card h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
          >
            <div className="card-body text-center p-4">
              <h4 
                className="card-title mb-3"
                style={{ 
                  color: "var(--color-warning)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                Locations
              </h4>
              <p className="card-text mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Select cities and specific locations where you want to work as a
                tour guide.
              </p>
              <button
                className="btn btn-warning btn-lg"
                onClick={() => navigate("/guide/location-applications")}
                style={{
                  background: "linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-light) 100%)",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  fontWeight: "600",
                }}
              >
                <i className="fas fa-map me-2"></i>
                Manage Locations
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div 
            className="card h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
          >
            <div className="card-body text-center p-4">
              <h4 
                className="card-title mb-3"
                style={{ 
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                Profile & Settings
              </h4>
              <p className="card-text mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Update your profile information, availability, and tour guide
                preferences.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/guide-profile")}
                style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  fontWeight: "600",
                }}
              >
                <i className="fas fa-edit me-2"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div 
            className="card h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
          >
            <div className="card-body text-center p-4">
              <h4 
                className="card-title mb-3"
                style={{ 
                  color: "var(--color-info)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                Spot Suggestions
              </h4>
              <p className="card-text mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Suggest new tourist spots to be added to the platform. Help
                expand the tour destinations.
              </p>
              <button
                className="btn btn-info btn-lg"
                onClick={() => navigate("/guide/spot-suggestions")}
                style={{
                  background: "linear-gradient(135deg, var(--color-info) 0%, var(--color-info-light) 100%)",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  fontWeight: "600",
                }}
              >
                <i className="fas fa-plus-circle me-2"></i>
                Suggest Spot
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="row mb-3">
        <div className="col-12">
          <h4 
            className="mb-0"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-family-heading)",
              fontWeight: "600",
            }}
          >
            Dashboard Statistics
            {period && (
              <small className="ms-2 text-muted">
                ({period.month})
              </small>
            )}
          </h4>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div 
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <h3 
                  style={{
                    color: "var(--color-success)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "700",
                  }}
                >
                  {stats.activeBookings}
                </h3>
              )}
              <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                Active Bookings
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div 
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border spinner-border-sm text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <h3 
                  style={{
                    color: "var(--color-info)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "700",
                  }}
                >
                  {stats.averageRating.toFixed(1)}
                </h3>
              )}
              <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                Average Rating
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div 
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border spinner-border-sm text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <h3 
                  style={{
                    color: "var(--color-warning)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "700",
                  }}
                >
                  PHP {stats.monthlyEarnings.toLocaleString()}
                </h3>
              )}
              <p className="mb-0" style={{ color: "var(--color-text-secondary)" }}>
                This Month's Earnings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;
