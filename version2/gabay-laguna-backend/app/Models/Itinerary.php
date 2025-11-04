<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Itinerary extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'duration_type',
        'duration_days',
        'duration_hours',
        'base_price',
        'difficulty_level',
        'max_participants',
        'min_participants',
        'highlights',
        'included_items',
        'excluded_items',
        'requirements',
        'meeting_point',
        'meeting_instructions',
        'is_active',
        'is_featured',
        'image',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'highlights' => 'array',
        'included_items' => 'array',
        'excluded_items' => 'array',
        'requirements' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Get the itinerary items for this itinerary
     */
    public function items()
    {
        return $this->hasMany(ItineraryItem::class)->orderBy('day_number')->orderBy('order_sequence');
    }

    /**
     * Get the guides associated with this itinerary
     */
    public function guides()
    {
        return $this->belongsToMany(TourGuide::class, 'itinerary_guides')
                    ->withPivot(['is_primary', 'commission_rate', 'is_active'])
                    ->withTimestamps();
    }

    /**
     * Get the primary guide for this itinerary
     */
    public function primaryGuide()
    {
        return $this->guides()->wherePivot('is_primary', true)->first();
    }

    /**
     * Get bookings for this itinerary
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Scope to get only active itineraries
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get featured itineraries
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to filter by duration type
     */
    public function scopeByDurationType($query, $type)
    {
        return $query->where('duration_type', $type);
    }

    /**
     * Scope to filter by difficulty level
     */
    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    /**
     * Get the total duration in hours
     */
    public function getTotalDurationHoursAttribute()
    {
        return $this->duration_days * 24 + $this->duration_hours;
    }

    /**
     * Get formatted duration string
     */
    public function getFormattedDurationAttribute()
    {
        if ($this->duration_days > 1) {
            return "{$this->duration_days} days";
        } elseif ($this->duration_days == 1) {
            return "1 day";
        } else {
            return "{$this->duration_hours} hours";
        }
    }
}



