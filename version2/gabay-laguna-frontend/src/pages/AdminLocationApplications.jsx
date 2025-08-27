import React, { useEffect, useState } from "react";

const AdminLocationApplications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/admin/location-applications", {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.applications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/admin/location-applications/${id}/${action}`, {
        method: "PUT",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      await load();
    } catch (e) {
      alert("Action failed");
    }
  };

  return (
    <div className="container py-5">
      <h3 className="mb-4">Guide Location Applications</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th><th>Guide</th><th>City</th><th>POI</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted">No applications.</td></tr>
              )}
              {items.map(it => (
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.tour_guide?.user?.name || it.tour_guide_id}</td>
                  <td>{it.city?.name || it.city_id || '-'}</td>
                  <td>{it.point_of_interest?.name || it.poi_id || '-'}</td>
                  <td><span className={`badge ${it.status === 'approved' ? 'bg-success' : it.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>{it.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-success me-2" onClick={() => act(it.id, 'approve')}>Approve</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => act(it.id, 'reject')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLocationApplications;

