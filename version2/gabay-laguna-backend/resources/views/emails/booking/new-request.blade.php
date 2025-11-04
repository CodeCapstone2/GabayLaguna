@component('mail::message')
# New Booking Request

Hello {{ $guide->name }},

You have received a new booking request!

**Booking Details:**
- **Booking ID:** #{{ $booking->id }}
- **Tourist:** {{ $tourist->name }}
- **Email:** {{ $tourist->email }}
- **Location:** {{ isset($poi) && $poi ? $poi->name : 'N/A' }}
- **Date:** {{ $booking->tour_date }}
- **Time:** {{ isset($booking->start_time) && isset($booking->end_time) ? $booking->start_time . ' - ' . $booking->end_time : ($booking->tour_time ?? 'N/A') }}
- **Duration:** {{ $booking->duration_hours ?? 'N/A' }} hour(s)
- **Number of People:** {{ $booking->number_of_people ?? 1 }}
- **Status:** {{ ucfirst($booking->status ?? 'Pending') }}

@if(isset($booking->special_requests) && !empty($booking->special_requests))
**Special Requests:**
{{ $booking->special_requests }}
@endif

Please review and respond to this booking request in your dashboard.

@component('mail::button', ['url' => config('app.url') . '/guide/bookings'])
View Booking
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent

