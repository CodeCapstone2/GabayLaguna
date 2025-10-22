import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api";
import StarRating from "../components/StarRating";

const TouristReviews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const payload = data.reviews || data;
      setReviews(Array.isArray(payload) ? payload : payload.data || []);
    } catch (e) {
      console.error(e);
      setError("Unable to load your reviews. Please try again later.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const startEdit = (rev) => {
    setEditingId(rev.id);
    setForm({ rating: Number(rev.rating) || 5, comment: rev.comment || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ rating: 5, comment: "" });
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/reviews/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Failed to update (${res.status})`);
      await fetchReviews();
      cancelEdit();
    } catch (e) {
      alert("Failed to update review.");
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">My Reviews</h2>
          <p className="text-muted mb-0">View and update your submitted reviews</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading reviews…</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="alert alert-info">You have not submitted any reviews yet.</div>
      ) : (
        <div className="list-group">
          {reviews.map((rev) => (
            <div key={rev.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold">
                    {rev.tour_guide?.user?.name || "Tour Guide"}
                  </div>
                  <div className="text-muted small">
                    {rev.booking?.point_of_interest?.name ||
                      rev.booking?.pointOfInterest?.name ||
                      "Point of Interest"}
                  </div>
                </div>
                {editingId !== rev.id ? (
                  <div className="text-end">
                    <span className="badge bg-warning text-dark me-2">⭐ {rev.rating}</span>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(rev)}>
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="text-end">
                    <button className="btn btn-sm btn-secondary me-2" onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={saveEdit}>
                      Save
                    </button>
                  </div>
                )}
              </div>
              {editingId !== rev.id ? (
                <p className="mb-0 mt-2">{rev.comment}</p>
              ) : (
                <div className="row g-2 mt-2">
                  <div className="col-md-4">
                    <div className="p-2 border rounded bg-light">
                      <StarRating 
                        rating={form.rating} 
                        showLabel={true}
                        size="normal"
                        interactive={true}
                        onRatingChange={(rating) => setForm({ ...form, rating })}
                      />
                      <div className="mt-1">
                        <small className="text-muted">
                          Click stars to change rating
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-10">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TouristReviews;



