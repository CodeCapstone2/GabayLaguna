import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const GuideDutyLocations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Duty locations state
  const [dutyLocations, setDutyLocations] = useState({
    cities: [],
    pointsOfInterest: [],
  });

  // Form states
  const [newDutyLocation, setNewDutyLocation] = useState({
    type: "city", // "city" or "poi"
    cityId: "",
    poiId: "",
    notes: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    loadInitialData();
  }, [navigate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load cities
      const citiesResponse = await axios.get(
        `${API_CONFIG.BASE_URL}/api/cities`
      );
      setCities(citiesResponse.data.cities || []);

      // Load categories
      const categoriesResponse = await axios.get(
        `${API_CONFIG.BASE_URL}/api/categories`
      );
      setCategories(categoriesResponse.data.categories || []);

      // Load existing duty locations
      await loadDutyLocations();
    } catch (error) {
      console.error("Error loading initial data:", error);
      setCities([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDutyLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/guide/duty-locations`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.duty_locations) {
        setDutyLocations(response.data.duty_locations);
      }
    } catch (error) {
      console.error("Error loading duty locations:", error);
      // If endpoint doesn't exist yet, we'll handle it gracefully
    }
  };

  // Fallback POI data for when API fails - matches actual database cities
  const getFallbackPOIs = (cityId) => {
    const fallbackData = {
      1: [ // Pagsanjan
        { id: 1, name: "Pagsanjan Falls", city_id: 1, description: "One of the most famous waterfalls in the Philippines, featuring thrilling boat rides through narrow gorges." },
        { id: 2, name: "Pagsanjan Arch", city_id: 1, description: "A historical arch that serves as the gateway to Pagsanjan town." }
      ],
      2: [ // Sta. Rosa
        { id: 3, name: "Enchanted Kingdom", city_id: 2, description: "A popular theme park with thrilling rides and family attractions." },
        { id: 4, name: "Sta. Rosa City Hall", city_id: 2, description: "The modern city hall building showcasing contemporary architecture." }
      ],
      3: [ // Lumban
        { id: 5, name: "Lake Caliraya", city_id: 3, description: "A beautiful man-made lake perfect for water sports and relaxation." },
        { id: 6, name: "Lumban Church", city_id: 3, description: "A historical church known for its beautiful architecture." }
      ],
      4: [ // Nagcarlan
        { id: 7, name: "Nagcarlan Underground Cemetery", city_id: 4, description: "A unique underground cemetery with historical significance." },
        { id: 8, name: "Nagcarlan Falls", city_id: 4, description: "Beautiful waterfalls perfect for nature lovers and adventure seekers." }
      ],
      5: [ // Calamba
        { id: 9, name: "Rizal Shrine", city_id: 5, description: "The birthplace of Dr. Jose Rizal, the Philippine national hero." },
        { id: 10, name: "Calamba Church", city_id: 5, description: "St. John the Baptist Parish Church where Rizal was baptized." },
        { id: 11, name: "Mount Makiling", city_id: 5, description: "A dormant volcano known for its rich biodiversity and hiking trails." }
      ],
      6: [ // Pila
        { id: 12, name: "Pila Heritage Town", city_id: 6, description: "A well-preserved Spanish colonial town with historical architecture." }
      ],
      7: [ // Los Baños
        { id: 13, name: "UP Los Baños", city_id: 7, description: "The University of the Philippines Los Baños campus with beautiful grounds." },
        { id: 14, name: "Los Baños Hot Springs", city_id: 7, description: "Natural hot springs perfect for relaxation and wellness." }
      ],
      8: [ // San Pablo City
        { id: 15, name: "Seven Lakes of San Pablo", city_id: 8, description: "Seven crater lakes formed by volcanic activity, perfect for nature lovers." },
        { id: 16, name: "San Pablo Cathedral", city_id: 8, description: "The main cathedral of San Pablo City, known as the City of Seven Lakes." }
      ],
      9: [ // Liliw
        { id: 17, name: "Liliw Church", city_id: 9, description: "A beautiful church known for its cool climate and footwear industry." }
      ],
      10: [ // Paete
        { id: 18, name: "Paete Woodcarving Shops", city_id: 10, description: "The woodcarving capital of the Philippines with skilled artisans." }
      ],
      11: [ // Majayjay
        { id: 19, name: "Majayjay Church", city_id: 11, description: "A historical church in a mountainous town with cool climate." },
        { id: 20, name: "Majayjay Falls", city_id: 11, description: "Beautiful waterfalls in a mountainous setting." }
      ],
      12: [ // Pangil
        { id: 21, name: "Pangil River", city_id: 12, description: "Perfect for river adventures and water activities." }
      ],
      13: [ // Luisiana
        { id: 22, name: "Luisiana Scenic Views", city_id: 13, description: "Mountainous town with scenic views and peaceful environment." }
      ],
      14: [ // Calauan
        { id: 23, name: "Calauan Nature Park", city_id: 14, description: "Agricultural lands and nature parks near Laguna de Bay." }
      ]
    };
    
    return fallbackData[cityId] || [];
  };

  const loadPointsOfInterest = async (cityId) => {
    if (!cityId) {
      setPointsOfInterest([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}/pois`
      );
      
      // Handle different response formats
      let poisData = [];
      if (response.data.points_of_interest) {
        poisData = Array.isArray(response.data.points_of_interest) 
          ? response.data.points_of_interest 
          : [];
      } else if (response.data.pois) {
        poisData = Array.isArray(response.data.pois) ? response.data.pois : [];
      } else if (Array.isArray(response.data)) {
        poisData = response.data;
      } else {
        poisData = [];
      }
      
      setPointsOfInterest(poisData);
    } catch (error) {
      console.error("Error loading points of interest:", error);
      setPointsOfInterest([]);
    }
  };

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    setNewDutyLocation((prev) => ({ ...prev, cityId, poiId: "" }));
    loadPointsOfInterest(cityId);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      loadPOIsByCategory(categoryId);
    } else {
      setPointsOfInterest([]);
    }
  };

  const loadPOIsByCategory = async (categoryId) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/categories/${categoryId}/pois`
      );
      setPointsOfInterest(response.data.pois || []);
    } catch (error) {
      console.error("Error loading POIs by category:", error);
      setPointsOfInterest([]);
    }
  };

  const handleAddDutyLocation = async (e) => {
    e.preventDefault();

    if (
      !newDutyLocation.type ||
      (newDutyLocation.type === "city" && !newDutyLocation.cityId) ||
      (newDutyLocation.type === "poi" && !newDutyLocation.poiId)
    ) {
      alert("Please select a location to add.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/guide/duty-locations`,
        {
          type: newDutyLocation.type,
          city_id: newDutyLocation.cityId || null,
          poi_id: newDutyLocation.poiId || null,
          notes: newDutyLocation.notes,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Duty location added successfully!");
        setNewDutyLocation({
          type: "city",
          cityId: "",
          poiId: "",
          notes: "",
        });
        setSelectedCity("");
        setSelectedCategory("");
        setPointsOfInterest([]);
        await loadDutyLocations();
      }
    } catch (error) {
      console.error("Error adding duty location:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add duty location. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDutyLocation = async (type, id) => {
    if (
      !window.confirm("Are you sure you want to remove this duty location?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}/api/guide/duty-locations/${type}/${id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Duty location removed successfully!");
        await loadDutyLocations();
      }
    } catch (error) {
      console.error("Error removing duty location:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to remove duty location. Please try again.";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div
        className="container py-5 text-center"
        style={{ fontFamily: "var(--font-family-primary)" }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{
            color: "var(--color-success)",
            width: "3rem",
            height: "3rem",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p
          className="mt-3"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.1rem",
          }}
        >
          Loading duty location information...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="container py-5 text-center"
        style={{ fontFamily: "var(--font-family-primary)" }}
      >
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.1rem",
          }}
        >
          Please log in to manage duty locations.
        </p>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{ fontFamily: "var(--font-family-primary)" }}
    >
      <div className="row">
        <div className="col-lg-8">
          {/* Add New Duty Location */}
          <div
            className="card shadow-lg border-0 mb-4"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="card-header"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
                color: "white",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                border: "none",
              }}
            >
              <h4
                className="mb-0"
                style={{
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                📍 Add Duty Location
              </h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleAddDutyLocation}>
                {/* Location Type Selection */}
                <div className="mb-4">
                  <label
                    className="form-label"
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "500",
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    🎯 Location Type
                  </label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="locationType"
                        id="cityType"
                        value="city"
                        checked={newDutyLocation.type === "city"}
                        onChange={(e) =>
                          setNewDutyLocation((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="cityType"
                        style={{
                          color: "var(--color-text)",
                          cursor: "pointer",
                        }}
                      >
                        🏙️ Entire City
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="locationType"
                        id="poiType"
                        value="poi"
                        checked={newDutyLocation.type === "poi"}
                        onChange={(e) =>
                          setNewDutyLocation((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="poiType"
                        style={{
                          color: "var(--color-text)",
                          cursor: "pointer",
                        }}
                      >
                        🏛️ Specific Location
                      </label>
                    </div>
                  </div>
                </div>

                {/* City Selection */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{
                        color: "var(--color-text)",
                        fontWeight: "500",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      🏙️ Select City
                    </label>
                    <select
                      className="form-select"
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text)",
                        transition: "var(--transition-fast)",
                      }}
                    >
                      <option value="">Choose a city...</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{
                        color: "var(--color-text)",
                        fontWeight: "500",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      🏷️ Filter by Category (Optional)
                    </label>
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text)",
                        transition: "var(--transition-fast)",
                      }}
                    >
                      <option value="">All categories...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Point of Interest Selection (for POI type) */}
                {newDutyLocation.type === "poi" && (
                  <div className="mb-3">
                    <label
                      className="form-label"
                      style={{
                        color: "var(--color-text)",
                        fontWeight: "500",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      🏛️ Select Specific Location
                    </label>
                    <select
                      className="form-select"
                      value={newDutyLocation.poiId}
                      onChange={(e) =>
                        setNewDutyLocation((prev) => ({
                          ...prev,
                          poiId: e.target.value,
                        }))
                      }
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text)",
                        transition: "var(--transition-fast)",
                      }}
                    >
                      <option value="">Choose a location...</option>
                      {pointsOfInterest.map((poi) => (
                        <option key={poi.id} value={poi.id}>
                          {poi.name} {poi.category ? `(${poi.category?.name || poi.category})` : ''} - {poi.city?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <label
                    className="form-label"
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "500",
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    📝 Additional Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    value={newDutyLocation.notes}
                    onChange={(e) =>
                      setNewDutyLocation((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows="3"
                    placeholder="Any special notes about this duty location..."
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--spacing-md)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      transition: "var(--transition-fast)",
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-lg w-100"
                  disabled={submitting}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    color: "white",
                    fontWeight: "600",
                    padding: "var(--spacing-md)",
                    transition: "var(--transition-normal)",
                    boxShadow: "var(--shadow-md)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "var(--shadow-lg)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "var(--shadow-md)";
                  }}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Adding...
                    </>
                  ) : (
                    "➕ Add Duty Location"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Current Duty Locations */}
        <div className="col-lg-4">
          <div
            className="card shadow-lg border-0"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="card-header"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-light) 100%)",
                color: "white",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                border: "none",
              }}
            >
              <h5
                className="mb-0"
                style={{
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "600",
                }}
              >
                📋 My Duty Locations
              </h5>
            </div>
            <div className="card-body" style={{ color: "var(--color-text)" }}>
              {/* Cities */}
              <div className="mb-4">
                <h6
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                    marginBottom: "var(--spacing-md)",
                  }}
                >
                  🏙️ Cities ({dutyLocations.cities?.length || 0})
                </h6>
                {dutyLocations.cities?.length === 0 ? (
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.9rem",
                    }}
                  >
                    No cities selected yet.
                  </p>
                ) : (
                  <div className="list-group list-group-flush">
                    {dutyLocations.cities?.map((city) => (
                      <div
                        key={city.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid var(--color-border-light)",
                          borderRadius: "var(--radius-sm)",
                          marginBottom: "var(--spacing-xs)",
                          padding: "var(--spacing-sm)",
                        }}
                      >
                        <span style={{ color: "var(--color-text)" }}>
                          {city.name}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleRemoveDutyLocation("city", city.id)
                          }
                          style={{
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.8rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Points of Interest */}
              <div className="mb-3">
                <h6
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-family-heading)",
                    fontWeight: "600",
                    marginBottom: "var(--spacing-md)",
                  }}
                >
                  🏛️ Specific Locations (
                  {dutyLocations.pointsOfInterest?.length || 0})
                </h6>
                {dutyLocations.pointsOfInterest?.length === 0 ? (
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.9rem",
                    }}
                  >
                    No specific locations selected yet.
                  </p>
                ) : (
                  <div className="list-group list-group-flush">
                    {dutyLocations.pointsOfInterest?.map((poi) => (
                      <div
                        key={poi.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid var(--color-border-light)",
                          borderRadius: "var(--radius-sm)",
                          marginBottom: "var(--spacing-xs)",
                          padding: "var(--spacing-sm)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: "var(--color-text)",
                              fontWeight: "500",
                            }}
                          >
                            {poi.name}
                          </div>
                          <small style={{ color: "var(--color-text-muted)" }}>
                            {poi.city?.name}
                          </small>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleRemoveDutyLocation("poi", poi.id)
                          }
                          style={{
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.8rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="mt-4 p-3"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                <small style={{ color: "var(--color-text-secondary)" }}>
                  <strong style={{ color: "var(--color-text)" }}>
                    💡 Tips:
                  </strong>
                  <br />
                  • Select cities for broader coverage
                  <br />
                  • Choose specific locations for targeted tours
                  <br />• You can work in multiple areas
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDutyLocations;
