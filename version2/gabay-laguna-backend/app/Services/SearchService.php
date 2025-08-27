<?php

namespace App\Services;

use App\Models\TourGuide;
use App\Models\City;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SearchService
{
    protected $googleMapsService;

    public function __construct(GoogleMapsService $googleMapsService)
    {
        $this->googleMapsService = $googleMapsService;
    }

    /**
     * Search tour guides with advanced filtering
     */
    public function searchTourGuides(array $filters = []): array
    {
        $query = TourGuide::with([
            'user',
            'specializations.category',
            'availabilities',
            'reviews',
            'bookings'
        ])->whereHas('user', function ($q) {
            $q->where('is_verified', true)
              ->where('is_active', true);
        });

        // Apply filters
        $query = $this->applyFilters($query, $filters);

        // Apply sorting
        $query = $this->applySorting($query, $filters['sort'] ?? 'rating');

        // Get paginated results
        $perPage = $filters['per_page'] ?? 15;
        $guides = $query->paginate($perPage);

        // Get facets for filtering
        $facets = $this->getFacets($filters);

        return [
            'guides' => $guides,
            'facets' => $facets,
            'total_count' => $guides->total(),
            'applied_filters' => $filters
        ];
    }

    /**
     * Apply filters to the query
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        // Location-based filtering
        if (!empty($filters['city_id'])) {
            $query->where('city_id', $filters['city_id']);
        }

        if (!empty($filters['location'])) {
            $query = $this->filterByLocation($query, $filters['location'], $filters['radius'] ?? 50);
        }

        // Category/specialization filtering
        if (!empty($filters['category_ids'])) {
            $categoryIds = is_array($filters['category_ids']) ? $filters['category_ids'] : [$filters['category_ids']];
            $query->whereHas('specializations', function ($q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds);
            });
        }

        // Language filtering
        if (!empty($filters['languages'])) {
            $languages = is_array($filters['languages']) ? $filters['languages'] : [$filters['languages']];
            $query->where(function ($q) use ($languages) {
                foreach ($languages as $language) {
                    $q->orWhere('languages', 'LIKE', "%{$language}%");
                }
            });
        }

        // Availability filtering
        if (!empty($filters['date'])) {
            $query = $this->filterByAvailability($query, $filters['date'], $filters['time'] ?? null);
        }

        // Price range filtering
        if (!empty($filters['min_price'])) {
            $query->where('hourly_rate', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('hourly_rate', '<=', $filters['max_price']);
        }

        // Experience filtering
        if (!empty($filters['min_experience'])) {
            $query->where('experience_years', '>=', $filters['min_experience']);
        }

        // Rating filtering
        if (!empty($filters['min_rating'])) {
            $query->whereHas('reviews', function ($q) use ($filters) {
                $q->havingRaw('AVG(rating) >= ?', [$filters['min_rating']]);
            });
        }

        // Transportation type filtering
        if (!empty($filters['transportation_type'])) {
            $query->where('transportation_type', $filters['transportation_type']);
        }

        // Verified guides only
        if (!empty($filters['verified_only'])) {
            $query->whereHas('user', function ($q) {
                $q->where('is_verified', true);
            });
        }

        // Available guides only (not fully booked)
        if (!empty($filters['available_only'])) {
            $query->whereDoesntHave('availabilities', function ($q) {
                $q->where('is_available', false);
            });
        }

        return $query;
    }

    /**
     * Filter by location using coordinates
     */
    protected function filterByLocation(Builder $query, string $location, int $radius = 50): Builder
    {
        $coordinates = $this->googleMapsService->geocode($location);
        
        if (!$coordinates) {
            return $query;
        }

        $lat = $coordinates['lat'];
        $lng = $coordinates['lng'];

        // Haversine formula for distance calculation
        $query->selectRaw("
            *,
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
        ", [$lat, $lng, $lat])
        ->having('distance', '<=', $radius)
        ->orderBy('distance');

        return $query;
    }

    /**
     * Filter by availability
     */
    protected function filterByAvailability(Builder $query, string $date, ?string $time = null): Builder
    {
        $dayOfWeek = date('l', strtotime($date));
        
        $query->whereHas('availabilities', function ($q) use ($date, $dayOfWeek, $time) {
            $q->where('day_of_week', strtolower($dayOfWeek))
              ->where('is_available', true);

            if ($time) {
                $q->where('start_time', '<=', $time)
                  ->where('end_time', '>=', $time);
            }
        });

        // Check for conflicting bookings
        $query->whereDoesntHave('bookings', function ($q) use ($date, $time) {
            $q->where('tour_date', $date)
              ->where('status', '!=', 'cancelled');

            if ($time) {
                $q->where('tour_time', $time);
            }
        });

        return $query;
    }

    /**
     * Apply sorting to the query
     */
    protected function applySorting(Builder $query, string $sortBy = 'rating'): Builder
    {
        switch ($sortBy) {
            case 'rating':
                $query->withAvg('reviews', 'rating')
                      ->orderByDesc('reviews_avg_rating')
                      ->orderBy('hourly_rate');
                break;

            case 'price_low':
                $query->orderBy('hourly_rate');
                break;

            case 'price_high':
                $query->orderByDesc('hourly_rate');
                break;

            case 'experience':
                $query->orderByDesc('experience_years');
                break;

            case 'distance':
                // Distance sorting is already applied in location filter
                break;

            case 'recent':
                $query->orderByDesc('created_at');
                break;

            default:
                $query->orderByDesc('created_at');
        }

        return $query;
    }

    /**
     * Get facets for filtering
     */
    protected function getFacets(array $filters = []): array
    {
        $cacheKey = 'search_facets_' . md5(serialize($filters));
        
        return Cache::remember($cacheKey, 1800, function () use ($filters) {
            $baseQuery = TourGuide::whereHas('user', function ($q) {
                $q->where('is_verified', true)
                  ->where('is_active', true);
            });

            // Apply same filters as main search (except pagination)
            unset($filters['page'], $filters['per_page'], $filters['sort']);
            $baseQuery = $this->applyFilters($baseQuery, $filters);

            return [
                'cities' => $this->getCityFacets($baseQuery),
                'categories' => $this->getCategoryFacets($baseQuery),
                'languages' => $this->getLanguageFacets($baseQuery),
                'price_ranges' => $this->getPriceRangeFacets($baseQuery),
                'experience_ranges' => $this->getExperienceRangeFacets($baseQuery),
                'transportation_types' => $this->getTransportationTypeFacets($baseQuery),
                'rating_ranges' => $this->getRatingRangeFacets($baseQuery),
            ];
        });
    }

    /**
     * Get city facets
     */
    protected function getCityFacets(Builder $baseQuery): array
    {
        return $baseQuery->join('cities', 'tour_guides.city_id', '=', 'cities.id')
            ->select('cities.id', 'cities.name', DB::raw('COUNT(*) as count'))
            ->groupBy('cities.id', 'cities.name')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get category facets
     */
    protected function getCategoryFacets(Builder $baseQuery): array
    {
        return $baseQuery->join('guide_specializations', 'tour_guides.id', '=', 'guide_specializations.tour_guide_id')
            ->join('categories', 'guide_specializations.category_id', '=', 'categories.id')
            ->select('categories.id', 'categories.name', DB::raw('COUNT(DISTINCT tour_guides.id) as count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get language facets
     */
    protected function getLanguageFacets(Builder $baseQuery): array
    {
        $languages = $baseQuery->pluck('languages')
            ->flatMap(function ($langString) {
                return array_map('trim', explode(',', $langString));
            })
            ->filter()
            ->countBy()
            ->sortDesc()
            ->take(10)
            ->map(function ($count, $language) {
                return [
                    'name' => $language,
                    'count' => $count
                ];
            })
            ->values()
            ->toArray();

        return $languages;
    }

    /**
     * Get price range facets
     */
    protected function getPriceRangeFacets(Builder $baseQuery): array
    {
        $ranges = [
            ['min' => 0, 'max' => 500, 'label' => 'Under ₱500'],
            ['min' => 500, 'max' => 1000, 'label' => '₱500 - ₱1,000'],
            ['min' => 1000, 'max' => 2000, 'label' => '₱1,000 - ₱2,000'],
            ['min' => 2000, 'max' => 5000, 'label' => '₱2,000 - ₱5,000'],
            ['min' => 5000, 'max' => null, 'label' => 'Over ₱5,000'],
        ];

        $facets = [];
        foreach ($ranges as $range) {
            $countQuery = clone $baseQuery;
            $countQuery->where('hourly_rate', '>=', $range['min']);
            
            if ($range['max'] !== null) {
                $countQuery->where('hourly_rate', '<', $range['max']);
            }

            $count = $countQuery->count();

            if ($count > 0) {
                $facets[] = [
                    'min' => $range['min'],
                    'max' => $range['max'],
                    'label' => $range['label'],
                    'count' => $count
                ];
            }
        }

        return $facets;
    }

    /**
     * Get experience range facets
     */
    protected function getExperienceRangeFacets(Builder $baseQuery): array
    {
        $ranges = [
            ['min' => 0, 'max' => 2, 'label' => '0-2 years'],
            ['min' => 2, 'max' => 5, 'label' => '2-5 years'],
            ['min' => 5, 'max' => 10, 'label' => '5-10 years'],
            ['min' => 10, 'max' => null, 'label' => '10+ years'],
        ];

        $facets = [];
        foreach ($ranges as $range) {
            $countQuery = clone $baseQuery;
            $countQuery->where('experience_years', '>=', $range['min']);
            
            if ($range['max'] !== null) {
                $countQuery->where('experience_years', '<', $range['max']);
            }

            $count = $countQuery->count();

            if ($count > 0) {
                $facets[] = [
                    'min' => $range['min'],
                    'max' => $range['max'],
                    'label' => $range['label'],
                    'count' => $count
                ];
            }
        }

        return $facets;
    }

    /**
     * Get transportation type facets
     */
    protected function getTransportationTypeFacets(Builder $baseQuery): array
    {
        return $baseQuery->select('transportation_type', DB::raw('COUNT(*) as count'))
            ->whereNotNull('transportation_type')
            ->groupBy('transportation_type')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->transportation_type,
                    'count' => $item->count
                ];
            })
            ->toArray();
    }

    /**
     * Get rating range facets
     */
    protected function getRatingRangeFacets(Builder $baseQuery): array
    {
        $ranges = [
            ['min' => 4.5, 'max' => 5.0, 'label' => '4.5+ stars'],
            ['min' => 4.0, 'max' => 4.5, 'label' => '4.0-4.5 stars'],
            ['min' => 3.5, 'max' => 4.0, 'label' => '3.5-4.0 stars'],
            ['min' => 3.0, 'max' => 3.5, 'label' => '3.0-3.5 stars'],
        ];

        $facets = [];
        foreach ($ranges as $range) {
            $countQuery = clone $baseQuery;
            $countQuery->whereHas('reviews', function ($q) use ($range) {
                $q->havingRaw('AVG(rating) >= ?', [$range['min']]);
                if ($range['max'] !== null) {
                    $q->havingRaw('AVG(rating) < ?', [$range['max']]);
                }
            });

            $count = $countQuery->count();

            if ($count > 0) {
                $facets[] = [
                    'min' => $range['min'],
                    'max' => $range['max'],
                    'label' => $range['label'],
                    'count' => $count
                ];
            }
        }

        return $facets;
    }

    /**
     * Get nearby tour guides
     */
    public function getNearbyTourGuides(float $lat, float $lng, int $radius = 50, int $limit = 10): array
    {
        $query = TourGuide::with([
            'user',
            'specializations.category',
            'reviews'
        ])->whereHas('user', function ($q) {
            $q->where('is_verified', true)
              ->where('is_active', true);
        });

        // Calculate distance and filter by radius
        $query->selectRaw("
            *,
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
        ", [$lat, $lng, $lat])
        ->having('distance', '<=', $radius)
        ->orderBy('distance')
        ->limit($limit);

        $guides = $query->get();

        return [
            'guides' => $guides,
            'total_count' => $guides->count(),
            'search_center' => ['lat' => $lat, 'lng' => $lng],
            'radius' => $radius
        ];
    }

    /**
     * Get search suggestions
     */
    public function getSearchSuggestions(string $query, int $limit = 5): array
    {
        $suggestions = [];

        // City suggestions
        $cities = City::where('name', 'LIKE', "%{$query}%")
            ->limit($limit)
            ->get();

        foreach ($cities as $city) {
            $suggestions[] = [
                'type' => 'city',
                'id' => $city->id,
                'name' => $city->name,
                'display' => "Tour guides in {$city->name}"
            ];
        }

        // Category suggestions
        $categories = Category::where('name', 'LIKE', "%{$query}%")
            ->limit($limit)
            ->get();

        foreach ($categories as $category) {
            $suggestions[] = [
                'type' => 'category',
                'id' => $category->id,
                'name' => $category->name,
                'display' => "{$category->name} tour guides"
            ];
        }

        // Language suggestions
        $languages = TourGuide::where('languages', 'LIKE', "%{$query}%")
            ->distinct()
            ->pluck('languages')
            ->flatMap(function ($langString) {
                return array_map('trim', explode(',', $langString));
            })
            ->filter(function ($lang) use ($query) {
                return stripos($lang, $query) !== false;
            })
            ->unique()
            ->take($limit)
            ->map(function ($language) {
                return [
                    'type' => 'language',
                    'name' => $language,
                    'display' => "Tour guides speaking {$language}"
                ];
            })
            ->values()
            ->toArray();

        $suggestions = array_merge($suggestions, $languages);

        return array_slice($suggestions, 0, $limit);
    }
}

