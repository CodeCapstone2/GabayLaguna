import React, { useState, useEffect } from "react";
import API_CONFIG from "../config/api";
import { useNavigate } from "react-router-dom";
import { getImageUrl, handleImageError } from "../utils/imageUtils";
import "bootstrap/dist/css/bootstrap.min.css";

const CitiesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [pois, setPois] = useState([]);

  useEffect(() => {
    fetchCities();
    fetchPois();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/cities`);
      const data = await response.json();

      console.log("Cities API Response:", data); // Debug log

      let citiesData = [];

      if (Array.isArray(data)) {
        citiesData = data;
      } else if (data.cities) {
        citiesData = Array.isArray(data.cities)
          ? data.cities
          : data.cities.data || [];
      } else if (data.data) {
        citiesData = Array.isArray(data.data) ? data.data : [];
      } else {
        citiesData = Object.values(data).find(Array.isArray) || [];
      }

      setCities(citiesData);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  // Fallback POI data for when API fails - matches actual database cities
  const getFallbackPOIs = () => {
    return [
      {
        id: 1,
        name: "Pagsanjan Falls",
        city_id: 1,
        description: "One of the most famous waterfalls in the Philippines, featuring thrilling boat rides through narrow gorges.",
        image: "/assets/spots/pagsanjan-falls.jpg",
        address: "Pagsanjan, Laguna",
        category: "Waterfalls/Adventure"
      },
      {
        id: 2,
        name: "Pagsanjan Arch",
        city_id: 1,
        description: "A historical arch that serves as the gateway to Pagsanjan town.",
        image: "/assets/spots/pagsanjan-arch.jpg",
        address: "Pagsanjan, Laguna",
        category: "Historical"
      },
      {
        id: 3,
        name: "Enchanted Kingdom",
        city_id: 2,
        description: "A popular theme park with thrilling rides and family attractions.",
        image: "/assets/spots/enchanted-kingdom.jpg",
        address: "Sta. Rosa, Laguna",
        category: "Theme Parks"
      },
      {
        id: 4,
        name: "Sta. Rosa City Hall",
        city_id: 2,
        description: "The modern city hall building showcasing contemporary architecture.",
        image: "/assets/spots/sta-rosa-cityhall.jpg",
        address: "Sta. Rosa, Laguna",
        category: "Historical"
      },
      {
        id: 5,
        name: "Lake Caliraya",
        city_id: 3,
        description: "A beautiful man-made lake perfect for water sports and relaxation.",
        image: "/assets/spots/lake-caliraya.jpg",
        address: "Lumban, Laguna",
        category: "Natural"
      },
      {
        id: 6,
        name: "Lumban Church",
        city_id: 3,
        description: "A historical church known for its beautiful architecture.",
        image: "/assets/spots/lumban-church.jpg",
        address: "Lumban, Laguna",
        category: "Historical"
      },
      {
        id: 7,
        name: "Nagcarlan Underground Cemetery",
        city_id: 4,
        description: "A unique underground cemetery with historical significance.",
        image: "/assets/spots/nagcarlan-cemetery.jpg",
        address: "Nagcarlan, Laguna",
        category: "Historical"
      },
      {
        id: 8,
        name: "Nagcarlan Falls",
        city_id: 4,
        description: "Beautiful waterfalls perfect for nature lovers and adventure seekers.",
        image: "/assets/spots/nagcarlan-falls.jpg",
        address: "Nagcarlan, Laguna",
        category: "Waterfalls/Adventure"
      },
      {
        id: 9,
        name: "Rizal Shrine",
        city_id: 5,
        description: "The birthplace of Dr. Jose Rizal, the Philippine national hero.",
        image: "/assets/spots/rizal-shrine.jpg",
        address: "Calamba, Laguna",
        category: "Historical"
      },
      {
        id: 10,
        name: "Calamba Church",
        city_id: 5,
        description: "St. John the Baptist Parish Church where Rizal was baptized.",
        image: "/assets/spots/calamba-church.jpg",
        address: "Calamba, Laguna",
        category: "Historical"
      },
      {
        id: 11,
        name: "Mount Makiling",
        city_id: 5,
        description: "A dormant volcano known for its rich biodiversity and hiking trails.",
        image: "/assets/spots/mount-makiling.jpg",
        address: "Calamba, Laguna",
        category: "Natural"
      },
      {
        id: 12,
        name: "Pila Heritage Town",
        city_id: 6,
        description: "A well-preserved Spanish colonial town with historical architecture.",
        image: "/assets/spots/pila-heritage.jpg",
        address: "Pila, Laguna",
        category: "Historical"
      },
      {
        id: 13,
        name: "UP Los Baños",
        city_id: 7,
        description: "The University of the Philippines Los Baños campus with beautiful grounds.",
        image: "/assets/spots/up-losbanos.jpg",
        address: "Los Baños, Laguna",
        category: "Educational"
      },
      {
        id: 14,
        name: "Los Baños Hot Springs",
        city_id: 7,
        description: "Natural hot springs perfect for relaxation and wellness.",
        image: "/assets/spots/losbanos-hotsprings.jpg",
        address: "Los Baños, Laguna",
        category: "Wellness"
      },
      {
        id: 15,
        name: "Seven Lakes of San Pablo",
        city_id: 8,
        description: "Seven crater lakes formed by volcanic activity, perfect for nature lovers.",
        image: "/assets/spots/seven-lakes.jpg",
        address: "San Pablo City, Laguna",
        category: "Natural"
      },
      {
        id: 16,
        name: "San Pablo Cathedral",
        city_id: 8,
        description: "The main cathedral of San Pablo City, known as the City of Seven Lakes.",
        image: "/assets/spots/sanpablo-cathedral.jpg",
        address: "San Pablo City, Laguna",
        category: "Historical"
      },
      {
        id: 17,
        name: "Liliw Church",
        city_id: 9,
        description: "A beautiful church known for its cool climate and footwear industry.",
        image: "/assets/spots/liliw-church.jpg",
        address: "Liliw, Laguna",
        category: "Historical"
      },
      {
        id: 18,
        name: "Paete Woodcarving Shops",
        city_id: 10,
        description: "The woodcarving capital of the Philippines with skilled artisans.",
        image: "/assets/spots/paete-woodcarving.jpg",
        address: "Paete, Laguna",
        category: "Cultural"
      },
      {
        id: 19,
        name: "Majayjay Church",
        city_id: 11,
        description: "A historical church in a mountainous town with cool climate.",
        image: "/assets/spots/majayjay-church.jpg",
        address: "Majayjay, Laguna",
        category: "Historical"
      },
      {
        id: 20,
        name: "Majayjay Falls",
        city_id: 11,
        description: "Beautiful waterfalls in a mountainous setting.",
        image: "/assets/spots/majayjay-falls.jpg",
        address: "Majayjay, Laguna",
        category: "Waterfalls/Adventure"
      },
      {
        id: 21,
        name: "Pangil River",
        city_id: 12,
        description: "Perfect for river adventures and water activities.",
        image: "/assets/spots/pangil-river.jpg",
        address: "Pangil, Laguna",
        category: "Waterfalls/Adventure"
      },
      {
        id: 22,
        name: "Luisiana Scenic Views",
        city_id: 13,
        description: "Mountainous town with scenic views and peaceful environment.",
        image: "/assets/spots/luisiana-views.jpg",
        address: "Luisiana, Laguna",
        category: "Natural"
      },
      {
        id: 23,
        name: "Calauan Nature Park",
        city_id: 14,
        description: "Agricultural lands and nature parks near Laguna de Bay.",
        image: "/assets/spots/calauan-park.jpg",
        address: "Calauan, Laguna",
        category: "Natural"
      }
    ];
  };

  const fetchPois = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/pois`);
      const data = await response.json();

      // Handle different response formats
      let poisData = [];
      if (data.points_of_interest) {
        poisData = data.points_of_interest.data || data.points_of_interest;
      } else if (data.data) {
        poisData = data.data;
      } else {
        poisData = data;
      }

      setPois(poisData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching POIs:", error);
      setPois([]);
      setLoading(false);
    }
  };

  const getPoisForCity = (cityId) => {
    return pois.filter((poi) => poi.city_id === cityId).slice(0, 3); // Show max 3 POIs per city
  };

  const getPoiImage = (poi) => {
    // Use actual image from API if available, otherwise fallback
    return poi.images && poi.images.length > 0
      ? poi.images[0]
      : "/assets/default-poi.jpg";
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCityClick = (city) => {
    navigate(`/city/${city.id}/pois`, { state: { city } });
  };

  const handlePoiClick = (poi, e) => {
    e.stopPropagation(); // Prevent city card click
    navigate(`/poi/${poi.id}`, { state: { poi } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <section className="py-5 bg-light min-vh-100" data-bs-theme="light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-outline-secondary" onClick={handleBack}>
            ← Back
          </button>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Laguna Cities
              </li>
            </ol>
          </nav>
        </div>

        <h1
          className="text-center fw-bold mb-5"
          style={{ color: "var(--color-primary)" }}
        >
          Explore Cities in Laguna
        </h1>

        <div className="mb-5 text-center">
          <input
            type="text"
            placeholder="🔍 Search city name..."
            className="form-control w-75 mx-auto shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row g-4">
          {loading ? (
            Array(6)
              .fill()
              .map((_, i) => (
                <div key={i} className="col-sm-12 col-md-6 col-lg-4">
                  <div className="card h-100 placeholder-glow shadow-sm">
                    <div
                      className="card-img-top placeholder"
                      style={{ height: "220px" }}
                    ></div>
                    <div className="card-body">
                      <h5 className="card-title placeholder col-6"></h5>
                      <p className="card-text placeholder col-8"></p>
                      <div className="mb-2">
                        <span className="placeholder col-4 me-2"></span>
                        <span className="placeholder col-3"></span>
                      </div>
                      <button className="btn btn-outline-secondary disabled placeholder col-5"></button>
                    </div>
                  </div>
                </div>
              ))
          ) : filteredCities.length > 0 ? (
            filteredCities.map((city) => {
              const cityPois = getPoisForCity(city.id);
              return (
                <div key={city.id} className="col-sm-12 col-md-6 col-lg-4">
                  <div
                    className="card h-100 shadow-sm border-0 transition"
                    role="button"
                    onClick={() => handleCityClick(city)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={getImageUrl(city.name, 'city', city.image)}
                      className="card-img-top rounded-top"
                      alt={`Image of ${city.name}`}
                      loading="lazy"
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => handleImageError(e, 'city')}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fw-semibold text-success">
                        {city.name}
                      </h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {city.description ||
                          "Explore beautiful destinations and attractions"}
                      </p>

                      {/* POIs Section */}
                      {cityPois.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">
                            🏛️ Popular Attractions:
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {cityPois.map((poi) => (
                              <div key={poi.id} className="d-flex flex-column align-items-start">
                                <span
                                  className="badge bg-light text-dark border"
                                  style={{
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                  }}
                                  onClick={(e) => handlePoiClick(poi, e)}
                                  title={poi.description}
                                >
                                  {poi.name}
                                </span>
                                {poi.category && (
                                  <span className={`badge ${
                                    (poi.category.name || poi.category) === 'Historical' ? 'bg-warning text-dark' :
                                    (poi.category.name || poi.category) === 'Natural' ? 'bg-success' :
                                    (poi.category.name || poi.category) === 'Waterfalls/Adventure' ? 'bg-primary' :
                                    (poi.category.name || poi.category) === 'Theme Parks' ? 'bg-info text-dark' :
                                    (poi.category.name || poi.category) === 'Educational' ? 'bg-secondary' :
                                    (poi.category.name || poi.category) === 'Wellness' ? 'bg-light text-dark' :
                                    (poi.category.name || poi.category) === 'Cultural' ? 'bg-dark' :
                                    'bg-secondary'
                                  }`} style={{ fontSize: "0.7rem", marginTop: "2px" }}>
                                    {poi.category.name || poi.category}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button className="btn btn-outline-success mt-auto align-self-start">
                        Discover {city.name}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center text-muted">
              <p>
                No cities found matching "<strong>{searchTerm}</strong>"
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CitiesList;
