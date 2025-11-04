import React, { useState, useEffect, useCallback } from "react";
import API_CONFIG from "../config/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const POIGuides = () => {
  const { poiId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [guides, setGuides] = useState([]);
  const [poi, setPoi] = useState(location.state?.poi || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGuides = useCallback(async () => {
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
      setGuides([]);
    } finally {
      setLoading(false);
    }
  }, [poiId]);

  const fetchPoiData = useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/pois/${poiId}`);
      const data = await response.json();
      setPoi(data.poi || data);
    } catch (error) {
      console.error("Error fetching POI data:", error);
    }
  }, [poiId]);

  useEffect(() => {
    fetchGuides();
    if (!location.state?.poi) {
      fetchPoiData();
    }
  }, [poiId, fetchGuides, fetchPoiData, location.state?.poi]);


  const handleViewGuide = (guide) => {
    // Navigate to public guide profile first
    navigate(`/guide/${guide.id}/profile`, {
      state: {
        poi: poi,
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

      <div className="mb-4">
        <h2 className="mb-2">
          Available Tour Guides for {poi.name || `POI ${poiId}`}
        </h2>
        <p className="text-muted">
          Browse available tour guides. Each guide displays their <strong>Name</strong>, <strong>Rating</strong>, and <strong>Price</strong>.
          Click "View Profile & Book" to see full details including Bio, Services, and Availability.
        </p>
      </div>

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
                    guide.user?.profile_picture || "/assets/logo.png"
                  }
                  className="card-img-top"
                  alt={guide.user?.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/assets/logo.png";
                  }}
                />
                <div className="card-body d-flex flex-column">
                  {/* Name - Prominently Displayed */}
                  <h5 className="card-title mb-2 fw-bold" style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                    {guide.user?.name || 'Tour Guide'}
                  </h5>
                  
                  {/* Rating - Prominently Displayed */}
                  <div className="mb-2">
                    <span className="badge bg-warning text-dark fs-6 me-2">
                      ⭐ {guide.rating ? (parseFloat(guide.rating).toFixed(1)) : '0.0'} / 5.0
                    </span>
                    {guide.reviews && guide.reviews.length > 0 && (
                      <span className="text-muted small">
                        ({guide.reviews.length} review{guide.reviews.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>

                  {/* Price - Prominently Displayed */}
                  <div className="mb-3">
                    <span className="badge bg-success fs-6 px-3 py-2">
                      <i className="fas fa-peso-sign me-1"></i>
                      ₱{guide.hourly_rate || 0} / hour
                    </span>
                  </div>

                  {guide.user?.email && (
                    <p className="text-muted small mb-2">
                      <i className="fas fa-envelope me-1"></i>
                      {guide.user.email}
                    </p>
                  )}

                  {guide.bio && (
                    <p className="card-text text-muted small mb-3" style={{ fontSize: '0.9rem' }}>
                      {guide.bio.length > 100 ? guide.bio.substring(0, 100) + '...' : guide.bio}
                    </p>
                  )}

                  {guide.experience_years && (
                    <p className="small text-muted mb-2">
                      <i className="fas fa-briefcase me-1"></i>
                      <strong>Experience:</strong> {guide.experience_years} years
                    </p>
                  )}

                  {guide.languages && (
                    <p className="small text-muted mb-3">
                      <i className="fas fa-language me-1"></i>
                      <strong>Languages:</strong> {guide.languages}
                    </p>
                  )}

                  <button
                    className="btn btn-primary w-100 mt-auto"
                    onClick={() => handleViewGuide(guide)}
                    style={{ fontWeight: '600' }}
                  >
                    <i className="fas fa-user me-2"></i>
                    View Profile & Book
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
