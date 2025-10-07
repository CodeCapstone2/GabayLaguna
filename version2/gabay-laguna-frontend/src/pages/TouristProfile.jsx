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
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const TouristProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileImage, setProfileImage] = useState(null);

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
          nationality: userObj.nationality || "Filipino",
          bio:
            userObj.bio ||
            "Passionate traveler exploring the beautiful province of Laguna.",
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
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      nationality: user.nationality || "Filipino",
      bio:
        user.bio ||
        "Passionate traveler exploring the beautiful province of Laguna.",
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
                      {user.nationality || "Not specified"}
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
                  <p className="mb-0">{user.bio || "No bio available"}</p>
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
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    Preferred Cities
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-success">Calamba</span>
                    <span className="badge bg-success">San Pablo</span>
                    <span className="badge bg-success">Sta. Rosa</span>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    Interests
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-info">Historical Sites</span>
                    <span className="badge bg-info">Natural Parks</span>
                    <span className="badge bg-info">Local Food</span>
                  </div>
                </div>
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Total Tours</span>
                <span className="fw-bold text-success">
                  {user?.stats?.total_tours ?? 0}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Cities Visited</span>
                <span className="fw-bold text-primary">
                  {user?.stats?.cities_visited ?? 0}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Reviews Given</span>
                <span className="fw-bold text-warning">
                  {user?.stats?.reviews_given ?? 0}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Member Since</span>
                <span className="fw-bold text-info">
                  {new Date(user?.created_at || Date.now()).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity (simple placeholders removed; show empty state) */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-success">Recent Activity</h6>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-0">No recent activity yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristProfile;
