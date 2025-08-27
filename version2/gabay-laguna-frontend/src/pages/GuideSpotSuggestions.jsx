import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GuideSpotSuggestions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ name: "", cityId: "", description: "", latitude: "", longitude: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    try { setUser(raw ? JSON.parse(raw) : null); } catch { setUser(null); }
    if (!raw) { navigate("/login"); }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitSuggestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/guide/spot-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, city_id: form.cityId, description: form.description, latitude: form.latitude || null, longitude: form.longitude || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit suggestion");
      alert("Suggestion submitted for review.");
      setForm({ name: "", cityId: "", description: "", latitude: "", longitude: "" });
      loadSuggestions();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/guide/spot-suggestions", {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setSuggestions([]);
    }
  };

  useEffect(() => { loadSuggestions(); }, []);

  return (
    <div className="container py-5">
      <h3 className="mb-3">Suggest a New Tourist Spot</h3>
      <form onSubmit={submitSuggestion} className="card p-3 mb-4 shadow-sm border-0">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Spot Name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">City ID</label>
            <input className="form-control" name="cityId" value={form.cityId} onChange={handleChange} required />
          </div>
          <div className="col-md-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" rows={3} value={form.description} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Latitude (optional)</label>
            <input className="form-control" name="latitude" value={form.latitude} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Longitude (optional)</label>
            <input className="form-control" name="longitude" value={form.longitude} onChange={handleChange} />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit Suggestion"}</button>
        </div>
      </form>

      <h5>My Suggestions</h5>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>City</th><th>Status</th><th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted">No suggestions yet.</td></tr>
            )}
            {suggestions.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.city?.name || s.city_id}</td>
                <td><span className={`badge ${s.status === 'approved' ? 'bg-success' : s.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>{s.status}</span></td>
                <td>{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuideSpotSuggestions;

