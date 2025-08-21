<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuideAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_guide_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_available' => 'boolean',
    ];

    /**
     * Get the tour guide that owns this availability
     */
    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class);
    }
}
