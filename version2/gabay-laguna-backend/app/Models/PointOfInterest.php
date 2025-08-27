<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointOfInterest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'image',
        'city_id',
        'category_id',
        'latitude',
        'longitude',
        'address',
        'operating_hours',
        'entrance_fee',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'entrance_fee' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the city that owns this point of interest
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Get the category that owns this point of interest
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the bookings for this point of interest
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Scope to get only active points of interest
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
