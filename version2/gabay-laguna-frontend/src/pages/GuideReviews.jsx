import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api";

const GuideReviews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/guide/reviews?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load reviews (${res.status})`);
      }

      const data = await res.json();
      const paginated = data.reviews || data; // supports {reviews: {data, ...}} or array
      if (Array.isArray(paginated)) {
        setReviews(paginated);
        setMeta({ current_page: 1, last_page: 1 });
      } else {
        setReviews(paginated.data || []);
        setMeta({
          current_page: paginated.current_page || 1,
          last_page: paginated.last_page || 1,
        });
      }
    } catch (e) {
      console.error(e);
      setError("Unable to load reviews. Please try again later.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h3 className="mb-1">Guide Reviews</h3>
          <p className="text-muted mb-0">Only feedback submitted by tourists</p>
        </div>
        <div className="text-end">
          <div className="fw-bold">Average Rating: {averageRating} ⭐</div>
          <div className="text-muted small">{reviews.length} review(s)</div>
        </div>
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
        <div className="alert alert-info">No reviews yet.</div>
      ) : (
        <div className="list-group">
          {reviews.map((rev) => (
            <div key={rev.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold">
                    {rev.tourist?.name || rev.tourist?.full_name || "Tourist"}
                  </div>
                  <div className="text-muted small">
                    {rev.booking?.point_of_interest?.name ||
                      rev.booking?.pointOfInterest?.name ||
                      "Booking"}
                    {rev.booking?.point_of_interest?.city?.name ||
                    rev.booking?.pointOfInterest?.city?.name
                      ? ` • ${rev.booking?.point_of_interest?.city?.name || rev.booking?.pointOfInterest?.city?.name}`
                      : ""}
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-warning text-dark me-2">
                    ⭐ {rev.rating}
                  </span>
                  <span className="text-muted small">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {rev.comment && <p className="mb-0 mt-2">{rev.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-secondary"
            disabled={meta.current_page <= 1}
            onClick={() => fetchReviews(meta.current_page - 1)}
          >
            ← Previous
          </button>
          <div className="text-muted small">
            Page {meta.current_page} of {meta.last_page}
          </div>
          <button
            className="btn btn-outline-secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => fetchReviews(meta.current_page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default GuideReviews;


