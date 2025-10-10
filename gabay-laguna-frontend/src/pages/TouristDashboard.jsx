import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InteractiveMap from "../components/InteractiveMap";
import GuideAvailabilityWidget from "../components/GuideAvailabilityWidget";
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1
            className="fw-bold mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            Welcome back, {user?.name || user?.fullName || "Tourist"}!
          </h1>
          <p className="lead mb-0">
            Discover the beautiful province of Laguna with our expert local
            guides.
          </p>
        </div>
        <div>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/tourist-profile")}
          >
            <i className="fas fa-user me-2"></i>
            View Profile
          </button>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-map-marked-alt fa-3x text-primary"></i>
              </div>
              <h4 className="card-title mb-3">Explore Tours</h4>
              <p className="card-text mb-4">
                Discover Points of Interest (POIs), connect with local guides,
                and book your next adventure.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/cities")}
              >
                <i className="fas fa-compass me-2"></i>
                Start Exploring
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-calendar-check fa-3x text-success"></i>
              </div>
              <h4 className="card-title mb-3">My Bookings</h4>
              <p className="card-text mb-4">
                View and manage your tour bookings, check status, and access
                booking history.
              </p>
              <button
                className="btn btn-success btn-lg"
                onClick={() => navigate("/my-bookings")}
              >
                <i className="fas fa-list me-2"></i>
                View Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Availability Section */}
      <div className="row mb-4">
        <div className="col-12">
          <GuideAvailabilityWidget />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 className="mb-0">
            <i className="fas fa-globe-americas me-2 text-primary"></i>
            Interactive Map
          </h4>
        </div>
        <div className="card-body">
          <p className="lead mb-4">
            Use the interactive map below to explore Laguna's attractions and
            plan your journey.
          </p>
          <InteractiveMap />
        </div>
      </div>
    </div>
  );
};

export default TouristDashboard;
