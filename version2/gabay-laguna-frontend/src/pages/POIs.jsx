import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const POIs = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pois, setPois] = useState([]);
  const [city, setCity] = useState(location.state?.city || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guideCounts, setGuideCounts] = useState({});

  useEffect(() => {
    fetchCityPOIs();
    if (!location.state?.city) {
      fetchCityData();
    }
  }, [cityId]);

  useEffect(() => {
    if (pois.length > 0) {
      fetchGuideCounts();
    }
  }, [pois]);

  const fetchCityPOIs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `http://127.0.0.1:8000/api/cities/${cityId}/pois`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response formats
      let poisData = [];

      if (Array.isArray(data)) {
        poisData = data;
      } else if (data.pois) {
        poisData = Array.isArray(data.pois) ? data.pois : [];
      } else if (data.data) {
        poisData = Array.isArray(data.data) ? data.data : [];
      } else if (data.points_of_interest) {
        poisData = Array.isArray(data.points_of_interest)
          ? data.points_of_interest
          : [];
      } else {
        poisData = Object.values(data).find(Array.isArray) || [];
      }

      setPois(poisData);
    } catch (error) {
      console.error("Error fetching city POIs:", error);
      setError("Failed to load points of interest");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideCounts = async () => {
    const counts = {};

    try {
      // First try to get guides by city
      const response = await fetch(
        `http://127.0.0.1:8000/api/cities/${cityId}/guides`
      );

      if (response.ok) {
        const data = await response.json();
        const cityGuideCount = data.guides
          ? data.guides.length
          : data.count || 0;

        // Distribute guides evenly among POIs for demo
        pois.forEach((poi, index) => {
          // Simple distribution logic - you can improve this later
          const baseCount = Math.floor(cityGuideCount / pois.length);
          const remainder = cityGuideCount % pois.length;
          counts[poi.id] = baseCount + (index < remainder ? 1 : 0);
        });
      } else {
        // If city guides endpoint fails, use fallback
        throw new Error("City guides endpoint failed");
      }
    } catch (error) {
      console.error("Error fetching city guides, using fallback:", error);

      // Fallback: Use random counts for demo
      pois.forEach((poi) => {
        counts[poi.id] = Math.floor(Math.random() * 4) + 1; // 1-4 guides
      });
    }

    setGuideCounts(counts);
  };

  const fetchCityData = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/cities/${cityId}`
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
  };

  const handleViewGuides = (poi) => {
    navigate(`/poi/${poi.id}/guides`, { state: { poi, city } });
  };

    const handleBookGuide = (poi) => {
    navigate(`/booking//${poi.id}`, { 
        state: { 
        poi: poi,
        city: city
        }
    });
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
          <p className="mt-2">Loading points of interest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
          ← Back to Cities
        </button>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
        ← Back to Cities
      </button>

      <h2 className="mb-4">
        Points of Interest in {city.name || `City ${cityId}`}
      </h2>

      {pois.length === 0 ? (
        <div className="text-center py-5">
          <div className="alert alert-info">
            <h5>No points of interest found</h5>
            <p>There are no points of interest available for this city yet.</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {pois.map((poi) => (
            <div key={poi.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={
                    poi.image || poi.images?.[0] || "/assets/default-poi.jpg"
                  }
                  className="card-img-top"
                  alt={poi.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/assets/default-poi.jpg";
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{poi.name}</h5>
                  <p className="card-text flex-grow-1">
                    {poi.description || "No description available."}
                  </p>

                  {/* Guide Count */}
                  <div className="mb-3">
                    <span className="badge bg-info text-dark">
                      <i className="fas fa-user-check me-1"></i>
                      {guideCounts[poi.id] || 0} Guides Available
                    </span>
                  </div>

                  {poi.address && (
                    <p className="text-muted small">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {poi.address}
                    </p>
                  )}

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleViewGuides(poi)}
                      disabled={
                        !guideCounts[poi.id] || guideCounts[poi.id] === 0
                      }
                    >
                      <i className="fas fa-users me-2"></i>
                      View Guides
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleBookGuide(poi)}
                    >
                      <i className="fas fa-calendar-check me-2"></i>
                      Book a Guide
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POIs;
