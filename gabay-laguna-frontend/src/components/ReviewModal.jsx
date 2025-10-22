import React, { useState } from "react";
import axios from "axios";
import API_CONFIG from "../config/api";
import StarRating from "./StarRating";

const ReviewModal = ({ booking, guideId, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const resp = await axios.post(
        `${API_CONFIG.BASE_URL}/api/reviews`,
        {
          tour_guide_id: guideId,
          booking_id: booking.id,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      onSubmitted?.(resp.data.review);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Leave a Review</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Rating</label>
              <div className="p-3 border rounded bg-light">
                <StarRating 
                  rating={rating} 
                  showLabel={true}
                  size="large"
                  interactive={true}
                  onRatingChange={setRating}
                />
                <div className="mt-2">
                  <small className="text-muted">
                    Click on the stars to select your rating
                  </small>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Feedback</label>
              <textarea
                className="form-control"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
              />
            </div>
            {error && <div className="alert alert-warning">{error}</div>}
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
