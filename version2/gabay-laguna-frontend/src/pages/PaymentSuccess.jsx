import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";
 
const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div 
            className="card shadow-lg border-0 text-center"
            style={{
              borderRadius: "var(--radius-2xl)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              animation: "fadeInUp 0.6s ease-out",
            }}
          >
            <div className="card-body p-5">
              {/* Success Message */}
              <h2 
                className="card-title mb-3"
                style={{
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                Payment Successful!
              </h2>
              <p 
                className="lead mb-4"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Your payment has been processed successfully. Your booking is now confirmed.
              </p>

              {/* Additional Info */}
              <div 
                className="alert alert-success" 
                role="alert"
                style={{
                  borderRadius: "var(--radius-lg)",
                  background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                  border: "none",
                  borderLeft: "4px solid var(--color-success)",
                }}
              >
                <i className="fas fa-info-circle me-2"></i>
                You will receive a confirmation email shortly with your booking details.
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2 mt-4">
                <button
                  className="btn btn-success btn-lg"
                  onClick={() => navigate("/my-bookings")}
                  style={{
                    background: "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%)",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-calendar-check me-2"></i>
                  Go to My Bookings
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate("/tourist-dashboard")}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-home me-2"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;


