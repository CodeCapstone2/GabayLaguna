@component('mail::message')
# Booking Status Update

Hello {{ $tourist->name }},

Your booking status has been updated.

**Previous Status:** {{ ucfirst($oldStatus) }}  
**New Status:** {{ ucfirst($newStatus) }}

@if(isset($message))
{{ $message }}
@endif

**Booking Details:**
- **Booking ID:** #{{ $booking->id }}
- **Guide:** {{ $guide->name }}
- **Location:** {{ $booking->pointOfInterest->name ?? 'N/A' }}
- **Date:** {{ $booking->tour_date }}
- **Time:** {{ $booking->tour_time }}

@component('mail::button', ['url' => config('app.url') . '/bookings/' . $booking->id])
View Booking
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent

