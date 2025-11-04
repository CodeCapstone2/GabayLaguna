<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'tourist_id',
        'tour_guide_id',
        'point_of_interest_id',
        'itinerary_id',
        'tour_date',
        'start_time',
        'end_time',
        'duration_hours',
        'number_of_people',
        'special_requests',
        'status',
        'total_amount',
        'itinerary_customizations',
    ];

    protected $casts = [
        'tour_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'total_amount' => 'decimal:2',
        'itinerary_customizations' => 'array',
    ];

    /**
     * Get the tourist that made this booking
     */
    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    /**
     * Get the tour guide for this booking
     */
    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class);
    }

    /**
     * Get the point of interest for this booking
     */
    public function pointOfInterest()
    {
        return $this->belongsTo(PointOfInterest::class);
    }

    /**
     * Get the payment for this booking
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the review for this booking
     */
    public function review()
    {
        return $this->hasOne(Review::class);
    }

    /**
     * Scope to get only pending bookings
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get only confirmed bookings
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Get the guide's location for this booking
     */
    public function guideLocation()
    {
        return $this->hasOne(GuideLocation::class)->active()->latest('last_updated_at');
    }

    /**
     * Get all guide locations for this booking
     */
    public function guideLocations()
    {
        return $this->hasMany(GuideLocation::class);
    }

    /**
     * Get the itinerary for this booking
     */
    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }

    /**
     * Check if this booking is itinerary-based
     */
    public function isItineraryBased()
    {
        return !is_null($this->itinerary_id);
    }

    /**
     * Get the itinerary items for this booking
     */
    public function itineraryItems()
    {
        return $this->hasManyThrough(
            ItineraryItem::class,
            Itinerary::class,
            'id',
            'itinerary_id',
            'itinerary_id',
            'id'
        );
    }
}
