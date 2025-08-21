import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Historical",
    image: "/assets/categories/historical.jpg",
    description: "Discover historical landmarks and heritage sites.",
  },
  {
    name: "Natural",
    image: "/assets/categories/natural.jpg",
    description: "Explore natural wonders like waterfalls and lakes.",
  },
  {
    name: "Food & Dining",
    image: "/assets/categories/food.jpg",
    description: "Taste the local delicacies and cuisine.",
  },
  {
    name: "Parks",
    image: "/assets/categories/parks.jpg",
    description: "Relax in recreational parks and public spaces.",
  },
  {
    name: "Shopping",
    image: "/assets/categories/shopping.jpg",
    description: "Shop local crafts, souvenirs, and essentials.",
  },
];

const CategoryList = () => {
  const { city } = useParams();
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/spots/${city}/${category.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <section className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          🏙️ Categories in{" "}
          {city
            ? city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ")
            : "City"}
        </h2>
        <button onClick={goBack} className="btn btn-outline-secondary">
          ← Back
        </button>
      </div>

      <div className="row g-4">
        {categories.map((category) => (
          <div key={category.name} className="col-12 col-sm-6 col-md-4">
            <div
              className="card h-100 shadow-sm border-0 hover-shadow cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={category.image}
                className="card-img-top"
                alt={category.name}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{category.name}</h5>
                <p className="card-text text-muted">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryList;
