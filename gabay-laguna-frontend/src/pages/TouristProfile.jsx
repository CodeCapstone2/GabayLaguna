import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaMapMarkerAlt,
} from "react-icons/fa";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";

const TouristProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [travelPreferences, setTravelPreferences] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchUserStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
        setRecentActivity(data.recent_activity);
        setTravelPreferences(data.travel_preferences);
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setEditForm({
          name: userObj.name || "",
          email: userObj.email || "",
          phone: userObj.phone || "",
          nationality: userObj.nationality || "",
          bio: userObj.bio || "",
        });
        
        // Fetch statistics after setting user
        fetchUserStatistics();
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
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      nationality: user.nationality || "",
      bio: user.bio || "",
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
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  {isEditing && (
                    <label
                      className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-2"
                      style={{ cursor: "pointer" }}
                    >
                      <FaCamera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-grow-1">
                  <h1
                    className="fw-bold mb-3"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      user.name
                    )}
                  </h1>
                  <p className="text-muted mb-1">
                    <FaEnvelope className="me-2" />
                    {isEditing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    ) : (
                      user.email
                    )}
                  </p>
                  <div className="d-flex gap-2 mt-3">
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={handleSave}
                        >
                          <FaSave className="me-2" />
                          Save Changes
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancel}
                        >
                          <FaTimes className="me-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-outline-success"
                        onClick={handleEdit}
                      >
                        <FaEdit className="me-2" />
                        Edit Profile
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
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h5 className="mb-0 text-success">
                <FaUser className="me-2" />
                Personal Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaPhone className="me-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="form-control"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  ) : (
                    <p className="mb-0">{user.phone || "Not provided"}</p>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaGlobe className="me-2" />
                    Nationality
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.nationality}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          nationality: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="mb-0">
                      {user.nationality || "Not specified - Click Edit to add"}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">
                  <FaUser className="me-2" />
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                  />
                ) : (
                  <p className="mb-0">{user.bio || "No bio available - Click Edit to add"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h5 className="mb-0 text-primary">
                <FaMapMarkerAlt className="me-2" />
                Travel Preferences
              </h5>
            </div>
            <div className="card-body">
              {loadingStats ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 mb-0 text-muted small">Loading preferences...</p>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold text-muted">
                      Preferred Cities
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {travelPreferences?.preferred_cities && travelPreferences.preferred_cities.length > 0 ? (
                        travelPreferences.preferred_cities.map((city, index) => (
                          <span key={index} className="badge bg-success">
                            {city}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">
                          No preferred cities yet
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold text-muted">
                      Interests
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {travelPreferences?.interests && travelPreferences.interests.length > 0 ? (
                        travelPreferences.interests.map((interest, index) => (
                          <span key={index} className="badge bg-info">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">
                          No interests detected yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Travel preferences are automatically generated based on your completed tours and booking history.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          {/* Quick Stats (real data from user/bookings/reviews when available) */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-success">Travel Statistics</h6>
            </div>
            <div className="card-body">
              {loadingStats ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 mb-0 text-muted small">Loading statistics...</p>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Total Tours</span>
                    <span className="fw-bold text-success">
                      {statistics?.total_tours ?? 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Completed Tours</span>
                    <span className="fw-bold text-success">
                      {statistics?.completed_tours ?? 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Cities Visited</span>
                    <span className="fw-bold text-primary">
                      {statistics?.cities_visited ?? 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Reviews Given</span>
                    <span className="fw-bold text-warning">
                      {statistics?.reviews_given ?? 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Member Since</span>
                    <span className="fw-bold text-info">
                      {new Date(user?.created_at || Date.now()).getFullYear()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-success">Recent Activity</h6>
            </div>
            <div className="card-body">
              {loadingStats ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 mb-0 text-muted small">Loading activity...</p>
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-primary">{activity.poi_name}</h6>
                          <p className="mb-1 text-muted small">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {activity.city} • {activity.guide_name}
                          </p>
                          <p className="mb-0 text-muted small">
                            <i className="fas fa-calendar me-1"></i>
                            {new Date(activity.tour_date).toLocaleDateString()} • 
                            <span className={`badge ms-1 ${
                              activity.status === 'completed' ? 'bg-success' :
                              activity.status === 'confirmed' ? 'bg-primary' :
                              activity.status === 'cancelled' ? 'bg-secondary' :
                              activity.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {activity.status}
                            </span>
                          </p>
                        </div>
                        <small className="text-muted">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small mb-0">No recent activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristProfile;
