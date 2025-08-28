import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    tourGuides: 0,
    activeBookings: 0,
    pendingApprovals: 0,
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

    loadDashboardStats();
  }, [navigate]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/dashboard-stats",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStats(
        response.data.stats || {
          totalUsers: 0,
          tourGuides: 0,
          activeBookings: 0,
          pendingApprovals: 0,
        }
      );
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      // Set default values when API is not available
      setStats({
        totalUsers: 0,
        tourGuides: 0,
        activeBookings: 0,
        pendingApprovals: 0,
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
    <div
      className="container py-5"
      style={{ fontFamily: "var(--font-family-primary)" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2
            className="fw-bold"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-family-heading)",
              fontSize: "2.5rem",
            }}
          >
            👑 Admin Dashboard
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1.1rem",
              marginBottom: "0",
            }}
          >
            Welcome, {user?.name || "Admin"}! Manage the Gabay Laguna platform
          </p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={loadDashboardStats}
          disabled={loading}
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
          }}
        >
          {loading ? "🔄 Loading..." : "🔄 Refresh Stats"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-5">
        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                👥
              </div>
              <h3
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {stats.totalUsers}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Total Users
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                🧭
              </div>
              <h3
                style={{
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {stats.tourGuides}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Tour Guides
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-info)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                📋
              </div>
              <h3
                style={{
                  color: "var(--color-info)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {stats.activeBookings}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Active Bookings
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-warning)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                ⏳
              </div>
              <h3
                style={{
                  color: "var(--color-warning)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {stats.pendingApprovals}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Pending Approvals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Management Cards - 2x2 Grid */}
      <div className="row">
        {/* User Management Card */}
        <div className="col-md-6 mb-4">
          <div
            className="card shadow-lg border-0 h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-success)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                    color: "white",
                    fontSize: "1.5rem",
                  }}
                >
                  👥
                </div>
                <h5
                  className="mb-0"
                  style={{
                    color: "var(--color-success)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                    fontSize: "1.3rem",
                  }}
                >
                  User Management
                </h5>
              </div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  flex: "1",
                  marginBottom: "1.5rem",
                }}
              >
                Manage user accounts, verify tour guides, and handle user
                status.
              </p>
              <button
                className="btn btn-lg w-100"
                onClick={() => navigate("/admin/user-management")}
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
                Manage Users
              </button>
            </div>
          </div>
        </div>

        {/* Reports & Analytics Card */}
        <div className="col-md-6 mb-4">
          <div
            className="card shadow-lg border-0 h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                    color: "white",
                    fontSize: "1.5rem",
                  }}
                >
                  📊
                </div>
                <h5
                  className="mb-0"
                  style={{
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                    fontSize: "1.3rem",
                  }}
                >
                  Reports & Analytics
                </h5>
              </div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  flex: "1",
                  marginBottom: "1.5rem",
                }}
              >
                View platform statistics, booking reports, and revenue
                analytics.
              </p>
              <button
                className="btn btn-lg w-100"
                onClick={() => navigate("/admin/reports")}
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
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
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Location Applications Card */}
        <div className="col-md-6 mb-4">
          <div
            className="card shadow-lg border-0 h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-danger)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                    color: "white",
                    fontSize: "1.5rem",
                  }}
                >
                  📍
                </div>
                <h5
                  className="mb-0"
                  style={{
                    color: "var(--color-danger)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                    fontSize: "1.3rem",
                  }}
                >
                  Location Applications
                </h5>
              </div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  flex: "1",
                  marginBottom: "1.5rem",
                }}
              >
                Review and approve guide requests to operate in specific
                destinations.
              </p>
              <button
                className="btn btn-lg w-100"
                onClick={() => navigate("/admin/location-applications")}
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-light) 100%)",
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
                Manage Applications
              </button>
            </div>
          </div>
        </div>

        {/* Spot Suggestions Card */}
        <div className="col-md-6 mb-4">
          <div
            className="card shadow-lg border-0 h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              transition: "var(--transition-normal)",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "var(--shadow-lg)";
            }}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-warning)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                    color: "white",
                    fontSize: "1.5rem",
                  }}
                >
                  🗺️
                </div>
                <h5
                  className="mb-0"
                  style={{
                    color: "var(--color-warning)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                    fontSize: "1.3rem",
                  }}
                >
                  Spot Suggestions
                </h5>
              </div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  flex: "1",
                  marginBottom: "1.5rem",
                }}
              >
                Review guide-submitted tourist spot suggestions before
                publishing.
              </p>
              <button
                className="btn btn-lg w-100"
                onClick={() => navigate("/admin/spot-suggestions")}
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-light) 100%)",
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
                Review Suggestions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
