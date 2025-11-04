import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingData, setBookingData] = useState({
    tour_date: "",
    start_time: "",
    number_of_people: 1,
    special_requests: ""
  });

  useEffect(() => {
    if (location.state?.itinerary) {
      setItinerary(location.state.itinerary);
      setLoading(false);
    } else {
      loadItinerary();
    }
  }, [id]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/itineraries/${id}`);
      setItinerary(response.data.itinerary);
    } catch (error) {
      console.error("Error loading itinerary:", error);
    } finally {
      setLoading(false);
    }
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

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'visit': return '🏛️';
      case 'meal': return '🍽️';
      case 'transport': return '🚗';
      case 'activity': return '🎯';
      case 'break': return '☕';
      default: return '📍';
    }
  };

  const calculateTotalPrice = () => {
    if (!itinerary || !bookingData.number_of_people) return 0;
    return itinerary.base_price * bookingData.number_of_people;
  };

  const handleBooking = () => {
    if (!selectedGuide) {
      alert('Please select a guide');
      return;
    }

    if (!bookingData.tour_date || !bookingData.start_time) {
      alert('Please select date and time');
      return;
    }

    // Navigate to booking page with itinerary data
    navigate('/booking', {
      state: {
        itinerary,
        guide: selectedGuide,
        bookingData: {
          ...bookingData,
          itinerary_id: itinerary.id,
          tour_guide_id: selectedGuide.id,
          total_amount: calculateTotalPrice()
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading itinerary details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <h3>Itinerary not found</h3>
            <button className="btn btn-primary" onClick={() => navigate('/itineraries')}>
              Back to Itineraries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="row mb-3">
        <div className="col-12">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/itineraries')}
          >
            ← Back to Itineraries
          </button>
        </div>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Hero Section */}
          <div className="card mb-4">
            <div className="position-relative">
              <img
                src={itinerary.image || '/assets/default-itinerary.jpg'}
                className="card-img-top"
                alt={itinerary.title}
                style={{ height: '400px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/assets/default-itinerary.jpg';
                }}
              />
              <div className="position-absolute top-0 end-0 m-3">
                <span className={`badge bg-${getDifficultyColor(itinerary.difficulty_level)} fs-6`}>
                  {itinerary.difficulty_level}
                </span>
              </div>
            </div>
            <div className="card-body">
              <h1 className="card-title">{itinerary.title}</h1>
              <p className="card-text lead">{itinerary.description}</p>
              
              <div className="row text-center mb-4">
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h5 className="text-primary">{getDurationTypeText(itinerary.duration_type)}</h5>
                    <small className="text-muted">Duration</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h5 className="text-success">{itinerary.duration_hours}h</h5>
                    <small className="text-muted">Total Time</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h5 className="text-warning">{itinerary.min_participants}-{itinerary.max_participants}</h5>
                    <small className="text-muted">Participants</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h5 className="text-info">{itinerary.items.length}</h5>
                    <small className="text-muted">Activities</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">✨ Highlights</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {itinerary.highlights.map((highlight, index) => (
                  <div key={index} className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <span className="text-primary me-2">•</span>
                      <span>{highlight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Itinerary Timeline */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">📅 Itinerary Timeline</h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                {itinerary.items.map((item, index) => (
                  <div key={item.id} className="timeline-item d-flex mb-4">
                    <div className="timeline-marker me-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="fs-4">{getActivityTypeIcon(item.activity_type)}</span>
                      </div>
                    </div>
                    <div className="timeline-content flex-grow-1">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{item.title}</h6>
                            <small className="text-muted">
                              {item.start_time} - {item.end_time}
                            </small>
                          </div>
                          <p className="card-text text-muted">{item.description}</p>
                          {item.notes && (
                            <div className="alert alert-info py-2 mb-0">
                              <small><strong>Note:</strong> {item.notes}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What's Included/Excluded */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">✅ What's Included</h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    {itinerary.included_items.map((item, index) => (
                      <li key={index} className="mb-1">
                        <span className="text-success me-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-warning text-white">
                  <h6 className="mb-0">❌ What's Not Included</h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    {itinerary.excluded_items.map((item, index) => (
                      <li key={index} className="mb-1">
                        <span className="text-warning me-2">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {itinerary.requirements && itinerary.requirements.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">🎒 What to Bring</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {itinerary.requirements.map((requirement, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="d-flex align-items-center">
                        <span className="text-primary me-2">•</span>
                        <span>{requirement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Meeting Point */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">📍 Meeting Point</h5>
            </div>
            <div className="card-body">
              <h6>{itinerary.meeting_point}</h6>
              <p className="text-muted">{itinerary.meeting_instructions}</p>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-header">
              <h5 className="mb-0">Book This Itinerary</h5>
            </div>
            <div className="card-body">
              {/* Price Display */}
              <div className="text-center mb-4">
                <h3 className="text-primary">{formatPrice(itinerary.base_price)}</h3>
                <small className="text-muted">per person</small>
              </div>

              {/* Guide Selection */}
              <div className="mb-3">
                <label className="form-label">Select Guide</label>
                <select 
                  className="form-select"
                  value={selectedGuide?.id || ''}
                  onChange={(e) => {
                    const guide = itinerary.guides.find(g => g.id === parseInt(e.target.value));
                    setSelectedGuide(guide);
                  }}
                >
                  <option value="">Choose a guide...</option>
                  {itinerary.guides.map(guide => (
                    <option key={guide.id} value={guide.id}>
                      {guide.user?.name || `Guide ${guide.id}`} 
                      {guide.is_verified && ' ✓'} 
                      - {formatPrice(guide.hourly_rate)}/hour
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Form */}
              <div className="mb-3">
                <label className="form-label">Tour Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={bookingData.tour_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, tour_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={bookingData.start_time}
                  onChange={(e) => setBookingData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Number of People</label>
                <input
                  type="number"
                  className="form-control"
                  min={itinerary.min_participants}
                  max={itinerary.max_participants}
                  value={bookingData.number_of_people}
                  onChange={(e) => setBookingData(prev => ({ ...prev, number_of_people: parseInt(e.target.value) }))}
                />
                <small className="text-muted">
                  Min: {itinerary.min_participants}, Max: {itinerary.max_participants}
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Any special requirements or requests..."
                  value={bookingData.special_requests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, special_requests: e.target.value }))}
                />
              </div>

              {/* Price Summary */}
              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between">
                  <span>Base Price ({bookingData.number_of_people} people)</span>
                  <span>{formatPrice(calculateTotalPrice())}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatPrice(calculateTotalPrice())}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary w-100 btn-lg"
                onClick={handleBooking}
                disabled={!selectedGuide || !bookingData.tour_date || !bookingData.start_time}
              >
                Book Now
              </button>

              <div className="text-center mt-3">
                <small className="text-muted">
                  ✓ Instant confirmation<br />
                  ✓ Free cancellation up to 24h before<br />
                  ✓ Professional guide included
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetail;



