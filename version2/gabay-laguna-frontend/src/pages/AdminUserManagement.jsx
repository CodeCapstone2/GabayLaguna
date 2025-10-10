import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../theme.css";

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, tourists, guides, pending
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    console.log("User data from localStorage:", userDataString);
    
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log("Parsed user:", userData);
        console.log("User type:", userData.user_type);
        
        if (userData.user_type !== "admin") {
          console.log("User is not admin, redirecting to login");
          alert("Access denied. Admin privileges required.");
          navigate("/login");
          return;
        }
        setUser(userData);
        console.log("User is admin, proceeding to load users");
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
        return;
      }
    } else {
      console.log("No user data found, redirecting to login");
      navigate("/login");
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      console.log("Loading users with token:", token ? "Present" : "Missing");
      console.log("API URL:", `${API_CONFIG.BASE_URL}/api/admin/users`);
      console.log("API_CONFIG:", API_CONFIG);
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/admin/users`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("API Response Status:", response.status);
      console.log("API Response Headers:", response.headers);
      console.log("API Response Data:", response.data);
      
      // Handle different API response formats
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response.data.users && response.data.users.data && Array.isArray(response.data.users.data)) {
        // Handle paginated response from Laravel
        usersData = response.data.users.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else {
        console.warn("Unexpected API response format:", response.data);
        usersData = [];
      }

      console.log("Processed users data:", usersData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Show more specific error message
      let errorMessage = "Failed to load users. ";
      if (error.response?.status === 401) {
        errorMessage += "Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage += "You don't have permission to access this page.";
      } else if (error.response?.status === 500) {
        errorMessage += "Server error. Please try again later.";
      } else {
        errorMessage += "Please check your connection and try again.";
      }
      
      alert(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_CONFIG.BASE_URL}/api/admin/users/${userId}/verify`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("User verified successfully!");
      // Refresh the user list to show updated data
      await loadUsers();
    } catch (error) {
      console.error("Error verifying user:", error);
      alert("Failed to verify user. Please try again.");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_CONFIG.BASE_URL}/api/admin/users/${userId}/status`,
        {
          is_active: !currentStatus,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(
        `User ${currentStatus ? "deactivated" : "activated"} successfully!`
      );
      // Refresh the user list to show updated data
      await loadUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "tourists" && user.user_type === "tourist") ||
          (filter === "guides" && user.user_type === "guide") ||
          (filter === "pending" && !user.is_verified);

        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
      })
    : [];

  if (loading) {
    return (
      <div
        className="container py-5 text-center"
        style={{ fontFamily: "var(--font-family-primary)" }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{
            color: "var(--color-success)",
            width: "3rem",
            height: "3rem",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p
          className="mt-3"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.1rem",
          }}
        >
          Loading user data...
        </p>
      </div>
    );
  }

  return (
    <div
      className="container py-5"
      style={{ fontFamily: "var(--font-family-primary)" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-family-heading)",
              fontWeight: "600",
            }}
          >
            👥 User Management
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "0",
            }}
          >
            Manage user accounts, verify tour guides, and handle user status
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={loadUsers}
            disabled={loading}
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            {loading ? "🔄 Loading..." : "🔄 Refresh"}
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin-dashboard")}
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label
            className="form-label"
            style={{
              color: "var(--color-text)",
              fontWeight: "500",
            }}
          >
            Filter by Role
          </label>
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          >
            <option value="all">All Users</option>
            <option value="tourists">Tourists Only</option>
            <option value="guides">Tour Guides Only</option>
            <option value="pending">Pending Verification</option>
          </select>
        </div>
        <div className="col-md-6">
          <label
            className="form-label"
            style={{
              color: "var(--color-text)",
              fontWeight: "500",
            }}
          >
            Search Users
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {users.length}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                Total Users
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-success)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {Array.isArray(users)
                  ? users.filter((u) => u.user_type === "guide").length
                  : 0}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                Tour Guides
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-info)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {Array.isArray(users)
                  ? users.filter((u) => u.user_type === "tourist").length
                  : 0}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                Tourists
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-warning)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {Array.isArray(users)
                  ? users.filter((u) => !u.is_verified).length
                  : 0}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                Pending Verification
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow-sm border-0 text-center"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="card-body p-3">
              <h4
                style={{
                  color: "var(--color-danger)",
                  fontFamily: "var(--font-family-heading)",
                  fontWeight: "700",
                }}
              >
                {Array.isArray(users)
                  ? users.filter((u) => !u.is_active).length
                  : 0}
              </h4>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginBottom: "0",
                  fontSize: "0.9rem",
                }}
              >
                Inactive Users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        className="card shadow-lg border-0"
        style={{
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          className="card-header"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            borderBottom: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          }}
        >
          <h5
            className="mb-0"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-family-heading)",
              fontWeight: "600",
            }}
          >
            User List ({filteredUsers.length} users)
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                }}
              >
                <tr>
                  <th
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "600",
                      border: "none",
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "600",
                      border: "none",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "600",
                      border: "none",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "600",
                      border: "none",
                    }}
                  >
                    Verification
                  </th>
                  <th
                    style={{
                      color: "var(--color-text)",
                      fontWeight: "600",
                      border: "none",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-4"
                      style={{
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid var(--color-border-light)",
                      }}
                    >
                      <td>
                        <div>
                          <div
                            style={{
                              color: "var(--color-text)",
                              fontWeight: "500",
                            }}
                          >
                            {user.name}
                          </div>
                          <small
                            style={{
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {user.email}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.role === "guide" ? "bg-success" : "bg-primary"
                          }`}
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.5rem 0.75rem",
                          }}
                        >
                          {user.role === "guide" ? "🧭 Guide" : "👤 Tourist"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.is_active ? "bg-success" : "bg-danger"
                          }`}
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.5rem 0.75rem",
                          }}
                        >
                          {user.is_active ? "✅ Active" : "❌ Inactive"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.is_verified ? "bg-success" : "bg-warning"
                          }`}
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.5rem 0.75rem",
                          }}
                        >
                          {user.is_verified ? "✅ Verified" : "⏳ Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {!user.is_verified && (
                            <button
                              className="btn btn-sm btn-success me-1"
                              onClick={() => handleVerifyUser(user.id)}
                              style={{
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.8rem",
                              }}
                            >
                              Verify
                            </button>
                          )}
                          <button
                            className={`btn btn-sm ${
                              user.is_active ? "btn-danger" : "btn-success"
                            }`}
                            onClick={() =>
                              handleToggleUserStatus(user.id, user.is_active)
                            }
                            style={{
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.8rem",
                            }}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
