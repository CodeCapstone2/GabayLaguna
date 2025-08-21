import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InteractiveMap from "../components/InteractiveMap";
import "bootstrap/dist/css/bootstrap.min.css";

const TouristDashboard = () => {
  const navigate = useNavigate();
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  })();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  console.log("TouristDashboard - User data:", user);

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
            🎒 Welcome, {user?.name || user?.fullName || "Tourist"}!
          </h2>
          <p className="text-muted mb-0">
            Start your journey across the beautiful province of Laguna with
            Gabay Laguna.
          </p>
        </div>
        <div>
          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/tourist-profile")}
          >
            👤 View Profile
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-success">🗺️ Explore Tours</h5>
              <p className="card-text">
                Discover Points of Interest (POIs), connect with local guides,
                and book your next adventure.
              </p>
              <button
                className="btn btn-success"
                onClick={() => navigate("/cities")}
              >
                Start Exploring
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h5 className="card-title text-primary">📋 My Bookings</h5>
              <p className="card-text">
                View and manage your tour bookings, check status, and access
                booking history.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/my-bookings")}
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-light p-4 rounded shadow-sm">
        <h4 className="mb-3 text-success">🌍 Interactive Map</h4>
        <p>
          Use the interactive map below to explore Laguna's attractions and plan
          your journey.
        </p>
        <InteractiveMap />
      </div>
    </div>
  );
};

export default TouristDashboard;
