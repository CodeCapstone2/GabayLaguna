<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'phone',
        'profile_picture',
        'is_verified',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    /**
     * Check if user is guide
     */
    public function isGuide(): bool
    {
        return $this->user_type === 'guide';
    }

    /**
     * Check if user is tourist
     */
    public function isTourist(): bool
    {
        return $this->user_type === 'tourist';
    }

    /**
     * Get the tour guide profile
     */
    public function tourGuide()
    {
        return $this->hasOne(TourGuide::class);
    }

    /**
     * Get tourist bookings
     */
    public function touristBookings()
    {
        return $this->hasMany(Booking::class, 'tourist_id');
    }

    /**
     * Get tourist reviews
     */
    public function touristReviews()
    {
        return $this->hasMany(Review::class, 'tourist_id');
    }
}
