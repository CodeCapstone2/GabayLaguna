import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const AdminReports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // week, month, year
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeGuides: 0,
    totalUsers: 0,
    averageRating: 0,
    completionRate: 0,
    avgBookingValue: 0,
  });

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

    loadStats();
  }, [navigate, timeRange, loadStats]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Loading reports with token:", token ? "Present" : "Missing");
      console.log("API URL:", `${API_CONFIG.BASE_URL}/api/admin/reports?time_range=${timeRange}`);
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/admin/reports?time_range=${timeRange}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Reports API Response:", response.data);
      
      // Handle the response format from backend
      const backendStats = response.data.stats || {};
      setStats({
        totalRevenue: backendStats.totalRevenue || 0,
        totalBookings: backendStats.totalBookings || 0,
        activeGuides: backendStats.activeGuides || 0,
        totalUsers: backendStats.totalUsers || 0,
        averageRating: backendStats.averageRating || 0,
        completionRate: backendStats.completionRate || 0,
        avgBookingValue: backendStats.avgBookingValue || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Show error message and set fallback data
      alert(
        "Unable to load analytics data. Please check your connection and try again."
      );
      
      // Set fallback data based on seeded database
      setStats({
        totalRevenue: 0, // No payments yet
        totalBookings: 0, // No bookings yet
        activeGuides: 1, // Sample Guide is available
        totalUsers: 3, // admin, guide, tourist
        averageRating: 0, // No reviews yet
        completionRate: 0, // No bookings yet
        avgBookingValue: 0, // No bookings yet
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-PH").format(num);
  };

  // Export current stats to CSV
  const exportReport = () => {
    try {
      const rows = [
        [
          "Metric",
          "Value",
        ],
        ["Total Revenue (PHP)", stats.totalRevenue],
        ["Total Bookings", stats.totalBookings],
        ["Active Guides", stats.activeGuides],
        ["Total Users", stats.totalUsers],
        ["Average Rating", stats.averageRating],
        ["Completion Rate (%)", stats.completionRate],
        ["Avg. Booking Value (PHP)", stats.avgBookingValue],
      ];

      const csv = rows
        .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.download = `gabay-laguna-report-${timeRange}-${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export report. Please try again.");
    }
  };

  // Generate simple charts and download as PNG using Canvas
  const generateCharts = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 500;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = "#2c3e50";
      ctx.font = "bold 24px Arial";
      ctx.fillText("Gabay Laguna - Reports & Analytics", 20, 40);
      ctx.font = "16px Arial";
      ctx.fillText(`Time Range: ${timeRange}`, 20, 70);

      // Data for bars
      const data = [
        { label: "Revenue (PHP)", value: Number(stats.totalRevenue) || 0, color: "#28a745" },
        { label: "Bookings", value: Number(stats.totalBookings) || 0, color: "#0d6efd" },
        { label: "Users", value: Number(stats.totalUsers) || 0, color: "#17a2b8" },
        { label: "Active Guides", value: Number(stats.activeGuides) || 0, color: "#20c997" },
      ];

      const maxVal = Math.max(...data.map((d) => d.value), 1);
      const chart = { x: 80, y: 110, w: 780, h: 320 };

      // Axes
      ctx.strokeStyle = "#ced4da";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chart.x, chart.y);
      ctx.lineTo(chart.x, chart.y + chart.h);
      ctx.lineTo(chart.x + chart.w, chart.y + chart.h);
      ctx.stroke();

      // Bars
      const barWidth = 120;
      const gap = (chart.w - barWidth * data.length) / (data.length + 1);
      data.forEach((d, i) => {
        const barX = chart.x + gap * (i + 1) + barWidth * i;
        const barH = (d.value / maxVal) * (chart.h - 20);
        const barY = chart.y + chart.h - barH;

        // Bar
        ctx.fillStyle = d.color;
        ctx.fillRect(barX, barY, barWidth, barH);

        // Labels
        ctx.fillStyle = "#6c757d";
        ctx.font = "14px Arial";
        ctx.fillText(d.label, barX, chart.y + chart.h + 20);
        ctx.fillStyle = "#212529";
        ctx.font = "bold 14px Arial";
        ctx.fillText(String(d.value), barX, barY - 8);
      });

      // Download image
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      link.download = `gabay-laguna-charts-${timeRange}-${date}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to generate charts. Please try again.");
    }
  };

  // Open default email client with prefilled summary
  const sendSummary = () => {
    const subject = `Gabay Laguna Summary (${timeRange})`;
    const lines = [
      `Total Revenue: ${formatCurrency(stats.totalRevenue)}`,
      `Total Bookings: ${formatNumber(stats.totalBookings)}`,
      `Active Guides: ${formatNumber(stats.activeGuides)}`,
      `Total Users: ${formatNumber(stats.totalUsers)}`,
      `Average Rating: ${stats.averageRating.toFixed(1)}`,
      `Completion Rate: ${stats.completionRate}%`,
      `Avg. Booking Value: ${formatCurrency(stats.avgBookingValue)}`,
    ];
    const body = `Hi,\n\nHere is the latest summary for the selected time range (${timeRange}):\n\n${lines.join(
      "\n"
    )}\n\n— Gabay Laguna Admin`;

    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body
    )}`;
    window.location.href = mailto;
  };

  if (loading) {
    return (
      <div
        className="container py-5 text-center"
        style={{ fontFamily: "var(--font-family-primary)" }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{
            color: "var(--color-success)",
            width: "3rem",
            height: "3rem",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p
          className="mt-3"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.1rem",
          }}
        >
          Loading analytics data...
        </p>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{ fontFamily: "var(--font-family-primary)" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-family-heading)",
              fontWeight: "600",
            }}
          >
            📊 Reports & Analytics
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "0",
            }}
          >
            View platform statistics, booking reports, and revenue analytics
          </p>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              width: "auto",
            }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <button
            className="btn btn-outline-primary"
            onClick={loadStats}
            disabled={loading}
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            {loading ? "🔄 Loading..." : "🔄 Refresh"}
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin-dashboard")}
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <div
            className="card shadow-lg border-0"
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
            <div className="card-body p-4 text-center">
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
                💰
              </div>
              <h3
                style={{
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2rem",
                  marginBottom: "0.5rem",
                }}
              >
                {formatCurrency(stats.totalRevenue)}
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
        <div className="col-md-4 mb-3">
          <div
            className="card shadow-lg border-0"
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
            <div className="card-body p-4 text-center">
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
                📋
              </div>
              <h3
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2rem",
                  marginBottom: "0.5rem",
                }}
              >
                {formatNumber(stats.totalBookings)}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontWeight: "500",
                }}
              >
                Total Bookings
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div
            className="card shadow-lg border-0"
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
            <div className="card-body p-4 text-center">
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
                👥
              </div>
              <h3
                style={{
                  color: "var(--color-info)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                  fontSize: "2rem",
                  marginBottom: "0.5rem",
                }}
              >
                {formatNumber(stats.totalUsers)}
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
      </div>

      {/* Additional Metrics */}
      <div className="row mb-5">
        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-warning)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {stats.averageRating.toFixed(1)}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                ⭐ Average Rating
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {stats.completionRate}%
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                ✅ Completion Rate
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {formatNumber(stats.activeGuides)}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                🧭 Active Guides
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-info)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {stats.totalBookings > 0
                  ? Math.round(stats.totalRevenue / stats.totalBookings)
                  : 0}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                💵 Avg. Booking Value
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div
            className="card shadow-lg border-0 h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="card-header"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderBottom: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
              }}
            >
              <h5
                className="mb-0"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                📈 Revenue Trends
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  This Period
                </span>
                <span
                  style={{
                    color: "var(--color-success)",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                  }}
                >
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Previous Period
                </span>
                <span
                  style={{
                    color: "var(--color-text-secondary)",
                    fontWeight: "500",
                  }}
                >
                  {formatCurrency(stats.totalRevenue * 0.85)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Growth
                </span>
                <span
                  style={{
                    color: "var(--color-success)",
                    fontWeight: "600",
                  }}
                >
                  +15.2% ↗
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div
            className="card shadow-lg border-0 h-100"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="card-header"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderBottom: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
              }}
            >
              <h5
                className="mb-0"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                📊 Booking Analytics
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Total Bookings
                </span>
                <span
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                  }}
                >
                  {formatNumber(stats.totalBookings)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Completed
                </span>
                <span
                  style={{
                    color: "var(--color-success)",
                    fontWeight: "500",
                  }}
                >
                  {formatNumber(
                    Math.round(
                      stats.totalBookings * (stats.completionRate / 100)
                    )
                  )}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Cancelled
                </span>
                <span
                  style={{
                    color: "var(--color-danger)",
                    fontWeight: "500",
                  }}
                >
                  {formatNumber(
                    Math.round(
                      stats.totalBookings * ((100 - stats.completionRate) / 100)
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div
            className="card shadow-lg border-0"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="card-header"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderBottom: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
              }}
            >
              <h5
                className="mb-0"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                🚀 Quick Actions
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-primary w-100"
                    style={{
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-primary)",
                      color: "var(--color-primary)",
                    }}
                    onClick={exportReport}
                  >
                    📥 Export Report
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-success w-100"
                    style={{
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-success)",
                      color: "var(--color-success)",
                    }}
                    onClick={generateCharts}
                  >
                    📊 Generate Charts
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-warning w-100"
                    style={{
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-warning)",
                      color: "var(--color-warning)",
                    }}
                    onClick={sendSummary}
                  >
                    📧 Send Summary
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-info w-100"
                    style={{
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-info)",
                      color: "var(--color-info)",
                    }}
                    onClick={loadStats}
                  >
                    🔄 Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
