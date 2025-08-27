import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaEdit, FaSave, FaTimes, FaCamera, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaCertificate, FaLanguage, FaCar, FaClock, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import "bootstrap/dist/css/bootstrap.min.css";

const TourGuideProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [availability, setAvailability] = useState({
    monday: { morning: true, afternoon: true, evening: false },
    tuesday: { morning: true, afternoon: true, evening: false },
    wednesday: { morning: true, afternoon: true, evening: false },
    thursday: { morning: true, afternoon: true, evening: false },
    friday: { morning: true, afternoon: true, evening: false },
    saturday: { morning: true, afternoon: true, evening: true },
    sunday: { morning: false, afternoon: false, evening: false }
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setEditForm({
          name: userObj.name || '',
          email: userObj.email || '',
          phone: userObj.phone || '',
          bio: userObj.bio || 'Experienced tour guide passionate about sharing the beauty and history of Laguna.',
          license_number: userObj.license_number || 'LG-2024-001',
          experience_years: userObj.experience_years || 5,
          hourly_rate: userObj.hourly_rate || 500,
          languages: userObj.languages || 'English, Tagalog',
          transportation_type: userObj.transportation_type || 'Private Vehicle',
          specializations: userObj.specializations || ['Historical Sites', 'Natural Parks', 'Cultural Tours']
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...editForm };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || 'Experienced tour guide passionate about sharing the beauty and history of Laguna.',
      license_number: user.license_number || 'LG-2024-001',
      experience_years: user.experience_years || 5,
      hourly_rate: user.hourly_rate || 500,
      languages: user.languages || 'English, Tagalog',
      transportation_type: user.transportation_type || 'Private Vehicle',
      specializations: user.specializations || ['Historical Sites', 'Natural Parks', 'Cultural Tours']
    });
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAvailability = (day, time) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: !prev[day][time]
      }
    }));
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Profile Header */}
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="position-relative me-4">
                  <img
                    src={profileImage || "/assets/logo.png"}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: "cover" }}
                  />
                  {isEditing && (
                    <label className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-2" style={{ cursor: 'pointer' }}>
                      <FaCamera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-grow-1">
                  <h2 className="fw-bold text-primary mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : (
                      user.name
                    )}
                  </h2>
                  <p className="text-muted mb-1">
                    <FaEnvelope className="me-2" />
                    {isEditing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      />
                    ) : (
                      user.email
                    )}
                  </p>
                  <div className="d-flex gap-2 mt-3">
                    {isEditing ? (
                      <>
                        <button className="btn btn-success" onClick={handleSave}>
                          <FaSave className="me-2" />Save Changes
                        </button>
                        <button className="btn btn-secondary" onClick={handleCancel}>
                          <FaTimes className="me-2" />Cancel
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-outline-primary" onClick={handleEdit}>
                        <FaEdit className="me-2" />Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="col-md-8">
          {/* Professional Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h5 className="mb-0 text-primary">
                <FaCertificate className="me-2" />Professional Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaCertificate className="me-2" />License Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.license_number}
                      onChange={(e) => setEditForm({...editForm, license_number: e.target.value})}
                    />
                  ) : (
                    <p className="mb-0">{user.license_number || 'Not provided'}</p>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaStar className="me-2" />Experience (Years)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.experience_years}
                      onChange={(e) => setEditForm({...editForm, experience_years: e.target.value})}
                    />
                  ) : (
                    <p className="mb-0">{user.experience_years || 'Not specified'} years</p>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaDollarSign className="me-2" />Hourly Rate (₱)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.hourly_rate}
                      onChange={(e) => setEditForm({...editForm, hourly_rate: e.target.value})}
                    />
                  ) : (
                    <p className="mb-0">₱{user.hourly_rate || 'Not specified'}</p>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaLanguage className="me-2" />Languages
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.languages}
                      onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                    />
                  ) : (
                    <p className="mb-0">{user.languages || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">
                  <FaCar className="me-2" />Transportation Type
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.transportation_type}
                    onChange={(e) => setEditForm({...editForm, transportation_type: e.target.value})}
                  />
                ) : (
                  <p className="mb-0">{user.transportation_type || 'Not specified'}</p>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">
                  <FaUser className="me-2" />Bio
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  />
                ) : (
                  <p className="mb-0">{user.bio || 'No bio available'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h5 className="mb-0 text-success">
                <FaMapMarkerAlt className="me-2" />Specializations
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {user.specializations?.map((spec, index) => (
                  <span key={index} className="badge bg-success fs-6">
                    {spec}
                  </span>
                )) || (
                  <>
                    <span className="badge bg-success fs-6">Historical Sites</span>
                    <span className="badge bg-success fs-6">Natural Parks</span>
                    <span className="badge bg-success fs-6">Cultural Tours</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0 text-warning">
                <FaClock className="me-2" />Availability Schedule
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-borderless">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Morning</th>
                      <th>Afternoon</th>
                      <th>Evening</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(availability).map(([day, times]) => (
                      <tr key={day}>
                        <td className="fw-semibold text-capitalize">{day}</td>
                        <td>
                          <button
                            className={`btn btn-sm ${times.morning ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => toggleAvailability(day, 'morning')}
                          >
                            {times.morning ? <FaCheckCircle /> : '—'}
                          </button>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${times.afternoon ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => toggleAvailability(day, 'afternoon')}
                          >
                            {times.afternoon ? <FaCheckCircle /> : '—'}
                          </button>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${times.evening ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => toggleAvailability(day, 'evening')}
                          >
                            {times.evening ? <FaCheckCircle /> : '—'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          {/* Quick Stats */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-primary">Guide Statistics</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Total Tours</span>
                <span className="fw-bold text-success">156</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Happy Clients</span>
                <span className="fw-bold text-primary">142</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Average Rating</span>
                <span className="fw-bold text-warning">4.8 ⭐</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Member Since</span>
                <span className="fw-bold text-info">2020</span>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-primary">Recent Reviews</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-start mb-3">
                <div className="bg-warning rounded-circle p-2 me-3">
                  <FaStar size={12} className="text-white" />
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="fw-bold me-2">Maria S.</span>
                    <small className="text-muted">5.0 ⭐</small>
                  </div>
                  <p className="mb-0 small">"Excellent tour of Rizal Shrine. Very knowledgeable guide!"</p>
                </div>
              </div>
              <div className="d-flex align-items-start mb-3">
                <div className="bg-warning rounded-circle p-2 me-3">
                  <FaStar size={12} className="text-white" />
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="fw-bold me-2">John D.</span>
                    <small className="text-muted">4.8 ⭐</small>
                  </div>
                  <p className="mb-0 small">"Great experience exploring Calamba's historical sites."</p>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-warning rounded-circle p-2 me-3">
                  <FaStar size={12} className="text-white" />
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="fw-bold me-2">Ana L.</span>
                    <small className="text-muted">5.0 ⭐</small>
                  </div>
                  <p className="mb-0 small">"Amazing tour guide! Highly recommended."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-primary">Quick Actions</h6>
            </div>
            <div className="card-body">
              <button className="btn btn-outline-primary w-100 mb-2">
                <FaCalendarAlt className="me-2" />Set Availability
              </button>
              <button className="btn btn-outline-success w-100 mb-2">
                <FaMapMarkerAlt className="me-2" />Add Specializations
              </button>
              <button className="btn btn-outline-info w-100">
                <FaStar className="me-2" />View All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuideProfile;
