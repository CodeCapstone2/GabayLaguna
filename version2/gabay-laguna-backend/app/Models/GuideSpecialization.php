<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuideSpecialization extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_guide_id',
        'category_id',
    ];

    /**
     * Get the tour guide that owns this specialization
     */
    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class);
    }

    /**
     * Get the category for this specialization
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
