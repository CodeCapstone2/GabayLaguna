import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import PublicLandingPage from "./components/PublicLandingPage";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import SignupTourist from "./pages/SignupTourist";
import SignupGuide from "./pages/SignupGuide";
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
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminReports from "./pages/AdminReports";
import TouristReviews from "./pages/TouristReviews";
import GuideReviews from "./pages/GuideReviews";
import PublicGuideProfile from "./pages/PublicGuideProfile";
import Itineraries from "./pages/Itineraries";
import ItineraryDetail from "./pages/ItineraryDetail";
import PaymentSuccess from "./pages/PaymentSuccess";
import Sidebar from "./components/Sidebar";
import "./App.css";

const App = () => {
  const location = useLocation();
  const publicPaths = [
    "/login",
    "/signup/tourist",
    "/signup/guide",
  ];
  const isPublic = publicPaths.includes(location.pathname);
  const isHomePage = location.pathname === "/";
  
  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <Navbar />
        <div className="container-fluid px-3 mt-3">
          <div className="row g-3">
            {!isPublic && !isHomePage && (
              <div className="col-md-2 d-none d-md-block">
                <Sidebar />
              </div>
            )}
            <div className={isPublic || isHomePage ? "col-12" : "col-12 col-md-10"}>
              <main>
                <Routes>
                  <Route
                    path="/"
                    element={<PublicLandingPage />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup/tourist" element={<SignupTourist />} />
                  <Route path="/signup/guide" element={<SignupGuide />} />
                  <Route
                    path="/tourist-dashboard"
                    element={<TouristDashboard />}
                  />
                  <Route path="/guide-dashboard" element={<GuideDashboard />} />
                  <Route path="/tourist-profile" element={<TouristProfile />} />
                  <Route path="/guide-profile" element={<TourGuideProfile />} />
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/:guideId/:poiId"
                    element={<BookingPage />}
                  />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/guide-bookings" element={<GuideBookings />} />
                  <Route path="/tourist/reviews" element={<TouristReviews />} />
                  <Route path="/guide/reviews" element={<GuideReviews />} />
                  <Route path="/guide/:guideId/profile" element={<PublicGuideProfile />} />
                  <Route path="/cities" element={<CitiesList />} />
                  <Route path="/categories/:city" element={<CategoryList />} />
                  <Route path="/spots/:city/:category" element={<POIList />} />
                  <Route path="/city/:cityId/pois" element={<POIs />} />
                  <Route path="/poi/:poiId" element={<POIs />} />
                  <Route path="/poi/:poiId/guides" element={<POIGuides />} />
                  <Route path="/itineraries" element={<Itineraries />} />
                  <Route path="/itineraries/:id" element={<ItineraryDetail />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
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
                  <Route
                    path="/admin/user-management"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminUserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminReports />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
