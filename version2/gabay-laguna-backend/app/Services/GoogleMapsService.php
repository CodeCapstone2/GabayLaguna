<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GoogleMapsService
{
    protected $apiKey;
    protected $baseUrl = 'https://maps.googleapis.com/maps/api';

    public function __construct()
    {
        $this->apiKey = config('services.google.maps_api_key');
    }

    /**
     * Geocode an address to get coordinates
     */
    public function geocode(string $address): ?array
    {
        $cacheKey = 'geocode_' . md5($address);
        
        return Cache::remember($cacheKey, 3600, function () use ($address) {
            try {
                $response = Http::get("{$this->baseUrl}/geocode/json", [
                    'address' => $address,
                    'key' => $this->apiKey,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if ($data['status'] === 'OK' && !empty($data['results'])) {
                        $location = $data['results'][0]['geometry']['location'];
                        return [
                            'lat' => $location['lat'],
                            'lng' => $location['lng'],
                            'formatted_address' => $data['results'][0]['formatted_address'],
                        ];
                    }
                }
                
                Log::warning('Geocoding failed', [
                    'address' => $address,
                    'response' => $response->json()
                ]);
                
                return null;
            } catch (\Exception $e) {
                Log::error('Geocoding error', [
                    'address' => $address,
                    'error' => $e->getMessage()
                ]);
                return null;
            }
        });
    }

    /**
     * Reverse geocode coordinates to get address
     */
    public function reverseGeocode(float $lat, float $lng): ?array
    {
        $cacheKey = "reverse_geocode_{$lat}_{$lng}";
        
        return Cache::remember($cacheKey, 3600, function () use ($lat, $lng) {
            try {
                $response = Http::get("{$this->baseUrl}/geocode/json", [
                    'latlng' => "{$lat},{$lng}",
                    'key' => $this->apiKey,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if ($data['status'] === 'OK' && !empty($data['results'])) {
                        return [
                            'formatted_address' => $data['results'][0]['formatted_address'],
                            'components' => $this->parseAddressComponents($data['results'][0]['address_components']),
                        ];
                    }
                }
                
                return null;
            } catch (\Exception $e) {
                Log::error('Reverse geocoding error', [
                    'lat' => $lat,
                    'lng' => $lng,
                    'error' => $e->getMessage()
                ]);
                return null;
            }
        });
    }

    /**
     * Calculate distance between two points
     */
    public function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): array
    {
        $cacheKey = "distance_{$lat1}_{$lng1}_{$lat2}_{$lng2}";
        
        return Cache::remember($cacheKey, 3600, function () use ($lat1, $lng1, $lat2, $lng2) {
            try {
                $response = Http::get("{$this->baseUrl}/distancematrix/json", [
                    'origins' => "{$lat1},{$lng1}",
                    'destinations' => "{$lat2},{$lng2}",
                    'key' => $this->apiKey,
                    'units' => 'metric',
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if ($data['status'] === 'OK' && !empty($data['rows'][0]['elements'])) {
                        $element = $data['rows'][0]['elements'][0];
                        
                        if ($element['status'] === 'OK') {
                            return [
                                'distance' => $element['distance']['text'],
                                'distance_meters' => $element['distance']['value'],
                                'duration' => $element['duration']['text'],
                                'duration_seconds' => $element['duration']['value'],
                            ];
                        }
                    }
                }
                
                // Fallback to Haversine formula
                return $this->haversineDistance($lat1, $lng1, $lat2, $lng2);
            } catch (\Exception $e) {
                Log::error('Distance calculation error', [
                    'lat1' => $lat1,
                    'lng1' => $lng1,
                    'lat2' => $lat2,
                    'lng2' => $lng2,
                    'error' => $e->getMessage()
                ]);
                
                return $this->haversineDistance($lat1, $lng1, $lat2, $lng2);
            }
        });
    }

    /**
     * Find nearby places
     */
    public function findNearbyPlaces(float $lat, float $lng, string $type = 'tourist_attraction', int $radius = 5000): array
    {
        $cacheKey = "nearby_{$lat}_{$lng}_{$type}_{$radius}";
        
        return Cache::remember($cacheKey, 1800, function () use ($lat, $lng, $type, $radius) {
            try {
                $response = Http::get("{$this->baseUrl}/place/nearbysearch/json", [
                    'location' => "{$lat},{$lng}",
                    'radius' => $radius,
                    'type' => $type,
                    'key' => $this->apiKey,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if ($data['status'] === 'OK') {
                        return array_map(function ($place) {
                            return [
                                'place_id' => $place['place_id'],
                                'name' => $place['name'],
                                'vicinity' => $place['vicinity'],
                                'rating' => $place['rating'] ?? null,
                                'types' => $place['types'],
                                'geometry' => $place['geometry'],
                            ];
                        }, $data['results']);
                    }
                }
                
                return [];
            } catch (\Exception $e) {
                Log::error('Nearby places search error', [
                    'lat' => $lat,
                    'lng' => $lng,
                    'type' => $type,
                    'error' => $e->getMessage()
                ]);
                return [];
            }
        });
    }

    /**
     * Haversine formula for distance calculation (fallback)
     */
    protected function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): array
    {
        $earthRadius = 6371000; // Earth's radius in meters
        
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lngDelta / 2) * sin($lngDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;
        
        return [
            'distance' => round($distance / 1000, 2) . ' km',
            'distance_meters' => round($distance),
            'duration' => 'Unknown',
            'duration_seconds' => null,
        ];
    }

    /**
     * Parse address components from Google Maps response
     */
    protected function parseAddressComponents(array $components): array
    {
        $parsed = [];
        
        foreach ($components as $component) {
            $types = $component['types'];
            $value = $component['long_name'];
            
            if (in_array('locality', $types)) {
                $parsed['city'] = $value;
            } elseif (in_array('administrative_area_level_1', $types)) {
                $parsed['state'] = $value;
            } elseif (in_array('country', $types)) {
                $parsed['country'] = $value;
            } elseif (in_array('postal_code', $types)) {
                $parsed['postal_code'] = $value;
            }
        }
        
        return $parsed;
    }
}

