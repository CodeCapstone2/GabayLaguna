import React, { useState, useEffect } from "react";
import API_CONFIG from "../config/api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getImageUrl, handleImageError } from "../utils/imageUtils";

const POIs = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pois, setPois] = useState([]);
  const [filteredPois, setFilteredPois] = useState([]);
  const [city, setCity] = useState(location.state?.city || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guideCounts, setGuideCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    fetchCityPOIs();
    if (!location.state?.city) {
      fetchCityData();
    }
  }, [cityId]);

  useEffect(() => {
    if (pois.length > 0) {
      fetchGuideCounts();
      extractCategories();
    }
  }, [pois]);

  useEffect(() => {
    filterPoisByCategory();
  }, [selectedCategory, pois]);

  const extractCategories = () => {
    const categories = [...new Set(pois.map(poi => poi.category?.name || poi.category).filter(Boolean))];
    setAvailableCategories(categories);
  };

  const filterPoisByCategory = () => {
    if (!selectedCategory) {
      setFilteredPois(pois);
    } else {
      const filtered = pois.filter(poi => (poi.category?.name || poi.category) === selectedCategory);
      setFilteredPois(filtered);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Fallback POI data for when API fails - matches actual database cities
  const getFallbackPOIs = (cityId) => {
    const fallbackData = {
      1: [ // Pagsanjan
        {
          id: 1,
          name: "Pagsanjan Falls",
          description: "One of the most famous waterfalls in the Philippines, featuring thrilling boat rides through narrow gorges.",
          image: "/assets/spots/pagsanjan-falls.jpg",
          address: "Pagsanjan, Laguna",
          category: "Waterfalls/Adventure",
          latitude: 14.273889,
          longitude: 121.452222
        },
        {
          id: 2,
          name: "Pagsanjan Arch",
          description: "A historical arch that serves as the gateway to Pagsanjan town.",
          image: "/assets/spots/pagsanjan-arch.jpg",
          address: "Pagsanjan, Laguna",
          category: "Historical",
          latitude: 14.273889,
          longitude: 121.452222
        }
      ],
      2: [ // Sta. Rosa
        {
          id: 3,
          name: "Enchanted Kingdom",
          description: "A popular theme park with thrilling rides and family attractions.",
          image: "/assets/spots/enchanted-kingdom.jpg",
          address: "Sta. Rosa, Laguna",
          category: "Theme Parks",
          latitude: 14.327778,
          longitude: 121.079722
        },
        {
          id: 4,
          name: "Sta. Rosa City Hall",
          description: "The modern city hall building showcasing contemporary architecture.",
          image: "/assets/spots/sta-rosa-cityhall.jpg",
          address: "Sta. Rosa, Laguna",
          category: "Historical",
          latitude: 14.327778,
          longitude: 121.079722
        }
      ],
      3: [ // Lumban
        {
          id: 5,
          name: "Lake Caliraya",
          description: "A beautiful man-made lake perfect for water sports and relaxation.",
          image: "/assets/spots/lake-caliraya.jpg",
          address: "Lumban, Laguna",
          category: "Natural",
          latitude: 14.316667,
          longitude: 121.533333
        },
        {
          id: 6,
          name: "Lumban Church",
          description: "A historical church known for its beautiful architecture.",
          image: "/assets/spots/lumban-church.jpg",
          address: "Lumban, Laguna",
          category: "Historical",
          latitude: 14.316667,
          longitude: 121.533333
        }
      ],
      4: [ // Nagcarlan
        {
          id: 7,
          name: "Nagcarlan Underground Cemetery",
          description: "A unique underground cemetery with historical significance.",
          image: "/assets/spots/nagcarlan-cemetery.jpg",
          address: "Nagcarlan, Laguna",
          category: "Historical",
          latitude: 14.136111,
          longitude: 121.416389
        },
        {
          id: 8,
          name: "Nagcarlan Falls",
          description: "Beautiful waterfalls perfect for nature lovers and adventure seekers.",
          image: "/assets/spots/nagcarlan-falls.jpg",
          address: "Nagcarlan, Laguna",
          category: "Waterfalls/Adventure",
          latitude: 14.136111,
          longitude: 121.416389
        }
      ],
      5: [ // Calamba
        {
          id: 9,
          name: "Rizal Shrine",
          description: "The birthplace of Dr. Jose Rizal, the Philippine national hero.",
          image: "/assets/spots/rizal-shrine.jpg",
          address: "Calamba, Laguna",
          category: "Historical",
          latitude: 14.183333,
          longitude: 121.166667
        },
        {
          id: 10,
          name: "Calamba Church",
          description: "St. John the Baptist Parish Church where Rizal was baptized.",
          image: "/assets/spots/calamba-church.jpg",
          address: "Calamba, Laguna",
          category: "Historical",
          latitude: 14.183333,
          longitude: 121.166667
        },
        {
          id: 11,
          name: "Mount Makiling",
          description: "A dormant volcano known for its rich biodiversity and hiking trails.",
          image: "/assets/spots/mount-makiling.jpg",
          address: "Calamba, Laguna",
          category: "Natural",
          latitude: 14.183333,
          longitude: 121.166667
        }
      ],
      6: [ // Pila
        {
          id: 12,
          name: "Pila Heritage Town",
          description: "A well-preserved Spanish colonial town with historical architecture.",
          image: "/assets/spots/pila-heritage.jpg",
          address: "Pila, Laguna",
          category: "Historical",
          latitude: 14.233333,
          longitude: 121.366667
        }
      ],
      7: [ // Los Baños
        {
          id: 13,
          name: "UP Los Baños",
          description: "The University of the Philippines Los Baños campus with beautiful grounds.",
          image: "/assets/spots/up-losbanos.jpg",
          address: "Los Baños, Laguna",
          category: "Educational",
          latitude: 14.166667,
          longitude: 121.233333
        },
        {
          id: 14,
          name: "Los Baños Hot Springs",
          description: "Natural hot springs perfect for relaxation and wellness.",
          image: "/assets/spots/losbanos-hotsprings.jpg",
          address: "Los Baños, Laguna",
          category: "Wellness",
          latitude: 14.166667,
          longitude: 121.233333
        }
      ],
      8: [ // San Pablo City
        {
          id: 15,
          name: "Seven Lakes of San Pablo",
          description: "Seven crater lakes formed by volcanic activity, perfect for nature lovers.",
          image: "/assets/spots/seven-lakes.jpg",
          address: "San Pablo City, Laguna",
          category: "Natural",
          latitude: 14.066667,
          longitude: 121.333333
        },
        {
          id: 16,
          name: "San Pablo Cathedral",
          description: "The main cathedral of San Pablo City, known as the City of Seven Lakes.",
          image: "/assets/spots/sanpablo-cathedral.jpg",
          address: "San Pablo City, Laguna",
          category: "Historical",
          latitude: 14.066667,
          longitude: 121.333333
        }
      ],
      9: [ // Liliw
        {
          id: 17,
          name: "Liliw Church",
          description: "A beautiful church known for its cool climate and footwear industry.",
          image: "/assets/spots/liliw-church.jpg",
          address: "Liliw, Laguna",
          category: "Historical",
          latitude: 14.133333,
          longitude: 121.433333
        }
      ],
      10: [ // Paete
        {
          id: 18,
          name: "Paete Woodcarving Shops",
          description: "The woodcarving capital of the Philippines with skilled artisans.",
          image: "/assets/spots/paete-woodcarving.jpg",
          address: "Paete, Laguna",
          category: "Cultural",
          latitude: 14.366667,
          longitude: 121.483333
        }
      ],
      11: [ // Majayjay
        {
          id: 19,
          name: "Majayjay Church",
          description: "A historical church in a mountainous town with cool climate.",
          image: "/assets/spots/majayjay-church.jpg",
          address: "Majayjay, Laguna",
          category: "Historical",
          latitude: 14.150000,
          longitude: 121.466667
        },
        {
          id: 20,
          name: "Majayjay Falls",
          description: "Beautiful waterfalls in a mountainous setting.",
          image: "/assets/spots/majayjay-falls.jpg",
          address: "Majayjay, Laguna",
          category: "Waterfalls/Adventure",
          latitude: 14.150000,
          longitude: 121.466667
        }
      ],
      12: [ // Pangil
        {
          id: 21,
          name: "Pangil River",
          description: "Perfect for river adventures and water activities.",
          image: "/assets/spots/pangil-river.jpg",
          address: "Pangil, Laguna",
          category: "Waterfalls/Adventure",
          latitude: 14.400000,
          longitude: 121.466667
        }
      ],
      13: [ // Luisiana
        {
          id: 22,
          name: "Luisiana Scenic Views",
          description: "Mountainous town with scenic views and peaceful environment.",
          image: "/assets/spots/luisiana-views.jpg",
          address: "Luisiana, Laguna",
          category: "Natural",
          latitude: 14.183333,
          longitude: 121.516667
        }
      ],
      14: [ // Calauan
        {
          id: 23,
          name: "Calauan Nature Park",
          description: "Agricultural lands and nature parks near Laguna de Bay.",
          image: "/assets/spots/calauan-park.jpg",
          address: "Calauan, Laguna",
          category: "Natural",
          latitude: 14.150000,
          longitude: 121.316667
        }
      ]
    };
    
    return fallbackData[cityId] || [];
  };

  const fetchCityPOIs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}/pois`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response formats
      let poisData = [];

      if (Array.isArray(data)) {
        poisData = data;
      } else if (data.points_of_interest) {
        poisData = Array.isArray(data.points_of_interest)
          ? data.points_of_interest
          : [];
      } else if (data.pois) {
        poisData = Array.isArray(data.pois) ? data.pois : [];
      } else if (data.data) {
        poisData = Array.isArray(data.data) ? data.data : [];
      } else {
        poisData = Object.values(data).find(Array.isArray) || [];
      }

      setPois(poisData);
    } catch (error) {
      console.error("Error fetching city POIs:", error);
      setPois([]);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError("Unable to connect to the server. Please check your internet connection and try again.");
      } else if (error.message.includes('404')) {
        setError("No points of interest found for this city.");
      } else if (error.message.includes('500')) {
        setError("Server error. Please try again later.");
      } else {
        setError("Unable to load points of interest. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideCounts = async () => {
    const counts = {};

    try {
      // First try to get guides by city
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}/guides`
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
        `${API_CONFIG.BASE_URL}/api/cities/${cityId}`
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

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="fw-bold text-muted me-3">Filter by Category:</span>
            <button
              className={`btn btn-sm ${selectedCategory === "" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => handleCategoryChange("")}
              style={{ borderRadius: "20px" }}
            >
              All Categories
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                className={`btn btn-sm ${selectedCategory === category ? "btn-success" : "btn-outline-success"}`}
                onClick={() => handleCategoryChange(category)}
                style={{ borderRadius: "20px" }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredPois.length === 0 ? (
        <div className="text-center py-5">
          <div className="alert alert-info">
            <h5>No points of interest found</h5>
            <p>
              {selectedCategory 
                ? `No ${selectedCategory} attractions found in this city.` 
                : "There are no points of interest available for this city yet."
              }
            </p>
            {selectedCategory && (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleCategoryChange("")}
              >
                Show All Categories
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredPois.map((poi) => (
            <div key={poi.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={getImageUrl(poi.name, 'poi', poi.image || poi.images?.[0])}
                  className="card-img-top"
                  alt={poi.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => handleImageError(e, 'poi')}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{poi.name}</h5>
                  
                  {/* Category Badge */}
                  {poi.category && (
                    <div className="mb-2">
                      <span className={`badge ${
                        (poi.category.name || poi.category) === 'Historical' ? 'bg-warning text-dark' :
                        (poi.category.name || poi.category) === 'Natural' ? 'bg-success' :
                        (poi.category.name || poi.category) === 'Waterfalls/Adventure' ? 'bg-primary' :
                        (poi.category.name || poi.category) === 'Theme Parks' ? 'bg-info text-dark' :
                        (poi.category.name || poi.category) === 'Educational' ? 'bg-secondary' :
                        (poi.category.name || poi.category) === 'Wellness' ? 'bg-light text-dark' :
                        (poi.category.name || poi.category) === 'Cultural' ? 'bg-dark' :
                        'bg-secondary'
                      }`}>
                        <i className={`fas ${
                          (poi.category.name || poi.category) === 'Historical' ? 'fa-landmark' :
                          (poi.category.name || poi.category) === 'Natural' ? 'fa-leaf' :
                          (poi.category.name || poi.category) === 'Waterfalls/Adventure' ? 'fa-water' :
                          (poi.category.name || poi.category) === 'Theme Parks' ? 'fa-theater-masks' :
                          (poi.category.name || poi.category) === 'Educational' ? 'fa-graduation-cap' :
                          (poi.category.name || poi.category) === 'Wellness' ? 'fa-spa' :
                          (poi.category.name || poi.category) === 'Cultural' ? 'fa-palette' :
                          'fa-tag'
                        } me-1`}></i>
                        {poi.category.name || poi.category}
                      </span>
                    </div>
                  )}
                  
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
