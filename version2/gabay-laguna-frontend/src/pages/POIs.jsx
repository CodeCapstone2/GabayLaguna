import React, { useState, useEffect } from "react";
import API_CONFIG from "../config/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getImageUrl, handleImageError } from "../utils/imageUtils";

const POIs = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pois, setPois] = useState([]);
  const [filteredPois, setFilteredPois] = useState([]);
  const [city, setCity] = useState(location.state?.city || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guideCounts, setGuideCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [expandedPoiId, setExpandedPoiId] = useState(null);
  const [expandedPoiGuides, setExpandedPoiGuides] = useState({});
  const [loadingGuides, setLoadingGuides] = useState({});

  useEffect(() => {
    fetchCityPOIs();
    if (!location.state?.city) {
      fetchCityData();
    }
  }, [cityId]);

  useEffect(() => {
    if (pois.length > 0) {
      fetchGuideCounts();
      extractCategories();
    }
  }, [pois]);

  useEffect(() => {
    filterPoisByCategory();
  }, [selectedCategory, pois]);

  const extractCategories = () => {
    const categories = [...new Set(pois.map(poi => poi.category?.name || poi.category).filter(Boolean))];
    setAvailableCategories(categories);
  };

  const filterPoisByCategory = () => {
    if (!selectedCategory) {
      setFilteredPois(pois);
    } else {
      const filtered = pois.filter(poi => (poi.category?.name || poi.category) === selectedCategory);
      setFilteredPois(filtered);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const fetchCityPOIs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}/pois`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response formats
      let poisData = [];

      if (Array.isArray(data)) {
        poisData = data;
      } else if (data.points_of_interest) {
        poisData = Array.isArray(data.points_of_interest)
          ? data.points_of_interest
          : [];
      } else if (data.pois) {
        poisData = Array.isArray(data.pois) ? data.pois : [];
      } else if (data.data) {
        poisData = Array.isArray(data.data) ? data.data : [];
      } else {
        poisData = Object.values(data).find(Array.isArray) || [];
      }

      setPois(poisData);
    } catch (error) {
      console.error("Error fetching city POIs:", error);
      setPois([]);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError("Unable to connect to the server. Please check your internet connection and try again.");
      } else if (error.message.includes('404')) {
        setError("No points of interest found for this city.");
      } else if (error.message.includes('500')) {
        setError("Server error. Please try again later.");
      } else {
        setError("Unable to load points of interest. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideCounts = async () => {
    const counts = {};

    try {
      // First try to get guides by city
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}/guides`
      );

      if (response.ok) {
        const data = await response.json();
        const cityGuideCount = data.guides
          ? data.guides.length
          : data.count || 0;

        // Distribute guides evenly among POIs for demo
        pois.forEach((poi, index) => {
          // Simple distribution logic - you can improve this later
          const baseCount = Math.floor(cityGuideCount / pois.length);
          const remainder = cityGuideCount % pois.length;
          counts[poi.id] = baseCount + (index < remainder ? 1 : 0);
        });
      } else {
        // If city guides endpoint fails, use fallback
        throw new Error("City guides endpoint failed");
      }
    } catch (error) {
      console.error("Error fetching city guides:", error);
      // No fake data - just set empty counts
    }

    setGuideCounts(counts);
  };

  const fetchCityData = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}`
      );
      const data = await response.json();

      if (data.city) {
        setCity(data.city);
      } else if (data.data) {
        setCity(data.data);
      } else {
        setCity(data);
      }
    } catch (error) {
      console.error("Error fetching city data:", error);
    }
  };

  const fetchGuidesForPoi = async (poiId) => {
    setLoadingGuides(prev => ({ ...prev, [poiId]: true }));
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/pois/${poiId}/guides`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const guidesList = data.guides || [];
      setExpandedPoiGuides(prev => ({ ...prev, [poiId]: guidesList }));
    } catch (error) {
      console.error("Error fetching guides:", error);
      setExpandedPoiGuides(prev => ({ ...prev, [poiId]: [] }));
    } finally {
      setLoadingGuides(prev => ({ ...prev, [poiId]: false }));
    }
  };

  const handleViewMore = (poi) => {
    if (expandedPoiId === poi.id) {
      // Collapse if already expanded
      setExpandedPoiId(null);
    } else {
      // Expand and fetch guides if not already loaded
      setExpandedPoiId(poi.id);
      if (!expandedPoiGuides[poi.id]) {
        fetchGuidesForPoi(poi.id);
      }
    }
  };

  const handleBookNow = (poi, guide) => {
    navigate(`/booking/${guide.id}/${poi.id}`, {
      state: {
        poi: poi,
        guide: guide,
      },
    });
  };

  const handleViewProfile = (poi, guide) => {
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
          <p className="mt-2">Loading points of interest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
          ← Back to Cities
        </button>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
        ← Back to Cities
      </button>

      <div className="mb-4">
        <h2 className="mb-2">
          Points of Interest in {city.name || `City ${cityId}`}
        </h2>
        <p className="text-muted">
          Click on any location to view details. Click "View More" to see available tour guides with their Name, Rating, and Price.
        </p>
      </div>

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="fw-bold text-muted me-3">Filter by Category:</span>
            <button
              className={`btn btn-sm ${selectedCategory === "" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => handleCategoryChange("")}
              style={{ borderRadius: "20px" }}
            >
              All Categories
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                className={`btn btn-sm ${selectedCategory === category ? "btn-success" : "btn-outline-success"}`}
                onClick={() => handleCategoryChange(category)}
                style={{ borderRadius: "20px" }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredPois.length === 0 ? (
        <div className="text-center py-5">
          <div className="alert alert-info">
            <h5>No points of interest found</h5>
            <p>
              {selectedCategory 
                ? `No ${selectedCategory} attractions found in this city.` 
                : "There are no points of interest available for this city yet."
              }
            </p>
            {selectedCategory && (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleCategoryChange("")}
              >
                Show All Categories
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredPois.map((poi) => (
            <div key={poi.id} className={expandedPoiId === poi.id ? "col-md-12 mb-4" : "col-md-6 col-lg-4 mb-4"}>
              <div className={`card ${expandedPoiId === poi.id ? 'border-primary' : 'shadow-sm'} h-100`}>
                <img
                  src={getImageUrl(poi.name, 'poi', poi.image || poi.images?.[0])}
                  className="card-img-top"
                  alt={poi.name}
                  style={{ height: expandedPoiId === poi.id ? "300px" : "200px", objectFit: "cover" }}
                  onError={(e) => handleImageError(e, 'poi')}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{poi.name}</h5>
                  
                  {/* Category Badge */}
                  {poi.category && (
                    <div className="mb-2">
                      <span className={`badge ${
                        (poi.category.name || poi.category) === 'Historical' ? 'bg-warning text-dark' :
                        (poi.category.name || poi.category) === 'Natural' ? 'bg-success' :
                        (poi.category.name || poi.category) === 'Waterfalls/Adventure' ? 'bg-primary' :
                        (poi.category.name || poi.category) === 'Theme Parks' ? 'bg-info text-dark' :
                        (poi.category.name || poi.category) === 'Educational' ? 'bg-secondary' :
                        (poi.category.name || poi.category) === 'Wellness' ? 'bg-light text-dark' :
                        (poi.category.name || poi.category) === 'Cultural' ? 'bg-dark' :
                        'bg-secondary'
                      }`}>
                        <i className={`fas ${
                          (poi.category.name || poi.category) === 'Historical' ? 'fa-landmark' :
                          (poi.category.name || poi.category) === 'Natural' ? 'fa-leaf' :
                          (poi.category.name || poi.category) === 'Waterfalls/Adventure' ? 'fa-water' :
                          (poi.category.name || poi.category) === 'Theme Parks' ? 'fa-theater-masks' :
                          (poi.category.name || poi.category) === 'Educational' ? 'fa-graduation-cap' :
                          (poi.category.name || poi.category) === 'Wellness' ? 'fa-spa' :
                          (poi.category.name || poi.category) === 'Cultural' ? 'fa-palette' :
                          'fa-tag'
                        } me-1`}></i>
                        {poi.category.name || poi.category}
                      </span>
                    </div>
                  )}
                  
                  <p className="card-text flex-grow-1">
                    {poi.description || "No description available."}
                  </p>

                  {/* Guide Count */}
                  <div className="mb-3">
                    <span className="badge bg-info text-dark">
                      <i className="fas fa-user-check me-1"></i>
                      {guideCounts[poi.id] || 0} Guides Available
                    </span>
                  </div>

                  {poi.address && (
                    <p className="text-muted small">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {poi.address}
                    </p>
                  )}

                  <div className="d-grid gap-2">
                    <button
                      className={`btn ${expandedPoiId === poi.id ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleViewMore(poi)}
                      disabled={!guideCounts[poi.id] || guideCounts[poi.id] === 0}
                      title={guideCounts[poi.id] && guideCounts[poi.id] > 0 
                        ? expandedPoiId === poi.id
                          ? 'Hide available guides'
                          : `View ${guideCounts[poi.id]} available tour guide${guideCounts[poi.id] > 1 ? 's' : ''}`
                        : 'No guides available'}
                    >
                      <i className={`fas ${expandedPoiId === poi.id ? 'fa-eye-slash' : 'fa-users'} me-2`}></i>
                      {expandedPoiId === poi.id ? 'Hide' : 'View More'}
                    </button>
                  </div>

                  {/* Expanded Guides Section */}
                  {expandedPoiId === poi.id && (
                    <div className="mt-4 pt-4 border-top">
                      <h6 className="mb-3 fw-bold">
                        <i className="fas fa-users me-2 text-primary"></i>
                        Available Guides
                      </h6>
                      {loadingGuides[poi.id] ? (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : expandedPoiGuides[poi.id] && expandedPoiGuides[poi.id].length > 0 ? (
                        <div className="row">
                          {expandedPoiGuides[poi.id].map((guide) => (
                            <div key={guide.id} className="col-md-6 mb-3">
                              <div className="card shadow-sm h-100">
                                <div className="card-body">
                                  <div className="d-flex align-items-start mb-3">
                                    <img
                                      src={guide.user?.profile_picture || "/assets/logo.png"}
                                      className="rounded-circle me-3"
                                      alt={guide.user?.name}
                                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                      onError={(e) => {
                                        e.target.src = "/assets/logo.png";
                                      }}
                                    />
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1 fw-bold">{guide.user?.name || 'Tour Guide'}</h6>
                                      <div className="mb-2">
                                        <span className="badge bg-warning text-dark me-2">
                                          ⭐ {guide.rating ? parseFloat(guide.rating).toFixed(1) : '0.0'} / 5.0
                                        </span>
                                        <span className="badge bg-success">
                                          ₱{guide.hourly_rate || 0}/hr
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {guide.bio && (
                                    <p className="card-text text-muted small mb-3">
                                      {guide.bio.length > 80 ? guide.bio.substring(0, 80) + '...' : guide.bio}
                                    </p>
                                  )}

                                  <div className="d-grid gap-2">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleBookNow(poi, guide)}
                                    >
                                      <i className="fas fa-calendar-check me-2"></i>
                                      Book Now
                                    </button>
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => handleViewProfile(poi, guide)}
                                    >
                                      <i className="fas fa-user me-2"></i>
                                      View Profile
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          No guides available for this location.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POIs;
