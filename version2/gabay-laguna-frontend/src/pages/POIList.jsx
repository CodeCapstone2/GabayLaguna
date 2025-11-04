import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_CONFIG from "../config/api";
import { getImageUrl } from "../utils/imageUtils";

const POIList = () => {
  const { city, category } = useParams();
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPOIs();
  }, [city, category]);

  const loadPOIs = async () => {
    try {
      setLoading(true);
      setError("");
      
      // First, get all POIs for the city
      const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/pois`);
      const data = await response.json();
      
      let poisData = [];
      if (data.points_of_interest) {
        poisData = Array.isArray(data.points_of_interest) 
          ? data.points_of_interest 
          : data.points_of_interest.data || [];
      } else if (Array.isArray(data)) {
        poisData = data;
      } else {
        poisData = data.data || [];
      }

      // Filter by city
      const cityFiltered = poisData.filter(poi => {
        const poiCityName = poi.city?.name || "";
        return poiCityName.toLowerCase() === cityName.toLowerCase();
      });

      // Filter by category if provided
      const categoryName = category 
        ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")
        : null;
      
      const categoryFiltered = categoryName 
        ? cityFiltered.filter(poi => {
            const poiCategoryName = poi.category?.name || "";
            return poiCategoryName.toLowerCase().includes(categoryName.toLowerCase());
          })
        : cityFiltered;

      setSpots(categoryFiltered);
    } catch (err) {
      console.error("Error loading POIs:", err);
      setError("Failed to load points of interest");
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="mb-4">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          ← Back
        </button>
      </div>

      <h2 className="text-center mb-5">
        📍{" "}
        {category
          ? category.charAt(0).toUpperCase() +
            category.slice(1).replace(/-/g, " ")
          : "Category"}{" "}
        Spots in{" "}
        {city
          ? city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ")
          : "City"}
      </h2>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!error && spots.length > 0 ? (
        <div className="row">
          {spots.map((spot, index) => (
            <div className="col-12 mb-5" key={spot.id || index}>
              <div className="card shadow border-0">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src={getImageUrl(spot.name, "poi")}
                      className="img-fluid rounded-start h-100"
                      alt={spot.name}
                      style={{ objectFit: "cover", height: "100%" }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h3 className="card-title">{spot.name}</h3>
                      <p className="text-muted">{spot.description}</p>

                      {spot.address && (
                        <p className="text-muted small">
                          📍 {spot.address}
                        </p>
                      )}

                      <hr />
                      
                      <div className="text-end">
                        <Link
                          to={`/poi/${spot.id}`}
                          className="btn btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !error ? (
        <div className="alert alert-warning text-center">
          No spots found for this category.
        </div>
      ) : null}
    </div>
  );
};

export default POIList;
