import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";

const GuideLocationTracker = ({ bookingId, guide, poi }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const intervalRef = useRef(null);

  const updateMap = useCallback((locationData) => {
    if (!locationData || !mapRef.current) return;

    const { latitude, longitude } = locationData;

    // Force Leaflet only (Google Maps removed)

    // Leaflet fallback (no API key required)
    if (window.L) {
      if (!mapInstanceRef.current || !mapInstanceRef.current.__isLeaflet) {
        // Destroy any previous map instance bound to this element (fixes blank map after refresh)
        if (mapRef.current._leaflet_id) {
          try {
            const old =
              mapRef.current._leaflet_id && mapRef.current._leaflet_map;
            if (old && old.remove) old.remove();
          } catch {}
          // Leaflet 1.9+ provides a direct way to reuse: recreate map cleanly
        }

        mapInstanceRef.current = window.L.map(mapRef.current);
        mapInstanceRef.current.setView(
          [parseFloat(latitude), parseFloat(longitude)],
          15
        );
        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ).addTo(mapInstanceRef.current);
        mapInstanceRef.current.__isLeaflet = true;
      } else {
        mapInstanceRef.current.setView(
          [parseFloat(latitude), parseFloat(longitude)],
          mapInstanceRef.current.getZoom()
        );
      }

      // Remove existing marker (Leaflet)
      if (markerRef.current && markerRef.current.remove) {
        markerRef.current.remove();
      }

      markerRef.current = window.L.marker([
        parseFloat(latitude),
        parseFloat(longitude),
      ])
        .addTo(mapInstanceRef.current)
        .bindPopup(`${guide?.name || "Guide"}'s Location`);

      if (poi && poi.latitude && poi.longitude) {
        window.L.marker([parseFloat(poi.latitude), parseFloat(poi.longitude)])
          .addTo(mapInstanceRef.current)
          .bindPopup(poi.name || "Point of Interest");
      }
      return;
    }

    // Neither Google nor Leaflet available
    setError(
      "Map libraries failed to load. Please check your network connection."
    );
  }, [guide, poi]);

  const fetchGuideLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/bookings/${bookingId}/guide-location`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.location) {
        const loc = response.data.location;
        const normalized = {
          latitude:
            loc.latitude !== null && loc.latitude !== undefined
              ? parseFloat(loc.latitude)
              : null,
          longitude:
            loc.longitude !== null && loc.longitude !== undefined
              ? parseFloat(loc.longitude)
              : null,
          accuracy:
            loc.accuracy !== null && loc.accuracy !== undefined
              ? parseFloat(loc.accuracy)
              : null,
          speed:
            loc.speed !== null && loc.speed !== undefined
              ? parseFloat(loc.speed)
              : null,
          heading:
            loc.heading !== null && loc.heading !== undefined
              ? parseFloat(loc.heading)
              : null,
          address: loc.address || null,
          last_updated_at: loc.last_updated_at || null,
        };

        setLocation(normalized);
        setLastUpdate(
          normalized.last_updated_at
            ? new Date(normalized.last_updated_at)
            : null
        );
        setIsTracking(true);
        updateMap(normalized);
      } else {
        setLocation(null);
        setIsTracking(false);
      }
    } catch (error) {
      console.error("Error fetching guide location:", error);
      setError("Unable to fetch guide location");
      setIsTracking(false);
    } finally {
      setLoading(false);
    }
  }, [bookingId, updateMap]);

  const startLocationPolling = useCallback(() => {
    // Poll for location updates every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchGuideLocation();
    }, 30000);
  }, [fetchGuideLocation]);

  useEffect(() => {
    if (bookingId) {
      fetchGuideLocation();
      startLocationPolling();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bookingId, fetchGuideLocation, startLocationPolling]);

  const formatLastUpdate = (date) => {
    if (!date) return "Never";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  const getLocationStatus = () => {
    if (!location || !lastUpdate) return "offline";

    const now = new Date();
    const diffMs = now - lastUpdate;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins <= 2) return "online";
    if (diffMins <= 5) return "recent";
    return "offline";
  };


  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "recent":
        return "Recently Active";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading guide location...</p>
      </div>
    );
  }

  return (
    <div className="guide-location-tracker">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <i className="fas fa-map-marker-alt text-success me-2"></i>
          Guide Location
        </h5>
        <div className="d-flex align-items-center">
          <div
            className="status-indicator me-2"
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor:
                getLocationStatus() === "online"
                  ? "#28a745"
                  : getLocationStatus() === "recent"
                  ? "#ffc107"
                  : "#dc3545",
            }}
          ></div>
          <small className="text-muted">
            {getStatusText(getLocationStatus())}
          </small>
        </div>
      </div>

      {/* Guide Info */}
      {guide && (
        <div className="guide-info mb-3 p-3 bg-light rounded">
          <div className="d-flex align-items-center">
            <img
              src={guide.profile_picture || "/assets/logo.png"}
              alt={guide.name}
              className="rounded-circle me-3"
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
            <div>
              <h6 className="mb-1">{guide.name}</h6>
              <small className="text-muted">
                Last updated: {formatLastUpdate(lastUpdate)}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container mb-3">
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "300px",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        ></div>
      </div>

      {/* Location Details */}
      {location && (
        <div className="location-details">
          <div className="row">
            <div className="col-md-6">
              <div className="location-info p-3 bg-light rounded">
                <h6 className="mb-2">
                  <i className="fas fa-map-pin text-primary me-2"></i>
                  Current Location
                </h6>
                <p className="mb-1">
                  <strong>Address:</strong>{" "}
                  {location.address || "Address not available"}
                </p>
                <p className="mb-1">
                  <strong>Coordinates:</strong>{" "}
                  {typeof location.latitude === "number" &&
                  typeof location.longitude === "number"
                    ? `${location.latitude.toFixed(
                        6
                      )}, ${location.longitude.toFixed(6)}`
                    : "Not available"}
                </p>
                {location.accuracy && (
                  <p className="mb-0">
                    <strong>Accuracy:</strong> ±{location.accuracy}m
                  </p>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="movement-info p-3 bg-light rounded">
                <h6 className="mb-2">
                  <i className="fas fa-running text-info me-2"></i>
                  Movement Info
                </h6>
                {typeof location.speed === "number" && (
                  <p className="mb-1">
                    <strong>Speed:</strong> {location.speed.toFixed(1)} km/h
                  </p>
                )}
                {typeof location.heading === "number" && (
                  <p className="mb-1">
                    <strong>Direction:</strong> {location.heading.toFixed(0)}°
                  </p>
                )}
                <p className="mb-0">
                  <strong>Last Update:</strong> {formatLastUpdate(lastUpdate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* No Location State */}
      {!location && !error && (
        <div className="text-center py-4">
          <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
          <h6 className="text-muted">Guide location not available</h6>
          <p className="text-muted small">
            The guide may not have started location tracking yet or may be
            offline.
          </p>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={fetchGuideLocation}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh Location
          </button>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {isTracking && (
        <div className="text-center mt-3">
          <small className="text-muted">
            <i className="fas fa-sync-alt me-1"></i>
            Auto-refreshing every 30 seconds
          </small>
        </div>
      )}
    </div>
  );
};

export default GuideLocationTracker;
