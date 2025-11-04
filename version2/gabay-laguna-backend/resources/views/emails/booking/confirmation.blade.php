@component('mail::message')
# Booking Confirmation

Hello {{ $tourist->name }},

Your booking has been confirmed!

**Booking Details:**
- **Booking ID:** #{{ $booking->id }}
- **Guide:** {{ $guide->name }}
- **Location:** {{ isset($poi) && $poi ? $poi->name : 'N/A' }}
- **Date:** {{ $booking->tour_date }}
- **Time:** {{ isset($booking->start_time) && isset($booking->end_time) ? $booking->start_time . ' - ' . $booking->end_time : ($booking->tour_time ?? 'N/A') }}
- **Duration:** {{ $booking->duration_hours ?? 'N/A' }} hour(s)
- **Number of People:** {{ $booking->number_of_people ?? 1 }}
- **Status:** {{ ucfirst($booking->status) }}

@if(isset($booking->itinerary))
You have an itinerary associated with this booking. Please check your dashboard for details.
@endif

@component('mail::button', ['url' => config('app.url') . '/bookings/' . $booking->id])
View Booking
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent

