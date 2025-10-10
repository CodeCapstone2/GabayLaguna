import React, { useState, useEffect } from "react";
import API_CONFIG from "../config/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const POIGuides = () => {
  const { poiId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [guides, setGuides] = useState([]);
  const [poi, setPoi] = useState(location.state?.poi || {});
  const [city, setCity] = useState(location.state?.city || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGuides();
    if (!location.state?.poi) {
      fetchPoiData();
    }
  }, [poiId]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/pois/${poiId}/guides`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGuides(data.guides || []);
      if (data.poi) setPoi(data.poi);
    } catch (error) {
      console.error("Error fetching guides:", error);
      setError("Failed to load guides. Please try again later.");

      // Fallback: Use demo data
      setGuides(getDemoGuides());
    } finally {
      setLoading(false);
    }
  };

  const fetchPoiData = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/pois/${poiId}`);
      const data = await response.json();
      setPoi(data.poi || data);
    } catch (error) {
      console.error("Error fetching POI data:", error);
    }
  };

  const getDemoGuides = () => {
    // Demo data for fallback
    return [
      {
        id: 1,
        user: { name: "John Doe", email: "john@example.com" },
        hourly_rate: 500,
        experience_years: 3,
        bio: "Experienced tour guide with knowledge of local history",
        languages: "English, Tagalog",
        rating: 4.5,
      },
      {
        id: 2,
        user: { name: "Maria Santos", email: "maria@example.com" },
        hourly_rate: 600,
        experience_years: 5,
        bio: "Professional guide specializing in cultural tours",
        languages: "English, Spanish, Tagalog",
        rating: 4.8,
      },
    ];
  };

  const handleBookGuide = (guide) => {
    // Use the new route format: /booking/:guideId/:poiId
    navigate(`/booking/${guide.id}/${poiId}`, {
      state: {
        poi: poi,
        city: city,
        guide: guide,
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
        ← Back to POIs
      </button>

      <h2 className="mb-4">
        Available Guides for {poi.name || `POI ${poiId}`}
      </h2>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
          <br />
          <small>Showing demo data for preview purposes.</small>
        </div>
      )}

      {guides.length === 0 ? (
        <div className="text-center py-5">
          <div className="alert alert-info">
            <h5>No guides available</h5>
            <p>There are no guides available for this point of interest yet.</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {guides.map((guide) => (
            <div key={guide.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={
                    guide.user?.profile_picture || "/assets/default-guide.jpg"
                  }
                  className="card-img-top"
                  alt={guide.user?.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/assets/default-guide.jpg";
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{guide.user?.name}</h5>
                  <p className="text-muted">{guide.user?.email}</p>

                  <div className="mb-3">
                    <span className="badge bg-success me-2">
                      ₱{guide.hourly_rate}/hour
                    </span>
                    <span className="badge bg-info text-dark">
                      {guide.experience_years || 0} years experience
                    </span>
                  </div>

                  {guide.bio && <p className="card-text">{guide.bio}</p>}

                  {guide.languages && (
                    <p className="small text-muted">
                      <strong>Languages:</strong> {guide.languages}
                    </p>
                  )}

                  {guide.rating && (
                    <p className="small text-muted">
                      <strong>Rating:</strong> ⭐ {guide.rating}/5
                    </p>
                  )}

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleBookGuide(guide)}
                  >
                    <i className="fas fa-calendar-check me-2"></i>
                    Book This Guide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POIGuides;
