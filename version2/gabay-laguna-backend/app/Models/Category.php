<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the points of interest for this category
     */
    public function pointsOfInterest()
    {
        return $this->hasMany(PointOfInterest::class);
    }

    /**
     * Get the tour guides specialized in this category
     */
    public function tourGuides()
    {
        return $this->belongsToMany(TourGuide::class, 'guide_specializations');
    }

    /**
     * Scope to get only active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
