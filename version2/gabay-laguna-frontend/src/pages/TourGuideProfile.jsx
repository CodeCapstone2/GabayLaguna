import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api";
import {
  FaUser,
  FaEnvelope,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaCertificate,
  FaLanguage,
  FaCar,
  FaClock,
  FaDollarSign,
  FaCheckCircle,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const TourGuideProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tourGuide, setTourGuide] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      navigate("/login");
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setTourGuide(userObj.tour_guide || {});

      // Initialize edit form with both user and tour guide data
      setEditForm({
        name: userObj.name || "",
        email: userObj.email || "",
        phone: userObj.phone || "",
        bio: userObj.tour_guide?.bio || "",
        license_number: userObj.tour_guide?.license_number || "",
        experience_years: userObj.tour_guide?.experience_years || 0,
        hourly_rate: userObj.tour_guide?.hourly_rate || 0,
        languages: userObj.tour_guide?.languages || "",
        transportation_type: userObj.tour_guide?.transportation_type || "",
      });

      // Load profile image if exists
      if (userObj.profile_picture) {
        setProfileImage(userObj.profile_picture);
      } else {
        setProfileImage("/assets/logo.png");
      }

      // Fetch guide data
      fetchGuideData();
      fetchCategories();
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const getAuthHeaders = (includeJson = true) => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  const fetchGuideData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch availability
      const availabilityRes = await fetch(
        `${API_CONFIG.BASE_URL}/api/guide/availability`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json();
        setAvailability(
          Array.isArray(availabilityData) ? availabilityData : []
        );
      } else if (availabilityRes.status === 401) {
        handleUnauthorized();
        return;
      }

      // Fetch specializations
      const specRes = await fetch(
        `${API_CONFIG.BASE_URL}/api/guide/specializations`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (specRes.ok) {
        const specData = await specRes.json();
        setSpecializations(Array.isArray(specData) ? specData : []);
      }
    } catch (error) {
      console.error("Error fetching guide data:", error);
      setError("Failed to load guide data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // For AuthController's updateProfile, we only send user data
      const formData = new FormData();

      // Add user data to form
      formData.append("name", editForm.name);
      formData.append("email", editForm.email);
      if (editForm.phone) {
        formData.append("phone", editForm.phone);
      }

      // Add profile image if selected and it's a valid file
      if (profileImageFile) {
        if (profileImageFile.size <= 2 * 1024 * 1024) {
          formData.append("profile_picture", profileImageFile);
        } else {
          setError("Profile picture must be less than 2MB");
          setSaving(false);
          return;
        }
      }

      console.log("Updating user profile...");

      // Update user profile using AuthController endpoint
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await res.text();
      console.log("User profile response:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        throw new Error("Server returned invalid JSON");
      }

      if (res.ok) {
        const updatedUser = responseData.user;
        console.log("User profile updated successfully:", updatedUser);

        // Now update tour guide specific data
        console.log("Updating tour guide data...");
        const guideUpdateSuccess = await updateTourGuideData(token);

        if (guideUpdateSuccess) {
          console.log("Both user and tour guide data updated successfully");

          // Refresh the ENTIRE user data with tour_guide relationship
          await refreshUserData(token);

          setIsEditing(false);
          setProfileImageFile(null);
          alert("Profile updated successfully!");
        } else {
          // User profile was updated but tour guide data failed
          await refreshUserData(token); // Still refresh user data
          setIsEditing(false);
          setProfileImageFile(null);
          alert(
            "Profile updated, but some tour guide information may not have been saved."
          );
        }
      } else if (res.status === 401) {
        handleUnauthorized();
      } else if (res.status === 422) {
        const errorMessages = Object.values(responseData.errors || {})
          .flat()
          .join(", ");
        throw new Error(`Validation failed: ${errorMessages}`);
      } else {
        throw new Error(responseData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Add this function to refresh user data
  const refreshUserData = async (token) => {
    try {
      const userRes = await fetch(`${API_CONFIG.BASE_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        console.log("Refreshed user data:", userData.user);
        setUser(userData.user);
        setTourGuide(userData.user.tour_guide || {});
        localStorage.setItem("user", JSON.stringify(userData.user));

        // Also update the editForm with the new data
        setEditForm({
          name: userData.user.name || "",
          email: userData.user.email || "",
          phone: userData.user.phone || "",
          bio: userData.user.tour_guide?.bio || "",
          license_number: userData.user.tour_guide?.license_number || "",
          experience_years: userData.user.tour_guide?.experience_years || 0,
          hourly_rate: userData.user.tour_guide?.hourly_rate || 0,
          languages: userData.user.tour_guide?.languages || "",
          transportation_type:
            userData.user.tour_guide?.transportation_type || "",
        });
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const updateTourGuideData = async (token) => {
    try {
      // Prepare tour guide data - ensure we don't send empty strings for nullable fields
      const guideData = {};

      // Only include fields that have changed from the original values
      if (editForm.bio !== tourGuide?.bio) guideData.bio = editForm.bio;
      if (editForm.license_number !== tourGuide?.license_number)
        guideData.license_number = editForm.license_number;
      if (editForm.experience_years !== tourGuide?.experience_years)
        guideData.experience_years = editForm.experience_years;
      if (editForm.hourly_rate !== tourGuide?.hourly_rate)
        guideData.hourly_rate = editForm.hourly_rate;
      if (editForm.languages !== tourGuide?.languages)
        guideData.languages = editForm.languages;
      if (editForm.transportation_type !== tourGuide?.transportation_type)
        guideData.transportation_type = editForm.transportation_type;

      console.log("Sending tour guide data:", guideData);
      console.log("Original tour guide data:", tourGuide);

      // Only send if there's data to update
      if (Object.keys(guideData).length > 0) {
        const guideRes = await fetch(
          `${API_CONFIG.BASE_URL}/api/guide/update-profile`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(guideData),
          }
        );

        const guideResponseText = await guideRes.text();
        console.log("Tour guide update response:", guideResponseText);

        if (guideRes.ok) {
          return true;
        } else {
          console.warn("Tour guide data update failed:", guideResponseText);
          return false;
        }
      }
      console.log("No tour guide data changes detected");
      return true; // No data to update is considered success
    } catch (error) {
      console.warn("Error updating tour guide data:", error);
      return false;
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: tourGuide?.bio || "",
      license_number: tourGuide?.license_number || "",
      experience_years: tourGuide?.experience_years || 0,
      hourly_rate: tourGuide?.hourly_rate || 0,
      languages: tourGuide?.languages || "",
      transportation_type: tourGuide?.transportation_type || "",
    });
    setProfileImage(user?.profile_picture || "/assets/logo.png");
    setProfileImageFile(null);
    setIsEditing(false);
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvailabilityChange = async (day, timeSlot, isAvailable) => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const timeMap = {
        morning: { start: "08:00", end: "12:00" },
        afternoon: { start: "13:00", end: "17:00" },
        evening: { start: "18:00", end: "22:00" },
      };

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/guide/availability`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day_of_week: day,
          start_time: timeMap[timeSlot].start,
          end_time: timeMap[timeSlot].end,
          is_available: isAvailable,
        }),
      });

      if (res.ok) {
        const updatedAvailability = await res.json();
        setAvailability((prev) => {
          const filtered = prev.filter(
            (a) =>
              !(
                a.day_of_week === day &&
                a.start_time === timeMap[timeSlot].start &&
                a.end_time === timeMap[timeSlot].end
              )
          );
          return [
            ...filtered,
            updatedAvailability.availability || updatedAvailability,
          ];
        });
      } else if (res.status === 401) {
        handleUnauthorized();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      setError("Error updating availability: " + error.message);
    }
  };

  const addSpecialization = async () => {
    if (!newSpecialization) return;

    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/guide/specializations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_id: newSpecialization,
          }),
        }
      );

      if (res.ok) {
        const newSpec = await res.json();
        setSpecializations((prev) => [
          ...prev,
          newSpec.specialization || newSpec,
        ]);
        setNewSpecialization("");
      } else if (res.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error adding specialization:", error);
      setError("Error adding specialization: " + error.message);
    }
  };

  const removeSpecialization = async (specId) => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/guide/specializations/${specId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (res.ok) {
        setSpecializations((prev) => prev.filter((spec) => spec.id !== specId));
      } else if (res.status === 401) {
        handleUnauthorized();
      }
    } catch (error) {
      console.error("Error removing specialization:", error);
      setError("Error removing specialization: " + error.message);
    }
  };

  const getAvailabilityForDay = (day) => {
    if (!Array.isArray(availability)) return [];
    return availability.filter((a) => a.day_of_week === day);
  };

  const isTimeSlotAvailable = (day, timeSlot) => {
    const dayAvailability = getAvailabilityForDay(day);
    const timeMap = {
      morning: { start: "08:00", end: "12:00" },
      afternoon: { start: "13:00", end: "17:00" },
      evening: { start: "18:00", end: "22:00" },
    };

    return dayAvailability.some(
      (a) =>
        a.start_time === timeMap[timeSlot].start &&
        a.end_time === timeMap[timeSlot].end &&
        a.is_available
    );
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

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const timeSlots = ["morning", "afternoon", "evening"];

  return (
    <div className="container py-5">
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      <div className="row">
        {/* Profile Header */}
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="position-relative me-4">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/assets/logo.png";
                    }}
                  />
                  {/* Always-mounted hidden file input for mobile click support */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="flex-grow-1">
                  <h2 className="fw-bold text-primary mb-2">
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
                  </h2>
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
                          disabled={saving}
                        >
                          <FaSave className="me-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <FaTimes className="me-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
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
          {/* Professional Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h5 className="mb-0 text-primary">
                <FaCertificate className="me-2" />
                Professional Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaCertificate className="me-2" />
                    License Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.license_number}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          license_number: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="mb-0">
                      {tourGuide?.license_number || "Not provided"}
                    </p>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaStar className="me-2" />
                    Experience (Years)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.experience_years}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          experience_years: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="mb-0">
                      {tourGuide?.experience_years || "Not specified"} years
                    </p>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaDollarSign className="me-2" />
                    Hourly Rate (₱)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.hourly_rate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          hourly_rate: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="mb-0">
                      ₱{tourGuide?.hourly_rate || "Not specified"}
                    </p>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <FaLanguage className="me-2" />
                    Languages
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.languages}
                      onChange={(e) =>
                        setEditForm({ ...editForm, languages: e.target.value })
                      }
                    />
                  ) : (
                    <p className="mb-0">
                      {tourGuide?.languages || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted">
                  <FaCar className="me-2" />
                  Transportation Type
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.transportation_type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        transportation_type: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="mb-0">
                    {tourGuide?.transportation_type || "Not specified"}
                  </p>
                )}
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
                  <p className="mb-0">{tourGuide?.bio || "No bio available"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-success">
                <FaMapMarkerAlt className="me-2" />
                Specializations
              </h5>
              {isEditing && (
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={addSpecialization}
                  >
                    <FaPlus />
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {specializations.length > 0 ? (
                  specializations.map((spec) => (
                    <span
                      key={spec.id}
                      className="badge bg-success fs-6 d-flex align-items-center"
                    >
                      {spec.category?.name || "Unknown Category"}
                      {isEditing && (
                        <button
                          className="btn btn-sm btn-link text-white p-0 ms-2"
                          onClick={() => removeSpecialization(spec.id)}
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-muted">No specializations added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0 text-warning">
                <FaClock className="me-2" />
                Availability Schedule
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">
                      Loading availability...
                    </span>
                  </div>
                  <p className="mt-2 text-muted">Loading availability...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Morning (8AM-12PM)</th>
                        <th>Afternoon (1PM-5PM)</th>
                        <th>Evening (6PM-10PM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daysOfWeek.map((day) => (
                        <tr key={day}>
                          <td className="fw-semibold text-capitalize">{day}</td>
                          {timeSlots.map((timeSlot) => (
                            <td key={timeSlot}>
                              <button
                                className={`btn btn-sm ${
                                  isTimeSlotAvailable(day, timeSlot)
                                    ? "btn-success"
                                    : "btn-outline-secondary"
                                }`}
                                onClick={() =>
                                  handleAvailabilityChange(
                                    day,
                                    timeSlot,
                                    !isTimeSlotAvailable(day, timeSlot)
                                  )
                                }
                                disabled={loading}
                              >
                                {isTimeSlotAvailable(day, timeSlot) ? (
                                  <FaCheckCircle />
                                ) : (
                                  "—"
                                )}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          {/* Quick Stats - computed from real reviews and profile data */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-primary">Guide Statistics</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Average Rating</span>
                <span className="fw-bold text-warning">
                  {(user?.tour_guide?.reviews || []).length
                    ? (
                        (user.tour_guide.reviews.reduce(
                          (sum, r) => sum + (Number(r.rating) || 0),
                          0
                        ) /
                          user.tour_guide.reviews.length).toFixed(1)
                      )
                    : "0.0"} ⭐
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Total Reviews</span>
                <span className="fw-bold text-primary">
                  {(user?.tour_guide?.reviews || []).length}
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

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h6 className="mb-0 text-primary">Quick Actions</h6>
            </div>
            <div className="card-body">
              <button
                type="button"
                className="btn btn-outline-primary w-100 mb-2"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="me-2" />
                Edit Profile
              </button>
              <button
                type="button"
                className="btn btn-outline-success w-100 mb-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaCamera className="me-2" />
                Change Photo
              </button>
              <button className="btn btn-outline-info w-100" onClick={() => navigate("/guide/reviews")}>
                <FaStar className="me-2" />
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuideProfile;
