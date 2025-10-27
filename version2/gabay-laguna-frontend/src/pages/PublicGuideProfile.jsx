import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import StarRating from "../components/StarRating";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const PublicGuideProfile = () => {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get POI data from navigation state if available
  const { poi: navPoi } = location.state || {};
  
  const [guide, setGuide] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [poi] = useState(navPoi || null);

  const fetchGuideData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching guide data for ID:", guideId);
      
      // Fetch guide details
      const guideResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/guides/${guideId}`);
      console.log("Guide response:", guideResponse.data);
      const guideData = guideResponse.data.tour_guide || guideResponse.data;
      setGuide(guideData);
      
      // Fetch guide reviews
      try {
        const reviewsResponse = await axios.get(`${API_CONFIG.BASE_URL}/api/guides/${guideId}/reviews`);
        console.log("Reviews response:", reviewsResponse.data);
        console.log("Reviews response structure:", {
          reviews: reviewsResponse.data.reviews,
          data: reviewsResponse.data.reviews?.data,
          direct: reviewsResponse.data.reviews
        });
        
        // Handle different response structures
        let reviewsData = [];
        if (reviewsResponse.data.reviews) {
          if (Array.isArray(reviewsResponse.data.reviews)) {
            reviewsData = reviewsResponse.data.reviews;
          } else if (reviewsResponse.data.reviews.data) {
            reviewsData = reviewsResponse.data.reviews.data;
          }
        }
        
        console.log("Final reviews data:", reviewsData);
        setReviews(reviewsData);
      } catch (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        console.log("Setting empty reviews array due to error");
        setReviews([]);
      }
      
    } catch (error) {
      console.error("Error fetching guide data:", error);
      setError(`Failed to load guide information: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    if (guideId) {
      fetchGuideData();
    }
  }, [guideId, fetchGuideData]);

  const handleBookGuide = () => {
    if (poi) {
      navigate(`/booking/${guideId}/${poi.id}`, {
        state: {
          poi: poi,
          guide: guide,
        },
      });
    } else {
      // If no POI context, go to cities to select one
      navigate("/cities");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading guide profile...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="container py-5">
        <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
          ← Back
        </button>
        <div className="alert alert-danger">
          <h5>Error Loading Guide</h5>
          <p>{error || "Guide not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
        ← Back
      </button>

      <div className="row">
        {/* Guide Profile Card */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <img
              src={guide.user?.profile_picture || "/assets/default-guide.jpg"}
              className="card-img-top"
              alt={guide.user?.name}
              style={{ height: "300px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "/assets/default-guide.jpg";
              }}
            />
            <div className="card-body">
              <h4 className="card-title">{guide.user?.name || "Guide Name Not Available"}</h4>
              <p className="text-muted">{guide.user?.email || "Email not available"}</p>
              
              <div className="mb-3">
                <span className="badge bg-success me-2 fs-6">
                  ₱{guide.hourly_rate || 0}/hour
                </span>
                <span className="badge bg-info text-dark fs-6">
                  {guide.experience_years || 0} years experience
                </span>
              </div>

              <div className="mb-3">
                <StarRating 
                  rating={parseFloat(averageRating)} 
                  showLabel={true}
                  size="normal"
                />
                <div className="mt-1">
                  <span className="text-muted small">
                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <h6>About</h6>
                <p className="card-text">{guide.bio || "No bio available"}</p>
              </div>

              <div className="mb-3">
                <h6>Languages</h6>
                <p className="text-muted">{guide.languages || "Languages not specified"}</p>
              </div>

              <div className="mb-3">
                <h6>License</h6>
                <p className="text-muted">{guide.license_number || "License not available"}</p>
              </div>

              <button
                className="btn btn-primary w-100 btn-lg"
                onClick={handleBookGuide}
              >
                <i className="fas fa-calendar-check me-2"></i>
                Book This Guide
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-star me-2"></i>
                Reviews ({reviews.length})
              </h5>
            </div>
            <div className="card-body">
              {reviews.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-star fa-3x text-muted mb-3"></i>
                  <h6>No reviews yet</h6>
                  <p className="text-muted">Be the first to book and review this guide!</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {reviews.map((review) => (
                    <div key={review.id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">
                            {review.tourist?.name || review.tourist?.full_name || "Anonymous Tourist"}
                          </h6>
                          <StarRating 
                            rating={review.rating || 0} 
                            showLabel={true}
                            size="small"
                          />
                        </div>
                        <small className="text-muted">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : "Date not available"}
                        </small>
                      </div>
                      {review.comment && (
                        <p className="mb-0 text-muted">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicGuideProfile;
