import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GuideLocationApplications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({ cityId: "", poiId: "", notes: "" });
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

  const submitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/guide/location-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ city_id: form.cityId || null, poi_id: form.poiId || null, notes: form.notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      alert("Application submitted for review.");
      setForm({ cityId: "", poiId: "", notes: "" });
      loadApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/guide/location-applications", {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      setApplications([]);
    }
  };

  useEffect(() => { loadApplications(); }, []);

  return (
    <div className="container py-5">
      <h3 className="mb-3">Apply to Operate in a Destination</h3>
      <form onSubmit={submitApplication} className="card p-3 mb-4 shadow-sm border-0">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">City ID (optional)</label>
            <input className="form-control" name="cityId" value={form.cityId} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">POI ID (optional)</label>
            <input className="form-control" name="poiId" value={form.poiId} onChange={handleChange} />
          </div>
          <div className="col-md-12">
            <label className="form-label">Notes</label>
            <textarea className="form-control" name="notes" rows={3} value={form.notes} onChange={handleChange} />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-success" disabled={submitting}>{submitting ? "Submitting..." : "Submit Application"}</button>
        </div>
      </form>

      <h5>My Applications</h5>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th><th>City</th><th>POI</th><th>Status</th><th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted">No applications yet.</td></tr>
            )}
            {applications.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.city?.name || a.city_id || "-"}</td>
                <td>{a.point_of_interest?.name || a.poi_id || "-"}</td>
                <td><span className={`badge ${a.status === 'approved' ? 'bg-success' : a.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>{a.status}</span></td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuideLocationApplications;

