<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourGuide extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'license_number',
        'experience_years',
        'hourly_rate',
        'languages',
        'transportation_type',
        'is_verified',
        'is_available',
    ];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_available' => 'boolean',
    ];

    public function locationApplications()
    {
        return $this->hasMany(LocationApplication::class);
    }

    /**
     * Get the spot suggestions for this tour guide
     */
    public function spotSuggestions()
    {
        return $this->hasMany(SpotSuggestion::class);
    }

    /**
     * Get the user that owns this tour guide profile
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the bookings for this tour guide
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the availabilities for this tour guide
     */
    public function availabilities()
    {
        return $this->hasMany(GuideAvailability::class);
    }

    /**
     * Get the specializations for this tour guide
     */
    public function specializations()
    {
        return $this->hasMany(GuideSpecialization::class);
    }

    /**
     * Get the reviews for this tour guide
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the categories this tour guide specializes in
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'guide_specializations');
    }

    /**
     * Scope to get only verified guides
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope to get only available guides
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Get the current location for this tour guide
     */
    public function currentLocation()
    {
        return $this->hasOne(GuideLocation::class)->active()->latest('last_updated_at');
    }

    /**
     * Get all locations for this tour guide
     */
    public function locations()
    {
        return $this->hasMany(GuideLocation::class);
    }
}
