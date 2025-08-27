import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
  }, [navigate]);

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
          <h2 className="fw-bold text-danger">
            👑 Admin Dashboard
          </h2>
          <p className="text-muted mb-0">
            Welcome, {user?.name || "Admin"}! Manage the Gabay Laguna platform
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h3 className="text-primary">150</h3>
              <p className="text-muted mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h3 className="text-success">45</h3>
              <p className="text-muted mb-0">Tour Guides</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h3 className="text-info">89</h3>
              <p className="text-muted mb-0">Active Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h3 className="text-warning">12</h3>
              <p className="text-muted mb-0">Pending Approvals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title text-success">👥 User Management</h5>
              <p className="card-text">
                Manage user accounts, verify tour guides, and handle user status.
              </p>
              <button className="btn btn-success">Manage Users</button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title text-primary">📊 Reports & Analytics</h5>
              <p className="card-text">
                View platform statistics, booking reports, and revenue analytics.
              </p>
              <button className="btn btn-primary">View Reports</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title text-danger">📍 Location Applications</h5>
              <p className="card-text">Review and approve guide requests to operate in specific destinations.</p>
              <a className="btn btn-danger" href="/admin/location-applications">Manage Applications</a>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title text-warning">🗺️ Spot Suggestions</h5>
              <p className="card-text">Review guide-submitted tourist spot suggestions before publishing.</p>
              <a className="btn btn-warning" href="/admin/spot-suggestions">Review Suggestions</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
 