import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const customPOIData = {
  calamba: {
    historical: [
      {
        name: "Rizal Shrine",
        image: "/assets/spots/rizalshrine.jpg",
        description:
          "A beautifully preserved Spanish-era house where Dr. Jose Rizal, the Philippine national hero, was born and raised. The museum displays his memorabilia, family artifacts, and insights into his early life and legacy.",
        guides: [],
      },
      {
        name: "St. John the Baptist Parish Church",
        image: "/assets/spots/calambachurch.jpg",
        description:
          "One of the oldest churches in Laguna, where Jose Rizal was baptized. The church showcases Spanish colonial architecture and holds deep historical and religious significance for the city.",
        guides: [],
      },
      {
        name: "Calamba Jar and the Banga",
        image: "/assets/spots/bangacalamba.jpg",
        description:
          'The Calamba Jar, or "Banga," is a giant clay pot symbolizing the city\'s name and heritage. Located at the city plaza, it features the names of Calamba\'s barangays and is a popular cultural landmark and photo spot.',
        guides: [],
      },
    ],
    natural: [
      {
        name: "Mount Makiling",
        image: "/assets/spots/rizalshrine.jpg",
        description: "A dormant volcano known for its rich biodiversity.",
        guides: [],
      },
      {
        name: "Calamba Springs",
        image: "/assets/spots/calambachurch.jpg",
        description: "Natural hot springs perfect for relaxation.",
        guides: [],
      },
      {
        name: "Lake Caliraya",
        image: "/assets/spots/bangacalamba.jpg",
        description: "A scenic lake ideal for water sports and picnics.",
        guides: [],
      },
    ],
  },
  biñan: {
    historical: [
      {
        name: "Biñan Church",
        image: "/assets/spots/calambachurch.jpg",
        description: "A historical church known for its beautiful facade.",
        guides: [],
      },
      {
        name: "Biñan Plaza",
        image: "/assets/spots/rizalshrine.jpg",
        description: "A public plaza with historical significance.",
        guides: [],
      },
      {
        name: "Old Biñan Municipal Hall",
        image: "/assets/spots/bangacalamba.jpg",
        description: "A heritage site that reflects the town's history.",
        guides: [],
      },
    ],
    natural: [
      {
        name: "Biñan River",
        image: "/assets/spots/calambachurch.jpg",
        description: "A serene river perfect for kayaking and fishing.",
        guides: [],
      },
      {
        name: "Laguna de Bay",
        image: "/assets/spots/rizalshrine.jpg",
        description: "The largest lake in the Philippines, great for boating.",
        guides: [],
      },
      {
        name: "Biñan Eco-Park",
        image: "/assets/spots/bangacalamba.jpg",
        description: "A park with lush greenery and walking trails.",
        guides: [],
      },
    ],
  },
};

const createPOIs = (city, category) => {
  return customPOIData[city]?.[category] || [];
};

const POIList = () => {
  const { city, category } = useParams();
  const navigate = useNavigate();

  const spots = createPOIs(city, category);

  const handleBack = () => {
    navigate(-1);
  };

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

      {spots.length > 0 ? (
        <div className="row">
          {spots.map((spot, index) => (
            <div className="col-12 mb-5" key={index}>
              <div className="card shadow border-0">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src={spot.image}
                      className="img-fluid rounded-start h-100"
                      alt={spot.name}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h3 className="card-title">{spot.name}</h3>
                      <p className="text-muted">{spot.description}</p>

                      <hr />
                      <h5 className="mt-4 mb-3">🎒 Available Tour Guides</h5>

                      {spot.guides && spot.guides.length > 0 ? (
                        <div className="row">
                          {spot.guides
                            .sort((a, b) => b.rating - a.rating)
                            .map((guide, guideIndex) => (
                              <div className="col-md-6 mb-3" key={guideIndex}>
                                <div className="card h-100 border-0 shadow-sm">
                                  <div className="row g-0 h-100">
                                    <div className="col-4">
                                      <img
                                        src={guide.image}
                                        className="img-fluid rounded-start h-100"
                                        alt={guide.name}
                                        style={{ objectFit: "cover" }}
                                      />
                                    </div>
                                    <div className="col-8 d-flex">
                                      <div className="card-body p-2 d-flex flex-column justify-content-between">
                                        <div>
                                          <h6 className="card-title mb-1">
                                            {guide.name}
                                          </h6>
                                          <p className="mb-1">
                                            ⭐ {guide.rating} / 5
                                          </p>
                                          <p className="mb-1">
                                            💵 PHP {guide.price}
                                          </p>
                                          <small className="text-muted">
                                            {guide.bio}
                                          </small>
                                        </div>
                                        <Link
                                          to={`/booking/${guideIndex + 1}/${
                                            index + 1
                                          }`}
                                          className="btn btn-sm btn-primary mt-2"
                                        >
                                          Book Now
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted mb-3">No tour guides available for this location yet.</p>
                          <button className="btn btn-outline-primary" disabled>
                            Check Back Later
                          </button>
                        </div>
                      )}
                      
                      {spot.guides && spot.guides.length > 0 && (
                        <div className="text-end">
                          <button className="btn btn-outline-primary mt-3">
                            View All Guides
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-warning text-center">
          No spots found for this category.
        </div>
      )}
    </div>
  );
};

export default POIList;
