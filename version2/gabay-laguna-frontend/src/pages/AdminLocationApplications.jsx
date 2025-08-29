// Update your AdminLocationApplications component with these improvements
import React, { useEffect, useState } from "react";

const AdminLocationApplications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `http://127.0.0.1:8000/api/admin/location-applications${filter !== 'all' ? `?status=${filter}` : ''}`;
      const res = await fetch(url, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.applications?.data || data.applications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const act = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const notes = prompt(`Add notes for ${action} action (optional):`);
      const res = await fetch(`http://127.0.0.1:8000/api/admin/location-applications/${id}/${action}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Accept: "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ notes })
      });
      if (!res.ok) throw new Error("Failed");
      await load();
      alert(`Application ${action}d successfully`);
    } catch (e) {
      alert("Action failed");
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Guide Location Applications</h3>
        <select 
          className="form-select w-auto" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Applications</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guide</th>
                <th>City</th>
                <th>POI</th>
                <th>Message</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan="8" className="text-center text-muted">No applications found.</td></tr>
              )}
              {items.map(it => (
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.tour_guide?.user?.name || `Guide #${it.tour_guide_id}`}</td>
                  <td>{it.city?.name || it.city_id}</td>
                  <td>{it.point_of_interest?.name || it.poi_id || '-'}</td>
                  <td>{it.message || '-'}</td>
                  <td>
                    <span className={`badge ${it.status === 'approved' ? 'bg-success' : it.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                      {it.status}
                    </span>
                  </td>
                  <td>{new Date(it.created_at).toLocaleDateString()}</td>
                  <td>
                    {it.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success me-2" onClick={() => act(it.id, 'approve')}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => act(it.id, 'reject')}>Reject</button>
                      </>
                    )}
                    {it.status !== 'pending' && (
                      <span className="text-muted">Processed</span>
                    )}
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