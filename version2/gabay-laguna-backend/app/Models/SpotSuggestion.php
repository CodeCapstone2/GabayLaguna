<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpotSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_guide_id',
        'name',
        'description',
        'city_id',
        'latitude',
        'longitude',
        'status',
        'admin_notes'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the tour guide that submitted this suggestion
     */
    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class, 'tour_guide_id');
    }

    /**
     * Get the city for this suggestion
     */
    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }
}


