import React, { useState, useEffect } from 'react';
import API_CONFIG from '../config/api';

const GuideAvailabilitySchedule = ({ 
  guideId, 
  selectedDate, 
  onTimeSlotSelect, 
  selectedTimeSlot = null,
  duration = 2 
}) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate time slots (8 AM to 6 PM, 1-hour intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + duration).toString().padStart(2, '0')}:00`;
      
      // Don't show slots that would end after 6 PM
      if (hour + duration <= 18) {
        slots.push({
          id: `${hour}-${hour + duration}`,
          startTime,
          endTime,
          available: true,
          booked: false
        });
      }
    }
    return slots;
  };

  // No more mock data - using real API data

  useEffect(() => {
    if (guideId && selectedDate) {
      loadAvailability();
    }
  }, [guideId, selectedDate, duration]);

  const loadAvailability = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch real availability data from API
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/guides/${guideId}/time-slots?date=${selectedDate}&duration=${duration}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match component format
      const timeSlots = data.available_slots.map(slot => ({
        id: `${slot.start_time}-${slot.end_time}`,
        startTime: slot.start_time,
        endTime: slot.end_time,
        available: slot.available,
        booked: slot.booked
      }));
      
      setAvailability(timeSlots);
    } catch (err) {
      setError('Failed to load availability schedule');
      console.error('Error loading availability:', err);
      
      // Fallback: show all slots as unavailable if API fails
      const fallbackSlots = generateTimeSlots().map(slot => ({
        ...slot,
        available: false,
        booked: true
      }));
      setAvailability(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (slot) => {
    if (slot.available && onTimeSlotSelect) {
      onTimeSlotSelect(slot);
    }
  };

  const getSlotStatus = (slot) => {
    if (slot.booked) return 'booked';
    if (slot.available) return 'available';
    return 'unavailable';
  };

  const getSlotStatusText = (slot) => {
    if (slot.booked) return 'Booked';
    if (slot.available) return 'Available';
    return 'Unavailable';
  };

  const getSlotStatusColor = (slot) => {
    if (slot.booked) return 'danger';
    if (slot.available) return 'success';
    return 'secondary';
  };

  if (!selectedDate) {
    return (
      <div className="availability-schedule">
        <div className="alert alert-info">
          <i className="fas fa-calendar-alt me-2"></i>
          Please select a date to view availability
        </div>
      </div>
    );
  }

  return (
    <div className="availability-schedule">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <i className="fas fa-clock me-2"></i>
          Available Time Slots
        </h6>
        <small className="text-muted">
          {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </small>
      </div>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted small">Loading availability...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <br />
          <small className="text-muted">
            This could be due to network issues or the guide not having availability set up for this day.
          </small>
        </div>
      ) : (
        <>
          <div className="row g-2 mb-3">
            {availability.map((slot) => {
              const isSelected = selectedTimeSlot && selectedTimeSlot.id === slot.id;
              const status = getSlotStatus(slot);
              const statusColor = getSlotStatusColor(slot);
              
              return (
                <div key={slot.id} className="col-6 col-md-4 col-lg-3">
                  <button
                    type="button"
                    className={`btn btn-sm w-100 ${
                      isSelected 
                        ? 'btn-primary' 
                        : status === 'available' 
                          ? 'btn-outline-success' 
                          : status === 'booked'
                            ? 'btn-outline-danger'
                            : 'btn-outline-secondary'
                    }`}
                    onClick={() => handleTimeSlotClick(slot)}
                    disabled={!slot.available}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.5rem 0.25rem',
                      border: isSelected ? '2px solid var(--bs-primary)' : '1px solid',
                      borderRadius: 'var(--bs-border-radius)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <div className="fw-bold">{slot.startTime}</div>
                      <div className="small text-muted">to {slot.endTime}</div>
                      <div className={`badge bg-${statusColor} mt-1`} style={{ fontSize: '0.6rem' }}>
                        {getSlotStatusText(slot)}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="availability-legend">
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <div className="d-flex align-items-center">
                <div className="badge bg-success me-2" style={{ width: '12px', height: '12px' }}></div>
                <small className="text-muted">Available</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="badge bg-danger me-2" style={{ width: '12px', height: '12px' }}></div>
                <small className="text-muted">Booked</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="badge bg-secondary me-2" style={{ width: '12px', height: '12px' }}></div>
                <small className="text-muted">Unavailable</small>
              </div>
            </div>
          </div>

          {selectedTimeSlot && (
            <div className="alert alert-success mt-3">
              <i className="fas fa-check-circle me-2"></i>
              <strong>Selected:</strong> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
              <br />
              <small>Duration: {duration} hour{duration > 1 ? 's' : ''}</small>
            </div>
          )}

          {availability.filter(slot => slot.available).length === 0 && (
            <div className="alert alert-warning">
              <i className="fas fa-calendar-times me-2"></i>
              No available time slots for this date. Please select a different date.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GuideAvailabilitySchedule;
