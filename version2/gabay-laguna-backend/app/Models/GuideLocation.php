<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuideLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_guide_id',
        'booking_id',
        'latitude',
        'longitude',
        'address',
        'accuracy',
        'speed',
        'heading',
        'is_active',
        'last_updated_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'accuracy' => 'decimal:2',
        'speed' => 'decimal:2',
        'heading' => 'decimal:2',
        'is_active' => 'boolean',
        'last_updated_at' => 'datetime',
    ];

    /**
     * Get the tour guide that owns this location
     */
    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class);
    }

    /**
     * Get the booking associated with this location
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Scope to get only active locations
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get locations for a specific guide
     */
    public function scopeForGuide($query, $guideId)
    {
        return $query->where('tour_guide_id', $guideId);
    }

    /**
     * Scope to get locations for a specific booking
     */
    public function scopeForBooking($query, $bookingId)
    {
        return $query->where('booking_id', $bookingId);
    }

    /**
     * Scope to get recent locations (within last 5 minutes)
     */
    public function scopeRecent($query, $minutes = 5)
    {
        return $query->where('last_updated_at', '>=', now()->subMinutes($minutes));
    }
}
