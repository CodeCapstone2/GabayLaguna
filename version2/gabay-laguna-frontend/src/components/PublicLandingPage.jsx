import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";
import About from "./About";
import Features from "./Features";

const PublicLandingPage = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const user = (() => {
      try {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    })();

    if (user) {
      // User is logged in, redirect to appropriate dashboard
      const role = user?.user_type || user?.role || "user";
      
      if (role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "guide") {
        navigate("/guide-dashboard", { replace: true });
      } else if (role === "tourist") {
        navigate("/tourist-dashboard", { replace: true });
      } else {
        // Fallback to login if unknown role
        navigate("/login", { replace: true });
      }
    } else {
      // Not logged in, show landing page
      setIsChecking(false);
    }
  }, [navigate]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero />
      <About />
      <Features />
    </>
  );
};

export default PublicLandingPage;

