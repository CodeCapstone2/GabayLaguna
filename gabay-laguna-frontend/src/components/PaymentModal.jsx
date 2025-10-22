import React, { useState } from "react";
import axios from "axios";
import API_CONFIG from "../config/api";

const PaymentModal = ({ booking, onClose, onSuccess }) => {
  const [method, setMethod] = useState("paypal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bankCode, setBankCode] = useState("BCA");
  const [showBankSelection, setShowBankSelection] = useState(false);

  const pay = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (method === "paypal") {
        const resp = await axios.post(
          `${API_CONFIG.BASE_URL}/api/payments/paypal`,
          {
            booking_id: booking.id,
            paypal_payment_id: `PP-${booking.id}-${Date.now()}`,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        onSuccess?.(resp.data);
      } else if (method === "paymongo") {
        const resp = await axios.post(
          `${API_CONFIG.BASE_URL}/api/payments/paymongo`,
          {
            booking_id: booking.id,
            paymongo_payment_intent_id: `PM-${booking.id}-${Date.now()}`,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        onSuccess?.(resp.data);
      } else if (method === "xendit_invoice") {
        const resp = await axios.post(
          `${API_CONFIG.BASE_URL}/api/payments/xendit/invoice`,
          {
            booking_id: booking.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        
        // Open Xendit invoice in new tab
        if (resp.data.invoice_url) {
          window.open(resp.data.invoice_url, '_blank');
        }
        onSuccess?.(resp.data);
      } else if (method === "xendit_va") {
        const resp = await axios.post(
          `${API_CONFIG.BASE_URL}/api/payments/xendit/virtual-account`,
          {
            booking_id: booking.id,
            bank_code: bankCode,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        onSuccess?.(resp.data);
      }
    } catch (e) {
      setError(
        e.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Pay for Booking</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>
                  <strong>POI</strong>: {booking.poi_name}
                </span>
                <span>
                  <strong>Total</strong>: PHP {booking.total_amount || "0.00"}
                </span>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Select Payment Method</label>
              <select
                className="form-select"
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  setShowBankSelection(e.target.value === "xendit_va");
                }}
              >
                <option value="paypal">PayPal (simulate)</option>
                <option value="paymongo">PayMongo (simulate)</option>
                <option value="xendit_invoice">Xendit Invoice (GCash, PayMaya, etc.)</option>
                <option value="xendit_va">Xendit Virtual Account (Bank Transfer)</option>
              </select>
            </div>
            
            {showBankSelection && (
              <div className="mb-3">
                <label className="form-label">Select Bank</label>
                <select
                  className="form-select"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                >
                  <option value="BCA">BCA</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="MANDIRI">Mandiri</option>
                  <option value="PERMATA">Permata</option>
                  <option value="BSI">BSI</option>
                </select>
              </div>
            )}
            {error && (
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            )}
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
              onClick={pay}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
