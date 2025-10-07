# Geolocation Tracking Feature

## Overview
The geolocation tracking feature allows tourists to track their guide's real-time location during confirmed tours. This enhances safety and provides better coordination between tourists and guides.

## Features

### For Tourists:
- View guide's current location on an interactive map
- See guide's movement status (online, recently active, offline)
- Track guide's location history
- Real-time location updates every 30 seconds
- View guide's contact information and tour details

### For Guides:
- Share their location with tourists during tours
- Start/stop location tracking for specific bookings
- Update location manually or automatically
- View location accuracy and movement data

## Backend Implementation

### Database Schema
- **guide_locations** table stores location data with:
  - GPS coordinates (latitude, longitude)
  - Address information
  - Accuracy, speed, and heading data
  - Active status and timestamps
  - Association with bookings and tour guides

### API Endpoints

#### Guide Endpoints:
- `POST /api/guide/location/update` - Update guide's current location
- `GET /api/guide/active-bookings` - Get bookings with location tracking
- `POST /api/guide/bookings/{booking}/start-tracking` - Start location tracking
- `POST /api/guide/bookings/{booking}/stop-tracking` - Stop location tracking

#### Tourist Endpoints:
- `GET /api/bookings/{booking}/guide-location` - Get guide's current location
- `GET /api/bookings/{booking}/location-history` - Get guide's location history

### Models
- **GuideLocation** - Manages location data with relationships to TourGuide and Booking
- **TourGuide** - Extended with location relationships
- **Booking** - Extended with location tracking capabilities

## Frontend Implementation

### Components

#### GuideLocationTracker.jsx
- Displays guide's location on Google Maps
- Shows real-time location updates
- Displays guide information and movement status
- Auto-refreshes every 30 seconds

#### GuideLocationUpdater.jsx
- Allows guides to share their location
- Handles GPS permissions and location updates
- Provides start/stop tracking controls
- Shows current location details

### Integration
- **MyBookings.jsx** - Added "Track Guide" button for confirmed bookings
- **GuideBookings.jsx** - Added "Share Location" button for guides
- Modal dialogs for location tracking interface

## Setup Instructions

### 1. Backend Setup
```bash
# Run the migration to create the guide_locations table
php artisan migrate

# The LocationController and routes are already configured
```

### 2. Frontend Setup
```bash
# Google Maps API key needs to be configured
# Replace YOUR_GOOGLE_MAPS_API_KEY in public/index.html with actual API key
```

### 3. Google Maps API Configuration
1. Get a Google Maps API key from Google Cloud Console
2. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
3. Replace `YOUR_GOOGLE_MAPS_API_KEY` in `public/index.html`

### 4. Optional: OpenCage Geocoding API
For reverse geocoding (getting addresses from coordinates):
1. Sign up at OpenCage Data
2. Get an API key
3. Replace `YOUR_OPENCAGE_API_KEY` in `GuideLocationUpdater.jsx`

## Usage Flow

### For Tourists:
1. Book a tour with a guide
2. When booking is confirmed, "Track Guide" button appears
3. Click "Track Guide" to open location tracking modal
4. View guide's real-time location on map
5. Location updates automatically every 30 seconds

### For Guides:
1. Accept a booking from a tourist
2. When ready to start the tour, click "Share Location"
3. Grant location permissions when prompted
4. Click "Start Tracking" to begin sharing location
5. Location is automatically updated and shared with tourist
6. Click "Stop Tracking" when tour is complete

## Security Features
- Location data is only shared between guide and tourist for specific bookings
- Location tracking requires authentication
- Location data is automatically deactivated when tracking stops
- Only active locations are shown to tourists

## Privacy Considerations
- Location data is only stored temporarily during active tours
- Users must explicitly grant location permissions
- Location sharing can be stopped at any time
- Location history is limited to recent updates

## Technical Notes
- Uses HTML5 Geolocation API for GPS coordinates
- Google Maps JavaScript API for map display
- Real-time updates via polling (30-second intervals)
- Location data includes accuracy, speed, and heading information
- Automatic cleanup of old location data

## Future Enhancements
- WebSocket integration for real-time updates
- Push notifications for location changes
- Route tracking and history
- Geofencing for tour boundaries
- Offline location caching





