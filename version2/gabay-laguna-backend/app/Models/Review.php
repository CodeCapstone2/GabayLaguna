<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'tourist_id',
        'tour_guide_id',
        'booking_id',
        'rating',
        'comment',
        'is_verified',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
    ];

    /**
     * Get the tourist that wrote this review
     */
    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    /**
     * Get the tour guide that was reviewed
     */
    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class);
    }

    /**
     * Get the booking associated with this review
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Scope to get only verified reviews
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope to get reviews by rating
     */
    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }
}
