import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaShieldAlt,
  FaGlobe,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";

const Hero = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#features") {
      const featureSection = document.getElementById("features");
      if (featureSection) {
        featureSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <section
      className="hero-section position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "80px",
      }}
    >
      {/* Background Pattern */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        }}
      ></div>

      <div className="container position-relative">
        {/* Logo - Centered across full width */}
        <div className="text-center mb-5">
          <img
            src="/assets/logo.png"
            alt="Gabay Laguna Logo"
            style={{
              width: "180px",
              height: "auto",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
            }}
          />
        </div>

        <div className="row align-items-center">
          {/* Left Content */}
          <div className="col-lg-6 col-md-7 mb-5 mb-lg-0">
            <div className="hero-content text-white">
              {/* Main Heading */}
              <h1 className="display-4 fw-bold mb-4 lh-sm">
                Discover Laguna's Hidden Gems with Expert Guides
              </h1>

              {/* Subtitle */}
              <p
                className="lead mb-5 lh-base"
                style={{
                  fontSize: "1.25rem",
                  opacity: 0.95,
                  lineHeight: 1.7,
                }}
              >
                Connect with licensed local tour guides, explore breathtaking
                destinations, and create unforgettable memories in the heart of
                the Philippines.
              </p>

              {/* Features List */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "24px", height: "24px" }}
                  >
                    <FaStar size={12} style={{ color: "#667eea" }} />
                  </div>
                  <span className="text-white-75">
                    Licensed & Verified Tour Guides
                  </span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "24px", height: "24px" }}
                  >
                    <FaShieldAlt size={12} style={{ color: "#667eea" }} />
                  </div>
                  <span className="text-white-75">
                    Secure Booking & Payment System
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "24px", height: "24px" }}
                  >
                    <FaGlobe size={12} style={{ color: "#667eea" }} />
                  </div>
                  <span className="text-white-75">
                    Explore Laguna's Best Destinations
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link
                  to="/signup/tourist"
                  className="btn btn-light btn-lg px-4 py-3 fw-semibold d-flex align-items-center"
                  style={{
                    borderRadius: "50px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                  }}
                >
                  <FaUsers className="me-2" />
                  Start Exploring
                  <FaArrowRight className="ms-2" />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold"
                  style={{
                    borderRadius: "50px",
                    borderWidth: "2px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  Sign In
                </Link>
              </div>

              {/* Additional Links */}
              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/signup/guide"
                  className="btn btn-outline-warning btn-sm px-3 py-2"
                  style={{
                    borderRadius: "25px",
                    borderWidth: "2px",
                    color: "#FFD54F",
                    borderColor: "#FFD54F",
                  }}
                >
                  🧭 Become a Guide
                </Link>
                {/* Admin Access button hidden for security */}
                {/* <Link 
                  to="/admin/login" 
                  className="btn btn-outline-secondary btn-sm px-3 py-2"
                  style={{ 
                    borderRadius: '25px',
                    borderWidth: '2px'
                  }}
                >
                  👨‍💼 Admin Access
                </Link> */}
              </div>
            </div>
          </div>

          {/* Right Content - Stats & Visual Elements */}
          <div className="col-lg-6 col-md-5">
            <div className="hero-stats text-center text-white">
              {/* Stats Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="bg-white bg-opacity-10 rounded-3 p-3 border border-white border-opacity-25">
                    <div className="h4 fw-bold mb-1">50+</div>
                    <div className="small text-white-75">Tour Guides</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white bg-opacity-10 rounded-3 p-3 border border-white border-opacity-25">
                    <div className="h4 fw-bold mb-1">100+</div>
                    <div className="small text-white-75">Destinations</div>
                  </div>
                </div>
              </div>

              {/* City Images Grid */}
              <div className="city-grid mb-4">
                <div className="row g-2">
                  <div className="col-6">
                    <img
                      src="/assets/CalambaCity.jpg"
                      alt="Calamba City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="/assets/SanPabloCity.svg.png"
                      alt="San Pablo City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="/assets/StaRosaCity.jpg"
                      alt="Sta Rosa City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="/assets/BinanCity.jpg"
                      alt="Binan City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="trust-indicators">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="d-flex me-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className="text-warning me-1"
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="text-white-75 small">4.9/5 Rating</span>
                </div>
                <p className="text-white-50 small mb-0">
                  Trusted by thousands of tourists worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
        <div className="text-center text-white-50">
          <div className="mb-2">Scroll to explore</div>
          <div className="scroll-indicator">
            <div className="scroll-dot"></div>
            <div className="scroll-dot"></div>
            <div className="scroll-dot"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
