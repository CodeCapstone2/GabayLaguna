<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'itinerary_id',
        'point_of_interest_id',
        'title',
        'description',
        'day_number',
        'start_time',
        'end_time',
        'duration_minutes',
        'order_sequence',
        'activity_type',
        'additional_cost',
        'notes',
        'custom_location',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'additional_cost' => 'decimal:2',
        'custom_location' => 'array',
    ];

    /**
     * Get the itinerary that owns this item
     */
    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }

    /**
     * Get the point of interest for this item
     */
    public function pointOfInterest()
    {
        return $this->belongsTo(PointOfInterest::class);
    }

    /**
     * Scope to get items for a specific day
     */
    public function scopeForDay($query, $dayNumber)
    {
        return $query->where('day_number', $dayNumber)->orderBy('order_sequence');
    }

    /**
     * Scope to get items by activity type
     */
    public function scopeByActivityType($query, $type)
    {
        return $query->where('activity_type', $type);
    }

    /**
     * Get formatted time range
     */
    public function getTimeRangeAttribute()
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }

    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute()
    {
        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }
}



