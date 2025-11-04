import React, { useState, useEffect } from "react";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";

const GuideAvailabilityWidget = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [guideAvailability, setGuideAvailability] = useState(null);

  useEffect(() => {
    testApiConnection();
    loadAvailableGuides();
  }, []);

  const testApiConnection = async () => {
    try {
      await axios.get(`${API_CONFIG.BASE_URL}/api/health`);
      
      // Also test the debug endpoint
      await axios.get(`${API_CONFIG.BASE_URL}/api/debug/guides`);
    } catch (error) {
      console.error("API Health Check Failed:", error);
    }
  };

  const loadAvailableGuides = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/guides`);

      // Ensure guides is always an array
      let guidesData = [];
      if (
        response.data &&
        response.data.tour_guides &&
        response.data.tour_guides.data &&
        Array.isArray(response.data.tour_guides.data)
      ) {
        // Handle paginated response
        guidesData = response.data.tour_guides.data;
      } else if (
        response.data &&
        response.data.tour_guides &&
        Array.isArray(response.data.tour_guides)
      ) {
        // Handle non-paginated response
        guidesData = response.data.tour_guides;
      } else if (Array.isArray(response.data)) {
        guidesData = response.data;
      } else {
        console.warn("Unexpected API response format:", response.data);
        guidesData = [];
      }

      setGuides(guidesData);
    } catch (error) {
      console.error("Error loading guides:", error);
      setError(`Unable to load guides: ${error.response?.data?.message || error.message}`);
      setGuides([]); // Ensure guides is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const loadGuideAvailability = async (guideId) => {
    try {
      setError(null);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/guides/${guideId}/availability`
      );
      setGuideAvailability(response.data);
    } catch (error) {
      console.error("Error loading guide availability:", error);
      setError("Unable to load guide availability. Please try again.");
    }
  };

  const handleGuideSelect = (guide) => {
    setSelectedGuide(guide);
    loadGuideAvailability(guide.id);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDayOfWeek = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getDayOrder = (day) => {
    const order = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    };
    return order[day] || 8;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading available guides...</p>
      </div>
    );
  }

  return (
    <div className="guide-availability-widget">
      <div className="card">
        <div className="card-header">
          <h4 className="mb-0">
            <i className="fas fa-calendar-check me-2 text-primary"></i>
            Guide Availability
          </h4>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Guide Selection */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label fw-semibold mb-0">
                <i className="fas fa-user me-2"></i>
                Select a Guide
              </label>
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={loadAvailableGuides}
                  disabled={loading}
                >
                  <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} me-1`}></i>
                  Refresh
                </button>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={testApiConnection}
                  disabled={loading}
                >
                  <i className="fas fa-bug me-1"></i>
                  Test API
                </button>
              </div>
            </div>
            {Array.isArray(guides) && guides.length > 0 ? (
              <select
                className="form-select"
                value={selectedGuide?.id || ""}
                onChange={(e) => {
                  const guide = guides.find(
                    (g) => g.id === parseInt(e.target.value)
                  );
                  handleGuideSelect(guide);
                }}
              >
                <option value="">Choose a guide...</option>
                {guides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.user?.name || guide.name} - PHP {guide.hourly_rate}
                    /hour
                    {guide.is_verified && " ✓"}
                  </option>
                ))}
              </select>
            ) : (
              <div className="alert alert-info" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                No guides available at the moment. Please try again later.
                <br />
                <small className="text-muted">
                  Make sure the backend server is running and there are guides in the database.
                </small>
                <br />
                <small className="text-muted">
                  API URL: {API_CONFIG.BASE_URL}/api/guides
                </small>
                <br />
                <small className="text-muted">
                  Guides loaded: {guides.length}
                </small>
              </div>
            )}
          </div>

          {/* Guide Info */}
          {selectedGuide && (
            <div className="guide-info mb-4 p-3 bg-light rounded">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6 className="mb-1">
                    <i className="fas fa-user me-2"></i>
                    {selectedGuide.user?.name || selectedGuide.name}
                  </h6>
                  <p className="mb-1 text-muted">
                    <i className="fas fa-dollar-sign me-2"></i>
                    PHP {selectedGuide.hourly_rate} per hour
                  </p>
                  {selectedGuide.is_verified && (
                    <span className="badge bg-success">
                      <i className="fas fa-check me-1"></i>
                      Verified Guide
                    </span>
                  )}
                </div>
                <div className="col-md-4 text-end">
                  <img
                    src={
                      selectedGuide.user?.profile_picture ||
                      "/assets/logo.png"
                    }
                    alt={selectedGuide.user?.name || selectedGuide.name}
                    className="rounded-circle"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Availability Schedule */}
          {guideAvailability && (
            <div className="availability-schedule">
              <h6 className="mb-3">
                <i className="fas fa-clock me-2"></i>
                Available Times
              </h6>

              {guideAvailability && 
              guideAvailability.availabilities && 
              Array.isArray(guideAvailability.availabilities) && 
              guideAvailability.availabilities.length > 0 ? (
                <div className="row">
                  {guideAvailability.availabilities
                    .sort(
                      (a, b) =>
                        getDayOrder(a.day_of_week) - getDayOrder(b.day_of_week)
                    )
                    .map((availability, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="availability-item p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1 text-primary">
                                <i className="fas fa-calendar-day me-2"></i>
                                {formatDayOfWeek(availability.day_of_week)}
                              </h6>
                              <p className="mb-0 text-muted">
                                <i className="fas fa-clock me-2"></i>
                                {formatTime(availability.start_time)} -{" "}
                                {formatTime(availability.end_time)}
                              </p>
                            </div>
                            <div className="text-success">
                              <i className="fas fa-check-circle fa-lg"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No availability set</h6>
                  <p className="text-muted small">
                    This guide hasn't set their availability schedule yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 p-3 bg-info bg-opacity-10 rounded">
            <small className="text-muted">
              <i className="fas fa-info-circle me-2"></i>
              <strong>How to use:</strong> Select a guide above to view their
              available times. You can book tours during these available hours.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideAvailabilityWidget;
