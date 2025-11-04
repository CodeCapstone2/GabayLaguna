# Activity Diagram Alignment - Tourist Guide Browsing and Booking Journey

This document describes how the Gabay Laguna system aligns with the Activity Diagram titled "Activity Diagram of the Tourist Guide Browsing and Booking Journey" for Chapter 3 of the manuscript.

## System Flow Alignment

### 1. Tourist Login ✅
- **System Implementation**: Login page (`/login`)
- **User Action**: Tourist logs into the system
- **Location**: `gabay-laguna-frontend/src/pages/Login.jsx`

### 2. Access Interactive Map ✅
- **System Implementation**: Interactive Map component displayed in Tourist Dashboard
- **User Action**: Tourist accesses the interactive map after logging in
- **Location**: 
  - `gabay-laguna-frontend/src/components/InteractiveMap.jsx`
  - `gabay-laguna-frontend/src/pages/TouristDashboard.jsx`

### 3. Select Location ✅
- **System Implementation**: Cities List page
- **User Action**: Tourist selects a desired location (city)
- **System Response**: System displays Points of Interest for that location
- **Location**: `gabay-laguna-frontend/src/pages/CitiesList.jsx`

### 4. Select Category ✅
- **System Implementation**: POIs page with category filtering
- **User Action**: Tourist selects a category for points of interest (e.g., nature spots, historical sites)
- **System Response**: System filters and displays POIs by selected category
- **Location**: `gabay-laguna-frontend/src/pages/POIs.jsx`

### 5. Click Location → View Location Details ✅
- **System Implementation**: POI detail cards with full information
- **User Action**: Tourist clicks on a specific location to view details
- **System Response**: System displays detailed information about that specific location
- **Location**: `gabay-laguna-frontend/src/pages/POIs.jsx`

### 6. View List of Available Tour Guides (Name, Rating, Price) ✅
- **System Implementation**: POI Guides page
- **User Action**: Tourist clicks "View Available Guides" on a POI
- **System Response**: System displays a list of available tour guides showing:
  - **Name**: Guide's full name (prominently displayed)
  - **Rating**: Star rating (⭐ X.X / 5.0) with review count
  - **Price**: Hourly rate (₱XXX / hour)
- **Location**: `gabay-laguna-frontend/src/pages/POIGuides.jsx`

### 7. Select a Guide Profile → Display Guide Details (Bio, Services, Availability) ✅
- **System Implementation**: Public Guide Profile page
- **User Action**: Tourist selects a specific guide's profile
- **System Response**: System displays comprehensive guide details:
  - **Bio**: Guide's biography (prominently displayed)
  - **Services**: Specializations and categories the guide offers
  - **Availability**: Current availability status and available days with time slots
- **Location**: `gabay-laguna-frontend/src/pages/PublicGuideProfile.jsx`

### 8. Check Tourist Satisfaction → Change Guide / Book Guide ✅
- **System Implementation**: Booking page with "Change Guide" option
- **User Action**: 
  - If **satisfied**: Tourist proceeds to book the guide
  - If **not satisfied**: Tourist clicks "Change Guide" button
- **System Response**: 
  - If changing guide: System clears selected guide and allows tourist to return to guide selection
  - If satisfied: Tourist proceeds to booking form
- **Location**: `gabay-laguna-frontend/src/pages/BookingPage.jsx`

### 9. Book Guide ✅
- **System Implementation**: Complete booking form with payment options
- **User Action**: Tourist finalizes the booking by filling in details and submitting
- **System Response**: Booking created, confirmation sent
- **Location**: `gabay-laguna-frontend/src/pages/BookingPage.jsx`

## Key Enhancements Made for Activity Diagram Alignment

### POIGuides Page (`POIGuides.jsx`)
- **Enhanced Display**: Guide cards now prominently display:
  - Guide Name (bold, larger font, primary color)
  - Rating (star badge with X.X/5.0 format and review count)
  - Price (highlighted badge showing ₱XXX/hour)
- **Improved Description**: Added instructional text explaining the Name, Rating, Price display

### PublicGuideProfile Page (`PublicGuideProfile.jsx`)
- **Enhanced Bio Display**: Biography section prominently displayed with clear heading
- **Enhanced Services Display**: 
  - Shows specializations/categories as badges
  - Displays transportation type if available
- **Enhanced Availability Display**:
  - Shows current availability status (Available/Unavailable badge)
  - Displays available days with time slots in organized format
  - Fetches availability data from API if not included in initial response

### BookingPage (`BookingPage.jsx`)
- **Enhanced Change Guide Flow**:
  - "Change Guide" button properly clears guide selection and loops back to guide selection
  - Improved navigation to guide selection page with proper state passing
  - Added instructional text explaining the guide selection process

### POIs Page (`POIs.jsx`)
- **Enhanced Instructions**: Added descriptive text explaining that locations show available guides with Name, Rating, and Price
- **Improved Button Label**: Changed "View Guides" to "View Available Guides" for clarity

## API Endpoints Supporting the Flow

### Backend Endpoints:
1. **GET `/api/cities`** - List all cities (location selection)
2. **GET `/api/cities/{cityId}/pois`** - Get POIs for a city
3. **GET `/api/pois/{poiId}/guides`** - Get available guides for a POI
4. **GET `/api/guides/{guideId}`** - Get guide details (Bio, Services, Availability)
5. **GET `/api/guides/{guideId}/availability`** - Get guide availability schedule
6. **GET `/api/guides/{guideId}/reviews`** - Get guide reviews (for rating calculation)
7. **POST `/api/bookings`** - Create a booking

## User Journey Flow Diagram

```
Login → Tourist Dashboard → Interactive Map
  ↓
Cities List (Select Location)
  ↓
POIs Page (Select Category, Click Location)
  ↓
POI Guides Page (View List: Name, Rating, Price)
  ↓
Public Guide Profile (View Details: Bio, Services, Availability)
  ↓
Booking Page (Check Satisfaction)
  ├─ Not Satisfied → Change Guide → Loop back to Guide Selection
  └─ Satisfied → Book Guide → Booking Confirmation
```

## Technical Implementation Details

### Frontend Components:
- **React Router**: Handles navigation between pages
- **State Management**: Uses React state and navigation state to pass data between pages
- **API Integration**: Axios for API calls with proper error handling
- **Responsive Design**: Bootstrap components for mobile-friendly interface

### Key Features:
- **Category Filtering**: Dynamic category filtering on POIs page
- **Guide Filtering**: Backend filters guides by location and POI
- **Rating Calculation**: Average rating calculated from reviews
- **Availability Check**: Real-time availability checking before booking
- **Change Guide Loop**: Proper state management for returning to guide selection

## Alignment Verification

✅ All user actions from the activity diagram are implemented
✅ All system responses from the activity diagram are implemented
✅ Flow control (Change Guide loop) is properly implemented
✅ All required information (Name, Rating, Price, Bio, Services, Availability) is prominently displayed
✅ Navigation flow matches the activity diagram sequence

## Notes for Chapter 3 Manuscript

The system implementation fully supports the activity diagram described in Chapter 3. Each step in the activity diagram corresponds to a specific page or component in the system, ensuring that:

1. Tourist actions are clearly supported by UI elements
2. System responses display the required information at each step
3. The "Change Guide" decision point allows tourists to loop back if not satisfied
4. The booking process completes the journey as specified in the activity diagram

The implementation provides a seamless user experience that matches the theoretical flow described in the activity diagram.

