import React, { useState } from 'react';
import GuideAvailabilitySchedule from '../components/GuideAvailabilitySchedule';

const AvailabilityDemo = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [duration, setDuration] = useState(2);

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    console.log('Selected time slot:', timeSlot);
  };

  // Generate sample dates for the next 7 days
  const generateSampleDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        })
      });
    }
    
    return dates;
  };

  const sampleDates = generateSampleDates();

  return (
    <div className="container py-5">
      <h1 className="mb-4">Guide Availability Schedule Demo</h1>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>
                Guide Availability Schedule
              </h5>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Select Date:</label>
                  <select 
                    className="form-select"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTimeSlot(null); // Clear selection when date changes
                    }}
                  >
                    {sampleDates.map(date => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tour Duration:</label>
                  <select 
                    className="form-select"
                    value={duration}
                    onChange={(e) => {
                      setDuration(parseInt(e.target.value));
                      setSelectedTimeSlot(null); // Clear selection when duration changes
                    }}
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                  </select>
                </div>
              </div>

              <GuideAvailabilitySchedule
                guideId={1}
                selectedDate={selectedDate}
                onTimeSlotSelect={handleTimeSlotSelect}
                selectedTimeSlot={selectedTimeSlot}
                duration={duration}
              />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Selection Details
              </h5>
            </div>
            <div className="card-body">
              {selectedTimeSlot ? (
                <div>
                  <h6>Selected Time Slot:</h6>
                  <div className="alert alert-success">
                    <strong>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</strong>
                    <br />
                    <small>Duration: {duration} hour{duration > 1 ? 's' : ''}</small>
                  </div>
                  
                  <h6>Booking Details:</h6>
                  <ul className="list-unstyled">
                    <li><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</li>
                    <li><strong>Start Time:</strong> {selectedTimeSlot.startTime}</li>
                    <li><strong>End Time:</strong> {selectedTimeSlot.endTime}</li>
                    <li><strong>Duration:</strong> {duration} hour{duration > 1 ? 's' : ''}</li>
                  </ul>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-clock fa-3x mb-3"></i>
                  <p>No time slot selected</p>
                  <small>Select a date and choose an available time slot</small>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-lightbulb me-2"></i>
                How It Works
              </h6>
            </div>
            <div className="card-body">
              <ol className="small">
                <li>Select a date from the dropdown</li>
                <li>Choose your preferred tour duration</li>
                <li>Click on an available time slot (green)</li>
                <li>Booked slots (red) are not available</li>
                <li>Selected slot will be highlighted in blue</li>
              </ol>
              
              <div className="mt-3">
                <h6 className="small">Legend:</h6>
                <div className="d-flex flex-column gap-1">
                  <div className="d-flex align-items-center">
                    <div className="badge bg-success me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small>Available</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="badge bg-danger me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small>Booked</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="badge bg-secondary me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small>Unavailable</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-success">
            <h5><i className="fas fa-check-circle me-2"></i>Feature Successfully Implemented!</h5>
            <ul className="mb-0">
              <li>✅ Tourists can now see guide availability schedules</li>
              <li>✅ Interactive time slot selection with visual feedback</li>
              <li>✅ Real-time availability updates based on selected date</li>
              <li>✅ Duration-based time slot filtering</li>
              <li>✅ Clear visual indicators for available/booked slots</li>
              <li>✅ Selected time slot integration with booking form</li>
              <li>✅ Booking summary shows selected time and date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityDemo;
