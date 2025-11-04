import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const Itineraries = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    duration_type: "",
    difficulty: "",
    min_price: "",
    max_price: "",
    search: ""
  });

  useEffect(() => {
    loadItineraries();
  }, [filters]);

  const loadItineraries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/itineraries?${params}`);
      setItineraries(response.data.itineraries.data);
    } catch (error) {
      console.error("Error loading itineraries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      duration_type: "",
      difficulty: "",
      min_price: "",
      max_price: "",
      search: ""
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'moderate': return 'warning';
      case 'challenging': return 'danger';
      default: return 'secondary';
    }
  };

  const getDurationTypeText = (type) => {
    switch (type) {
      case 'half_day': return 'Half Day';
      case 'full_day': return 'Full Day';
      case 'multi_day': return 'Multi Day';
      default: return type;
    }
  };

  const handleItineraryClick = (itinerary) => {
    navigate(`/itineraries/${itinerary.id}`, { state: { itinerary } });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading itineraries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-4 text-center mb-3">Laguna Itineraries</h1>
          <p className="lead text-center text-muted">
            Discover curated tour experiences in Laguna with professional guides
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Filter Itineraries</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search itineraries..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Duration</label>
                  <select
                    className="form-select"
                    value={filters.duration_type}
                    onChange={(e) => handleFilterChange('duration_type', e.target.value)}
                  >
                    <option value="">All Durations</option>
                    <option value="half_day">Half Day</option>
                    <option value="full_day">Full Day</option>
                    <option value="multi_day">Multi Day</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Min Price</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min price"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Max Price</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max price"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  />
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itineraries Grid */}
      <div className="row">
        {itineraries.length === 0 ? (
          <div className="col-12 text-center">
            <div className="card">
              <div className="card-body py-5">
                <h5 className="text-muted">No itineraries found</h5>
                <p className="text-muted">Try adjusting your filters or check back later.</p>
              </div>
            </div>
          </div>
        ) : (
          itineraries.map((itinerary) => (
            <div key={itinerary.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 itinerary-card" onClick={() => handleItineraryClick(itinerary)}>
                <div className="position-relative">
                  <img
                    src={itinerary.image || '/assets/default-itinerary.jpg'}
                    className="card-img-top"
                    alt={itinerary.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/assets/default-itinerary.jpg';
                    }}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className={`badge bg-${getDifficultyColor(itinerary.difficulty_level)}`}>
                      {itinerary.difficulty_level}
                    </span>
                  </div>
                </div>
                
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{itinerary.title}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {itinerary.description.length > 120 
                      ? `${itinerary.description.substring(0, 120)}...` 
                      : itinerary.description
                    }
                  </p>
                  
                  <div className="mb-3">
                    <div className="row text-center">
                      <div className="col-4">
                        <small className="text-muted">Duration</small>
                        <div className="fw-bold">{getDurationTypeText(itinerary.duration_type)}</div>
                      </div>
                      <div className="col-4">
                        <small className="text-muted">Participants</small>
                        <div className="fw-bold">{itinerary.min_participants}-{itinerary.max_participants}</div>
                      </div>
                      <div className="col-4">
                        <small className="text-muted">Price</small>
                        <div className="fw-bold text-primary">{formatPrice(itinerary.base_price)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="small text-muted mb-2">Highlights:</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {itinerary.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="badge bg-light text-dark small">
                          {highlight}
                        </span>
                      ))}
                      {itinerary.highlights.length > 3 && (
                        <span className="badge bg-light text-dark small">
                          +{itinerary.highlights.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        {itinerary.guides.length} guide{itinerary.guides.length !== 1 ? 's' : ''} available
                      </small>
                      <small className="text-muted">
                        {itinerary.items.length} activities
                      </small>
                    </div>
                    <button className="btn btn-primary w-100">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body text-center">
              <div className="row">
                <div className="col-md-3">
                  <h4 className="text-primary">{itineraries.length}</h4>
                  <p className="text-muted mb-0">Available Itineraries</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-success">3</h4>
                  <p className="text-muted mb-0">Cities Covered</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-warning">15+</h4>
                  <p className="text-muted mb-0">Activities</p>
                </div>
                <div className="col-md-3">
                  <h4 className="text-info">4</h4>
                  <p className="text-muted mb-0">Professional Guides</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itineraries;



