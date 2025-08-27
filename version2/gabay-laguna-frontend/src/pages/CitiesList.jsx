import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const cities = [
  {
    name: 'San Pedro',
    image: '/assets/SanPedroCity.jpg',
    description: 'Known as the Sampaguita Capital of the Philippines, it is the first city encountered when traveling to Laguna from Manila.',
  },
  {
    name: 'Biñan',
    image: '/assets/BinanCity.jpg',
    description: 'The largest city in Laguna, known for its industrial and recreational places, including Splash Island.',
  },
  {
    name: 'Santa Rosa',
    image: '/assets/StaRosaCity.jpg',
    description: 'A city known for its residential and commercial development, often considered a suburban community of Metro Manila.',
  },
  {
    name: 'Cabuyao',
    image: '/assets/CabuyaoCity.jpg',
    description: 'An urbanized city known as the Enterprise City of the Philippines, named after the Citrus macroptera tree.',
  },
  {
    name: 'Calamba',
    image: '/assets/CalambaCity.jpg',
    description: 'Known as the "Spring Resort Capital of the Philippines" due to its many hot spring resorts.',
  },
  {
    name: 'San Pablo',
    image: '/assets/SanPabloCity.svg.png',
    description: 'Known as the "City of Seven Lakes," it features beautiful natural attractions.',
  },
];

const CitiesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCityClick = (city) => {
    navigate(`/categories/${city.toLowerCase().replace(/\s+/g, '-')}`);
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
                    <p className="card-text placeholder col-10"></p>
                    <button className="btn btn-outline-secondary disabled placeholder col-5"></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div key={city.name} className="col-sm-12 col-md-6 col-lg-4">
                  <div
                    className="card h-100 shadow-sm border-0 transition"
                    role="button"
                    onClick={() => handleCityClick(city.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={city.image}
                      className="card-img-top rounded-top"
                      alt={`Image of ${city.name}`}
                      loading="lazy"
                      style={{ height: '220px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fw-semibold text-success">{city.name}</h5>
                      <p className="card-text text-muted small flex-grow-1">{city.description}</p>
                      <button className="btn btn-outline-success mt-3 align-self-start">
                        Discover {city.name}
                      </button>
                    </div>
                  </div>
                </div>
              ))
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
