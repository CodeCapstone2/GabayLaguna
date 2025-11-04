import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  })();
  const role = user?.user_type || user?.role || null;

  const links = {
    tourist: [
      { to: "/tourist-dashboard", label: "Dashboard", icon: "🏠" },
      { to: "/cities", label: "Explore", icon: "🗺️" },
      { to: "/itineraries", label: "Itineraries", icon: "📅" },
      { to: "/my-bookings", label: "My Bookings", icon: "📋" },
      { to: "/tourist/reviews", label: "My Reviews", icon: "⭐" },
      { to: "/tourist-profile", label: "Profile", icon: "👤" },
    ],
    guide: [
      { to: "/guide-dashboard", label: "Dashboard", icon: "🧭" },
      { to: "/guide-bookings", label: "Bookings", icon: "📋" },
      { to: "/guide/reviews", label: "Reviews", icon: "⭐" },
      { to: "/guide/location-applications", label: "Locations", icon: "📍" },
      { to: "/guide-profile", label: "Profile", icon: "👤" },
    ],
    admin: [
      { to: "/admin-dashboard", label: "Dashboard", icon: "📊" },
      { to: "/admin/user-management", label: "Users", icon: "👥" },
      { to: "/admin/reports", label: "Reports", icon: "📑" },
    ],
  };

  const items = role ? links[role] || [] : [];
  if (!items.length) return null;

  return (
    <aside
      className="sidebar d-none d-md-block"
      style={{
        position: "sticky",
        top: "80px",
        alignSelf: "flex-start",
      }}
    >
      <div className="card border-0 shadow-sm">
        <div className="card-body p-2">
          <nav className="nav flex-column">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link px-2 py-1 rounded ${
                  pathname === item.to ? "active fw-semibold" : ""
                }`}
                style={{
                  color: "var(--color-text)",
                  fontSize: "0.9rem",
                }}
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
