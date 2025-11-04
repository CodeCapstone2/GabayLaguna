import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";

const CategoryList = () => {
  const { city } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/categories`);
      
      // Handle different response formats
      let categoriesData = [];
      if (response.data.categories) {
        categoriesData = Array.isArray(response.data.categories) 
          ? response.data.categories 
          : [];
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else {
        categoriesData = [];
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    const categorySlug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    navigate(`/spots/${city}/${categorySlug}`);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <section className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          🏷️ Categories in{" "}
          {city
            ? city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ")
            : "City"}
        </h2>
        <button onClick={goBack} className="btn btn-outline-secondary">
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="row g-4">
          {Array(6)
            .fill()
            .map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4">
                <div className="card h-100 placeholder-glow shadow-sm">
                  <div
                    className="card-img-top placeholder"
                    style={{ height: "200px" }}
                  ></div>
                  <div className="card-body">
                    <h5 className="card-title placeholder col-8"></h5>
                    <p className="card-text placeholder col-10"></p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="row g-4">
          {categories.map((category) => (
            <div key={category.id || category.name} className="col-12 col-sm-6 col-md-4">
              <div
                className="card h-100 shadow-sm border-0 hover-shadow cursor-pointer transition"
                onClick={() => handleCategoryClick(category)}
                style={{ 
                  cursor: "pointer",
                  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                }}
              >
                <img
                  src={category.image}
                  className="card-img-top"
                  alt={category.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/assets/default-category.jpg";
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-success fw-bold">{category.name}</h5>
                  <p className="card-text text-muted flex-grow-1">{category.description}</p>
                  <div className="mt-auto">
                    <span className="badge bg-success text-white">
                      <i className="fas fa-tag me-1"></i>
                      Explore {category.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryList;
