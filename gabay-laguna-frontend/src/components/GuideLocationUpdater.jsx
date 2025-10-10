import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_CONFIG from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";

const GuideLocationUpdater = ({ bookingId, onLocationUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    checkLocationPermission();

    return () => {
      stopLocationTracking();
    };
  }, []);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      setPermissionGranted(permission.state === "granted");

      permission.onchange = () => {
        setPermissionGranted(permission.state === "granted");
      };
    } catch (error) {
      console.log(
        "Permission API not supported, will request permission when needed"
      );
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY&language=en&pretty=1`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].formatted;
      }
      return null;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  };

  const updateLocationToServer = async (locationData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/guide/location/update`,
        {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          booking_id: bookingId,
          accuracy: locationData.accuracy,
          speed: locationData.speed,
          heading: locationData.heading,
          address: await getAddressFromCoordinates(
            locationData.latitude,
            locationData.longitude
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setCurrentLocation(locationData);
        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
      }
    } catch (error) {
      console.error("Error updating location:", error);
      setError("Failed to update location to server");
    } finally {
      setIsUpdating(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      setError(null);

      // Get initial position
      const position = await getCurrentPosition();
      await updateLocationToServer(position);

      // Start watching position
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              heading: position.coords.heading,
            };

            await updateLocationToServer(locationData);
          },
          (error) => {
            console.error("Geolocation error:", error);
            setError(`Location error: ${error.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      }

      setIsTracking(true);
    } catch (error) {
      console.error("Error starting location tracking:", error);
      setError(`Failed to start tracking: ${error.message}`);
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
  };

  const requestLocationPermission = () => {
    getCurrentPosition()
      .then(() => {
        setPermissionGranted(true);
        setError(null);
      })
      .catch((error) => {
        setError(`Permission denied: ${error.message}`);
        setPermissionGranted(false);
      });
  };

  const handleStartTracking = async () => {
    if (!permissionGranted) {
      await requestLocationPermission();
    }

    if (permissionGranted) {
      await startLocationTracking();
    }
  };

  const handleStopTracking = () => {
    stopLocationTracking();
  };

  const handleUpdateLocation = async () => {
    try {
      const position = await getCurrentPosition();
      await updateLocationToServer(position);
    } catch (error) {
      setError(`Failed to get location: ${error.message}`);
    }
  };

  return (
    <div className="guide-location-updater">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-location-arrow text-primary me-2"></i>
            Location Tracking
          </h5>
        </div>
        <div className="card-body">
          {/* Permission Status */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <div
                className={`status-indicator me-2 ${
                  permissionGranted ? "bg-success" : "bg-warning"
                }`}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                }}
              ></div>
              <span className="small">
                Location Permission:{" "}
                {permissionGranted ? "Granted" : "Not Granted"}
              </span>
            </div>
          </div>

          {/* Current Location Display */}
          {currentLocation && (
            <div className="current-location mb-3 p-3 bg-light rounded">
              <h6 className="mb-2">
                <i className="fas fa-map-marker-alt text-success me-2"></i>
                Current Location
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Latitude:</strong>{" "}
                    {currentLocation.latitude.toFixed(6)}
                  </p>
                  <p className="mb-1">
                    <strong>Longitude:</strong>{" "}
                    {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
                <div className="col-md-6">
                  {currentLocation.accuracy && (
                    <p className="mb-1">
                      <strong>Accuracy:</strong> ±
                      {currentLocation.accuracy.toFixed(0)}m
                    </p>
                  )}
                  {currentLocation.speed && (
                    <p className="mb-0">
                      <strong>Speed:</strong> {currentLocation.speed.toFixed(1)}{" "}
                      km/h
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Control Buttons */}
          <div className="d-flex gap-2 flex-wrap">
            {!isTracking ? (
              <button
                className="btn btn-success"
                onClick={handleStartTracking}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Starting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play me-2"></i>
                    Start Tracking
                  </>
                )}
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleStopTracking}>
                <i className="fas fa-stop me-2"></i>
                Stop Tracking
              </button>
            )}

            <button
              className="btn btn-outline-primary"
              onClick={handleUpdateLocation}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt me-2"></i>
                  Update Now
                </>
              )}
            </button>
          </div>

          {/* Tracking Status */}
          {isTracking && (
            <div className="mt-3">
              <div className="alert alert-info" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                Location tracking is active. Your location is being shared with
                the tourist.
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-3">
            <small className="text-muted">
              <strong>Instructions:</strong>
              <br />
              • Click "Start Tracking" to begin sharing your location
              <br />
              • Your location will be updated automatically every few seconds
              <br />
              • Click "Update Now" to manually update your location
              <br />• Click "Stop Tracking" when the tour is complete
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideLocationUpdater;
