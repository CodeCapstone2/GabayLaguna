import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CitiesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [pois, setPois] = useState([]);

  useEffect(() => {
    fetchCities();
    fetchPois();
  }, []);

const fetchCities = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/cities');
    const data = await response.json();
    
    console.log('Cities API Response:', data); // Debug log
    
    let citiesData = [];
    
    if (Array.isArray(data)) {
      citiesData = data;
    } else if (data.cities) {
      citiesData = Array.isArray(data.cities) ? data.cities : (data.cities.data || []);
    } else if (data.data) {
      citiesData = Array.isArray(data.data) ? data.data : [];
    } else {
      citiesData = Object.values(data).find(Array.isArray) || [];
    }
    
    setCities(citiesData);
  } catch (error) {
    console.error('Error fetching cities:', error);
      // Fallback to sample data if API fails
      setCities([
        {
          id: 1,
          name: 'San Pedro',
          image: '/assets/SanPedroCity.jpg',
          description: 'Known as the Sampaguita Capital of the Philippines',
        },
        {
          id: 2,
          name: 'Biñan',
          image: '/assets/BinanCity.jpg',
          description: 'The largest city in Laguna',
        },
        {
          id: 3,
          name: 'Santa Rosa',
          image: '/assets/StaRosaCity.jpg',
          description: 'Known for residential and commercial development',
        },
        {
          id: 4,
          name: 'Cabuyao',
          image: '/assets/CabuyaoCity.jpg',
          description: 'Enterprise City of the Philippines',
        },
        {
          id: 5,
          name: 'Calamba',
          image: '/assets/CalambaCity.jpg',
          description: 'Spring Resort Capital of the Philippines',
        },
        {
          id: 6,
          name: 'San Pablo',
          image: '/assets/SanPabloCity.svg.png',
          description: 'City of Seven Lakes',
        },
      ]);
    }
  };

  const fetchPois = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pois');
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
      console.error('Error fetching POIs:', error);
      setLoading(false);
    }
  };

  const getPoisForCity = (cityId) => {
    return pois.filter(poi => poi.city_id === cityId).slice(0, 3); // Show max 3 POIs per city
  };

  const getPoiImage = (poi) => {
    // Use actual image from API if available, otherwise fallback
    return poi.images && poi.images.length > 0 
      ? poi.images[0] 
      : '/assets/default-poi.jpg';
  };

  const filteredCities = cities.filter(city =>
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
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">Laguna Cities</li>
            </ol>
          </nav>
        </div>

        <h2 className="text-center fw-bold mb-4 display-5 text-success">
          🗺️ Explore Cities in Laguna
        </h2>

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
            Array(6).fill().map((_, i) => (
              <div key={i} className="col-sm-12 col-md-6 col-lg-4">
                <div className="card h-100 placeholder-glow shadow-sm">
                  <div className="card-img-top placeholder" style={{ height: '220px' }}></div>
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
          ) : (
            filteredCities.length > 0 ? (
              filteredCities.map((city) => {
                const cityPois = getPoisForCity(city.id);
                return (
                  <div key={city.id} className="col-sm-12 col-md-6 col-lg-4">
                    <div
                      className="card h-100 shadow-sm border-0 transition"
                      role="button"
                      onClick={() => handleCityClick(city)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={city.image || '/assets/default-city.jpg'}
                        className="card-img-top rounded-top"
                        alt={`Image of ${city.name}`}
                        loading="lazy"
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/assets/default-city.jpg';
                        }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title fw-semibold text-success">{city.name}</h5>
                        <p className="card-text text-muted small flex-grow-1">
                          {city.description || 'Explore beautiful destinations and attractions'}
                        </p>
                        
                        {/* POIs Section */}
                        {cityPois.length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-muted mb-2">🏛️ Popular Attractions:</h6>
                            <div className="d-flex flex-wrap gap-2">
                              {cityPois.map(poi => (
                                <span
                                  key={poi.id}
                                  className="badge bg-light text-dark border"
                                  style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                  onClick={(e) => handlePoiClick(poi, e)}
                                  title={poi.description}
                                >
                                  {poi.name}
                                </span>
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
                <p>No cities found matching "<strong>{searchTerm}</strong>"</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default CitiesList;