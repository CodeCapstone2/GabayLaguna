import React, { useEffect, useState } from "react";
import API_CONFIG from "../config/api";
import { useNavigate } from "react-router-dom";

const GuideLocationApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [pois, setPois] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredPois, setFilteredPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ cityId: "", poiId: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    try {
      const userData = raw ? JSON.parse(raw) : null;
      if (!userData || userData.user_type !== "guide") {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch all POIs (using your existing API structure)
  const fetchPois = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/pois`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      console.log("POI API Response:", data);
      
      if (res.ok) {
        // Handle different response formats
        let poiData = [];
        if (data.points_of_interest) {
          poiData = data.points_of_interest.data || data.points_of_interest;
        } else if (data.data) {
          poiData = data.data;
        } else {
          poiData = data;
        }
        
        console.log("Processed POI data:", poiData);
        setPois(poiData);

        // Extract unique cities from POIs
        const uniqueCities = {};
        poiData.forEach((poi) => {
          if (poi.city) {
            uniqueCities[poi.city.id] = poi.city;
          } else if (poi.city_id) {
            // If city object is not included, we'll just store the ID
            uniqueCities[poi.city_id] = {
              id: poi.city_id,
              name: `City ${poi.city_id}`,
            };
          }
        });
        console.log("Extracted cities:", Object.values(uniqueCities));
        setCities(Object.values(uniqueCities));
      } else {
        console.error("POI API Error:", data);
        setError("Failed to load locations: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to fetch POIs:", err);
      setError("Failed to load locations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter POIs based on selected city
  useEffect(() => {
    if (form.cityId) {
      const filtered = pois.filter((poi) => {
        // Handle both object and ID formats
        const poiCityId = poi.city ? poi.city.id : poi.city_id;
        return String(poiCityId) === String(form.cityId);
      });
      setFilteredPois(filtered);
    } else {
      setFilteredPois(pois);
    }
  }, [form.cityId, pois]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // Reset POI selection if city changes
    if (name === "cityId") {
      setForm((f) => ({ ...f, poiId: "" }));
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate form - at least one selection is required
    if (!form.cityId && !form.poiId) {
      setError("Please select either a city or a specific point of interest.");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Submitting application with:", {
        city_id: form.cityId || null,
        poi_id: form.poiId || null,
        notes: form.notes,
      });

      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/guide/location-applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            city_id: form.cityId || null,
            poi_id: form.poiId || null,
            notes: form.notes,
          }),
        }
      );

      const data = await res.json();
      console.log("API Response:", { status: res.status, data });

      if (!res.ok) {
        // Handle validation errors specifically
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(
          data.message || `Failed to submit application (${res.status})`
        );
      }

      alert("Application submitted for review.");
      setForm({ cityId: "", poiId: "", notes: "" });
      loadApplications();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/guide/location-applications`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setApplications([]);
    }
  };

  useEffect(() => {
    loadApplications();
    fetchPois();
  }, []);

  // Helper function to get city name
  const getCityName = (cityId) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  // Helper function to get POI name
  const getPoiName = (poiId) => {
    const poi = pois.find((p) => p.id === poiId);
    return poi ? poi.name : `POI ${poiId}`;
  };

  return (
    <div className="container py-5">
      <h3 className="mb-3">Apply to Operate in a Destination</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form
        onSubmit={submitApplication}
        className="card p-3 mb-4 shadow-sm border-0"
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Select City (optional)</label>
            <select
              className="form-select"
              name="cityId"
              value={form.cityId}
              onChange={handleChange}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Select Point of Interest (optional)
            </label>
            <select
              className="form-select"
              name="poiId"
              value={form.poiId}
              onChange={handleChange}
              disabled={loading || pois.length === 0}
            >
              <option value="">All POIs</option>
              {filteredPois.map((poi) => (
                <option key={poi.id} value={poi.id}>
                  {poi.name} {poi.city ? `(${poi.city.name})` : ""}
                </option>
              ))}
            </select>
            <small className="text-muted">
              {loading
                ? "Loading POIs..."
                : form.cityId
                ? `Showing ${filteredPois.length} POI${filteredPois.length !== 1 ? 's' : ''} in selected city`
                : `Showing all ${pois.length} available POI${pois.length !== 1 ? 's' : ''}`}
            </small>
          </div>

          <div className="col-md-12">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="Explain why you want to operate in this location..."
            />
          </div>
        </div>

        <div className="mt-3">
          <button
            className="btn btn-success"
            disabled={
              submitting || (!form.cityId && !form.poiId)
            }
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>

      {/* POI Information Section */}
      <div className="card p-3 mb-4 shadow-sm border-0">
        <h5 className="mb-3">Available Points of Interest</h5>
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading POIs...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {pois.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No POIs available
                    </td>
                  </tr>
                ) : (
                  pois.slice(0, 10).map((poi) => (
                    <tr key={poi.id}>
                      <td>
                        <strong>{poi.id}</strong>
                      </td>
                      <td>{poi.name}</td>
                      <td>
                        {poi.city ? poi.city.name : `City ${poi.city_id}`}
                      </td>
                      <td>
                        {poi.category
                          ? poi.category.name
                          : poi.category_id || "N/A"}
                      </td>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {poi.address || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {pois.length > 10 && (
              <div className="text-center mt-2">
                <small className="text-muted">
                  Showing 10 of {pois.length} POIs. Use the dropdown above to
                  filter.
                </small>
              </div>
            )}
          </div>
        )}
      </div>

      <h5>My Applications</h5>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>City</th>
              <th>POI</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No applications yet.
                </td>
              </tr>
            )}
            {applications.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.city ? a.city.name : getCityName(a.city_id)}</td>
                <td>
                  {a.point_of_interest
                    ? a.point_of_interest.name
                    : a.poi_id
                    ? getPoiName(a.poi_id)
                    : "All POIs"}
                </td>
                <td>
                  <span
                    className={`badge ${
                      a.status === "approved"
                        ? "bg-success"
                        : a.status === "rejected"
                        ? "bg-danger"
                        : "bg-warning"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
                <td
                  className="text-truncate"
                  style={{ maxWidth: "200px" }}
                  title={a.message}
                >
                  {a.message || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuideLocationApplications;
