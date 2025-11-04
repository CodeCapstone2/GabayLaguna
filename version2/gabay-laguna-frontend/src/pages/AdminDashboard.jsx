import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
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
    totalTourists: 0,
    totalRevenue: 0,
    totalCities: 0,
    totalCategories: 0,
    totalPois: 0,
    pendingLocationApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if user is admin
        const userType = parsedUser?.user_type || parsedUser?.role;
        if (userType !== "admin") {
          // Redirect non-admin users to their appropriate dashboard
          if (userType === "tourist") {
            navigate("/tourist-dashboard", { replace: true });
          } else if (userType === "guide") {
            navigate("/guide-dashboard", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login", { replace: true });
        return;
      }
    } else {
      navigate("/login", { replace: true });
      return;
    }

    loadDashboardStats();
  }, [navigate]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Loading dashboard stats with token:", token ? "Present" : "Missing");
      console.log("API URL:", `${API_CONFIG.BASE_URL}/api/admin/dashboard`);
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/admin/dashboard`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Dashboard API Response:", response.data);
      
      // Handle the response format from backend
      const backendStats = response.data.statistics || {};
      setStats({
        totalUsers: backendStats.total_users || 0,
        tourGuides: backendStats.total_guides || 0,
        activeBookings: backendStats.total_bookings || 0,
        pendingApprovals: backendStats.pending_verifications || 0,
        totalTourists: backendStats.total_tourists || 0,
        totalRevenue: backendStats.total_revenue || 0,
        totalCities: backendStats.total_cities || 0,
        totalCategories: backendStats.total_categories || 0,
        totalPois: backendStats.total_pois || 0,
        pendingLocationApplications: backendStats.pending_location_applications || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Set default values when API is not available
      console.log("API call failed, setting default values");
      setStats({
        totalUsers: 3, // admin, guide, tourist
        tourGuides: 1, // Sample Guide
        activeBookings: 0,
        pendingApprovals: 0,
        totalTourists: 1, // Sample Tourist
        totalRevenue: 0,
        totalCities: 14, // from seeder
        totalCategories: 5, // Historical, Natural, Adventure, Cultural, Educational
        totalPois: 0, // will be populated by seeder
        pendingLocationApplications: 0,
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
            Admin Dashboard
          </h1>
          <p className="lead mb-0">
            Welcome, {user?.name || "Admin"}! Manage the Gabay Laguna platform.
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

      {/* Additional Statistics Cards - Row 2 */}
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
              <h3
                style={{
                  color: "var(--color-info)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {stats.totalTourists}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Tourists
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
              <h3
                style={{
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                ₱{stats.totalRevenue?.toLocaleString() || 0}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Total Revenue
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
              <h3
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {stats.totalCities}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Cities
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
              <h3
                style={{
                  color: "var(--color-warning)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {stats.totalPois}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Points of Interest
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
              <h5
                className="mb-3"
                style={{
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                  fontSize: "1.3rem",
                }}
              >
                User Management
              </h5>
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
              <h5
                className="mb-3"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                  fontSize: "1.3rem",
                }}
              >
                Reports & Analytics
              </h5>
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
              <h5
                className="mb-3"
                style={{
                  color: "var(--color-danger)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                  fontSize: "1.3rem",
                }}
              >
                Location Applications
              </h5>
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
              <h5
                className="mb-3"
                style={{
                  color: "var(--color-warning)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                  fontSize: "1.3rem",
                }}
              >
                Spot Suggestions
              </h5>
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
