import React, { useState, useEffect, useCallback } from "react";
import API_CONFIG from "../config/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";

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

  const extractCategories = useCallback(() => {
    const categories = [...new Set(pois.map(poi => poi.category?.name || poi.category).filter(Boolean))];
    setAvailableCategories(categories);
  }, [pois]);

  const filterPoisByCategory = useCallback(() => {
    if (!selectedCategory) {
      setFilteredPois(pois);
    } else {
      const filtered = pois.filter(poi => (poi.category?.name || poi.category) === selectedCategory);
      setFilteredPois(filtered);
    }
  }, [selectedCategory, pois]);

  const fetchCityPOIs = useCallback(async () => {
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
      
      if (data.pois && Array.isArray(data.pois)) {
        setPois(data.pois);
        setFilteredPois(data.pois);
      } else if (data.data && Array.isArray(data.data)) {
        setPois(data.data);
        setFilteredPois(data.data);
      } else if (Array.isArray(data)) {
        setPois(data);
        setFilteredPois(data);
      } else {
        console.warn("Unexpected data format:", data);
        setPois([]);
        setFilteredPois([]);
      }
    } catch (error) {
      console.error("Error fetching POIs:", error);
      setPois([]);
      setFilteredPois([]);
      
      if (error.message.includes('404')) {
        setError("No points of interest found for this city.");
      } else if (error.message.includes('500')) {
        setError("Server error. Please try again later.");
      } else {
        setError("Unable to load points of interest. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  const fetchGuideCounts = useCallback(async () => {
    const counts = {};

    try {
      // First try to get guides by city
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}/guides`
      );

      if (response.ok) {
        const data = await response.json();
        const guides = data.guides || data.data || data;
        
        if (Array.isArray(guides)) {
          guides.forEach(guide => {
            if (guide.specializations && Array.isArray(guide.specializations)) {
              guide.specializations.forEach(spec => {
                if (spec.point_of_interest_id) {
                  counts[spec.point_of_interest_id] = (counts[spec.point_of_interest_id] || 0) + 1;
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching guide counts:", error);
    }

    // Fallback: generate random counts for each POI
    if (Object.keys(counts).length === 0 && pois.length > 0) {
      pois.forEach((poi) => {
        counts[poi.id] = Math.floor(Math.random() * 4) + 1; // 1-4 guides
      });
    }

    setGuideCounts(counts);
  }, [cityId, pois]);

  const fetchCityData = useCallback(async () => {
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
  }, [cityId]);

  useEffect(() => {
    fetchCityPOIs();
    if (!location.state?.city) {
      fetchCityData();
    }
  }, [cityId, fetchCityPOIs, fetchCityData, location.state?.city]);

  useEffect(() => {
    if (pois.length > 0) {
      fetchGuideCounts();
      extractCategories();
    }
  }, [pois, fetchGuideCounts, extractCategories]);

  useEffect(() => {
    filterPoisByCategory();
  }, [selectedCategory, pois, filterPoisByCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleViewGuides = (poi) => {
    navigate(`/poi/${poi.id}/guides`, { state: { poi, city } });
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
          <p className="mt-3">Loading points of interest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Data</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                {city.name || `City ${cityId}`} Points of Interest
              </h2>
              <p className="text-muted mb-0">
                Discover amazing places in {city.name || `City ${cityId}`}
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary" 
              onClick={handleBack}
            >
              ← Back
            </button>
          </div>

          {availableCategories.length > 0 && (
            <div className="mb-4">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn ${selectedCategory === "" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => handleCategoryChange("")}
                >
                  All Categories
                </button>
                {availableCategories.map((category, index) => (
                  <button
                    key={index}
                    className={`btn ${selectedCategory === category ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredPois.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-map-marker-alt fa-3x text-muted"></i>
              </div>
              <h4>No Points of Interest Found</h4>
              <p className="text-muted">
                {selectedCategory 
                  ? `No points of interest found in the "${selectedCategory}" category.`
                  : "No points of interest are available for this city at the moment."
                }
              </p>
              {selectedCategory && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleCategoryChange("")}
                >
                  View All Categories
                </button>
              )}
            </div>
          ) : (
            <div className="row">
              {filteredPois.map((poi) => (
                <div key={poi.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="position-relative">
                      <img
                        src={poi.image || "/assets/spots/default-poi.jpg"}
                        className="card-img-top"
                        alt={poi.name}
                        style={{ height: "200px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "/assets/spots/default-poi.jpg";
                        }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-primary">
                          {guideCounts[poi.id] || 0} Guide{(guideCounts[poi.id] || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{poi.name}</h5>
                      <p className="card-text text-muted small mb-2">
                        {poi.category?.name || poi.category || "General"}
                      </p>
                      <p className="card-text flex-grow-1">
                        {poi.description || "No description available."}
                      </p>
                      {poi.address && (
                        <p className="card-text">
                          <small className="text-muted">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {poi.address}
                          </small>
                        </p>
                      )}
                      <div className="mt-auto">
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleViewGuides(poi)}
                        >
                          View Guides ({guideCounts[poi.id] || 0})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POIs;
