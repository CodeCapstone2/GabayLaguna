import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ThemeToggle from "./ThemeToggle";
import { Dropdown } from "react-bootstrap";
import {
  FaUser,
  FaSignOutAlt,
  FaUserCircle,
  FaTachometerAlt,
  FaClipboardList,
  FaHome,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  })();
  const isLoggedIn = !!user;
  const role = user?.user_type || user?.role || null;

  const isPublicPage = [
    "/",
    "/login",
    "/signup",
    "/signup/tourist",
    "/signup/tourguide",
    "/signup/admin",
  ].some((path) => pathname === path || pathname.startsWith(path));

  const dropdownLinks = {
    tourist: {
      profile: "/tourist-profile",
      dashboard: "/tourist-dashboard",
      bookings: "/my-bookings",
    },
    guide: {
      profile: "/guide-profile",
      dashboard: "/guide-dashboard",
      bookings: "/guide-bookings",
    },
    admin: {
      profile: "/admin-dashboard",
      dashboard: "/admin-dashboard",
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark px-4 py-3"
      style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        backdropFilter: "blur(10px)",
        position: "relative",
        zIndex: 1000,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-3"
          to="/"
          style={{ textDecoration: "none" }}
        >
          <div className="position-relative">
            <img
              src="/assets/logo.png"
              alt="Gabay Laguna Logo"
              className="rounded-circle shadow-sm"
              style={{
                width: "45px",
                height: "45px",
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold fs-5 text-white">Gabay Laguna</span>
            <small className="text-white-50" style={{ fontSize: "0.75rem" }}>
              Explore • Discover • Experience
            </small>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: "none", boxShadow: "none" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="ms-auto d-flex gap-3 align-items-center">

            {/* Enhanced Theme Toggle */}
            <div className="d-none d-md-block">
              <ThemeToggle />
            </div>

            {/* Logged In User */}
            {isLoggedIn && (
              <div className="position-relative" style={{ zIndex: 1001 }}>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-user"
                    className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: "25px",
                      border: "none",
                      background: "rgba(255,255,255,0.9)",
                      color: "#667eea",
                      fontWeight: "600",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255,255,255,1)";
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.9)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                    }}
                  >
                    <FaUserCircle size={18} />
                    <span className="d-none d-sm-inline">
                      {user?.name ||
                        user?.fullName ||
                        (role
                          ? role.charAt(0).toUpperCase() + role.slice(1)
                          : "User")}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    className="shadow-lg border-0"
                    style={{
                      borderRadius: "16px",
                      marginTop: "8px",
                      minWidth: "220px",
                      zIndex: 1002,
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      animation: "dropdownFadeIn 0.3s ease-out",
                    }}
                  >
                    <Dropdown.Header
                      className="fw-bold text-muted"
                      style={{
                        background: "transparent",
                        borderBottom: "1px solid rgba(0,0,0,0.1)",
                        padding: "12px 16px",
                      }}
                    >
                      Welcome back!
                    </Dropdown.Header>

                    <Dropdown.Item
                      as={Link}
                      to={dropdownLinks[role]?.profile || "/profile"}
                      className="d-flex align-items-center gap-2 py-3 px-3"
                      style={{
                        transition: "all 0.2s ease",
                        border: "none",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(102, 126, 234, 0.1)";
                        e.target.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      <FaUser size={14} style={{ color: "#667eea" }} />
                      <span style={{ fontWeight: "500" }}>Profile</span>
                    </Dropdown.Item>

                    <Dropdown.Item
                      as={Link}
                      to={dropdownLinks[role]?.dashboard || "/dashboard"}
                      className="d-flex align-items-center gap-2 py-3 px-3"
                      style={{
                        transition: "all 0.2s ease",
                        border: "none",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(102, 126, 234, 0.1)";
                        e.target.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      <FaTachometerAlt size={14} style={{ color: "#667eea" }} />
                      <span style={{ fontWeight: "500" }}>Dashboard</span>
                    </Dropdown.Item>

                    {role === "tourist" && (
                      <Dropdown.Item
                        as={Link}
                        to={dropdownLinks[role]?.bookings || "/my-bookings"}
                        className="d-flex align-items-center gap-2 py-3 px-3"
                        style={{
                          transition: "all 0.2s ease",
                          border: "none",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "rgba(102, 126, 234, 0.1)";
                          e.target.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.transform = "translateX(0)";
                        }}
                      >
                        <FaClipboardList
                          size={14}
                          style={{ color: "#667eea" }}
                        />
                        <span style={{ fontWeight: "500" }}>My Bookings</span>
                      </Dropdown.Item>
                    )}

                    {role === "guide" && (
                      <Dropdown.Item
                        as={Link}
                        to={dropdownLinks[role]?.bookings || "/guide-bookings"}
                        className="d-flex align-items-center gap-2 py-3 px-3"
                        style={{
                          transition: "all 0.2s ease",
                          border: "none",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "rgba(102, 126, 234, 0.1)";
                          e.target.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.transform = "translateX(0)";
                        }}
                      >
                        <FaClipboardList
                          size={14}
                          style={{ color: "#667eea" }}
                        />
                        <span style={{ fontWeight: "500" }}>
                          Manage Bookings
                        </span>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Divider
                      style={{
                        margin: "8px 0",
                        borderColor: "rgba(0,0,0,0.1)",
                      }}
                    />

                    <Dropdown.Item
                      onClick={handleLogout}
                      className="d-flex align-items-center gap-2 py-3 px-3"
                      style={{
                        transition: "all 0.2s ease",
                        border: "none",
                        background: "transparent",
                        color: "#ef4444",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.1)";
                        e.target.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      <FaSignOutAlt size={14} />
                      <span style={{ fontWeight: "500" }}>Logout</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}

            {/* Navigation Links */}
            {!isLoggedIn && isPublicPage && (
              <div className="d-flex gap-3 me-3">
                <Link
                  to="/cities"
                  className="btn btn-outline-light btn-sm px-3 py-2"
                  style={{
                    borderRadius: "20px",
                    borderWidth: "2px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                >
                  🏙️ Cities
                </Link>
                <Link
                  to="/itineraries"
                  className="btn btn-outline-light btn-sm px-3 py-2"
                  style={{
                    borderRadius: "20px",
                    borderWidth: "2px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                >
                  🗺️ Itineraries
                </Link>
              </div>
            )}

            {/* Public Navigation */}
            {!isLoggedIn && isPublicPage && (
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  className="btn btn-outline-light px-3 py-2"
                  style={{
                    borderRadius: "25px",
                    borderWidth: "2px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  🔑 Login
                </Link>
                <Link
                  to="/signup/tourist"
                  className="btn btn-light px-3 py-2 fw-semibold"
                  style={{
                    borderRadius: "25px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                  }}
                >
                  📝 Sign Up
                </Link>
              </div>
            )}

            {/* Home Link for Non-Public Pages */}
            {!isPublicPage && (
              <Link
                to="/"
                className="btn btn-outline-light btn-sm px-3 py-2"
                style={{
                  borderRadius: "20px",
                  borderWidth: "2px",
                }}
              >
                <FaHome className="me-1" />
                Home
              </Link>
            )}

            {/* Mobile Theme Toggle */}
            <div className="d-md-none d-flex gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for dropdown animation */}
      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-menu {
          z-index: 1002 !important;
        }

        .dropdown-item:hover {
          background-color: rgba(102, 126, 234, 0.1) !important;
        }

        .dropdown-item:active {
          background-color: rgba(102, 126, 234, 0.2) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
