import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import SignupTourist from "./pages/SignupTourist";
import SignupGuide from "./pages/SignupGuide";
import AdminLogin from "./pages/AdminLogin";
import TouristDashboard from "./pages/TouristDashboard";
import GuideDashboard from "./pages/GuideDashboard";
import TouristProfile from "./pages/TouristProfile";
import TourGuideProfile from "./pages/TourGuideProfile";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import GuideBookings from "./pages/GuideBookings";
import POIGuides from "./pages/POIGuides";
import CitiesList from "./pages/CitiesList";
import POIs from "./pages/POIs";
import CategoryList from "./pages/CategoryList";
import POIList from "./pages/POIList";
import ProtectedRoute from "./components/ProtectedRoute";
import GuideLocationApplications from "./pages/GuideLocationApplications";
import GuideSpotSuggestions from "./pages/GuideSpotSuggestions";
import AdminLocationApplications from "./pages/AdminLocationApplications";
import AdminSpotSuggestions from "./pages/AdminSpotSuggestions";
import "./App.css";

const App = () => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <About />
                <Features />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/tourist" element={<SignupTourist />} />
          <Route path="/signup/guide" element={<SignupGuide />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/tourist-dashboard" element={<TouristDashboard />} />
          <Route path="/guide-dashboard" element={<GuideDashboard />} />
          <Route path="/tourist-profile" element={<TouristProfile />} />
          <Route path="/guide-profile" element={<TourGuideProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/booking/:guideId/:poiId" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/guide-bookings" element={<GuideBookings />} />
          <Route path="/cities" element={<CitiesList />} />
          <Route path="/categories/:city" element={<CategoryList />} />
          <Route path="/spots/:city/:category" element={<POIList />} />
          <Route path="/city/:cityId/pois" element={<POIs />} />
          <Route path="/poi/:poiId" element={<POIs />} />
          <Route path="/poi/:poiId/guides" element={<POIGuides />} />
          {/* Guide-only routes */}
          <Route
            path="/guide/location-applications"
            element={
              <ProtectedRoute allowedRoles={["guide"]}>
                <GuideLocationApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guide/spot-suggestions"
            element={
              <ProtectedRoute allowedRoles={["guide"]}>
                <GuideSpotSuggestions />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin/location-applications"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLocationApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/spot-suggestions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSpotSuggestions />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
