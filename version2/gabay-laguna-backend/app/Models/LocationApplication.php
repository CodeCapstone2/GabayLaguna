<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_guide_id',
        'city_id',
        'poi_id',
        'message',
        'status',
        'admin_notes'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class, 'tour_guide_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function pointOfInterest()
    {
        return $this->belongsTo(PointOfInterest::class, 'poi_id');
    }
}