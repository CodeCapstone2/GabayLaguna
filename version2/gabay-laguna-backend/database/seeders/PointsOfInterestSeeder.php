<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PointOfInterest;
use App\Models\City;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class PointsOfInterestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get city IDs by name for dynamic mapping
        $cities = City::all()->pluck('id', 'name')->toArray();
        
        // Get category IDs by name for dynamic mapping  
        $categories = Category::all()->pluck('id', 'name')->toArray();

        $pois = [
            [
                'name' => 'Rizal Shrine',
                'description' => 'The ancestral home of Dr. Jose Rizal, the national hero of the Philippines, featuring well-preserved artifacts and historical exhibits.',
                'image' => 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800',
                'city_id' => $cities['Calamba'] ?? 5,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.2117,
                'longitude' => 121.1650,
                'address' => 'Calamba, Laguna',
                'operating_hours' => '8:00 AM - 5:00 PM daily',
                'entrance_fee' => 30.00,
                'is_active' => true
            ],
            [
                'name' => 'St. John the Baptist Parish Church',
                'description' => 'The historical church where Jose Rizal was baptized, featuring beautiful Spanish colonial architecture.',
                'image' => 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800',
                'city_id' => $cities['Calamba'] ?? 5,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.2117,
                'longitude' => 121.1650,
                'address' => 'Calamba, Laguna',
                'operating_hours' => '6:00 AM - 7:00 PM daily',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Calamba Jar',
                'description' => 'A famous landmark featuring a giant jar sculpture representing the city\'s cultural heritage.',
                'image' => 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
                'city_id' => $cities['Calamba'] ?? 5,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.2117,
                'longitude' => 121.1650,
                'address' => 'Calamba, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Mount Makiling',
                'description' => 'A dormant volcano and protected forest reserve known for its rich biodiversity, hiking trails, and mystical legends.',
                'image' => 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800',
                'city_id' => $cities['Calamba'] ?? 5,
                'category_id' => $categories['Gardens/Parks'] ?? 5,
                'latitude' => 14.1333,
                'longitude' => 121.2000,
                'address' => 'Calamba, Laguna',
                'operating_hours' => '6:00 AM - 3:00 PM daily',
                'entrance_fee' => 50.00,
                'is_active' => true
            ],
            [
                'name' => 'Calamba Springs',
                'description' => 'Natural hot springs resort featuring therapeutic pools known for their healing properties.',
                'image' => 'https://images.unsplash.com/photo-1561503972-83b7c429a728?w=800',
                'city_id' => $cities['Calamba'] ?? 5,
                'category_id' => $categories['Resorts/Spas'] ?? 6,
                'latitude' => 14.2117,
                'longitude' => 121.1650,
                'address' => 'Calamba, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 300.00,
                'is_active' => true
            ],
            [
                'name' => 'Lake Caliraya',
                'description' => 'A man-made lake surrounded by lush mountains, perfect for water sports, fishing, and relaxing getaways.',
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
                'city_id' => $cities['Calamba'] ?? 5,
                'category_id' => $categories['Lakes/Nature'] ?? 3,
                'latitude' => 14.3000,
                'longitude' => 121.4833,
                'address' => 'Calamba, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 50.00,
                'is_active' => true
            ],
            [
                'name' => 'Biñan Church',
                'description' => 'The historical San Pedro and San Pablo Parish Church with beautiful Baroque architecture.',
                'image' => 'https://images.unsplash.com/photo-1590422749897-dff2f2e91598?w=800',
                'city_id' => $cities['Biñan'] ?? 2,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.3333,
                'longitude' => 121.0833,
                'address' => 'Biñan, Laguna',
                'operating_hours' => '6:00 AM - 7:00 PM daily',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Biñan Plaza',
                'description' => 'A beautiful public plaza showcasing the city\'s historical heritage and serving as a community gathering place.',
                'image' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                'city_id' => $cities['Biñan'] ?? 2,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.3333,
                'longitude' => 121.0833,
                'address' => 'Biñan, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Old Biñan Municipal Hall',
                'description' => 'A well-preserved historical building that served as the city\'s municipal hall during the Spanish colonial period.',
                'image' => 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800',
                'city_id' => $cities['Biñan'] ?? 2,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.3333,
                'longitude' => 121.0833,
                'address' => 'Biñan, Laguna',
                'operating_hours' => '8:00 AM - 5:00 PM daily',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Biñan River',
                'description' => 'A scenic river that runs through the city, offering peaceful views and recreational opportunities.',
                'image' => 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
                'city_id' => $cities['Biñan'] ?? 2,
                'category_id' => $categories['Lakes/Nature'] ?? 3,
                'latitude' => 14.3333,
                'longitude' => 121.0833,
                'address' => 'Biñan, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Laguna de Bay',
                'description' => 'The largest lake in the Philippines, offering scenic views, fishing opportunities, and water activities.',
                'image' => 'https://images.unsplash.com/photo-1439066290691-510066268af5?w=800',
                'city_id' => $cities['San Pedro'] ?? 1,
                'category_id' => $categories['Lakes/Nature'] ?? 3,
                'latitude' => 14.3500,
                'longitude' => 121.0500,
                'address' => 'San Pedro, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Biñan Eco-Park',
                'description' => 'An eco-tourism park featuring lush greenery, recreational facilities, and environmental conservation areas.',
                'image' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
                'city_id' => $cities['Biñan'] ?? 2,
                'category_id' => $categories['Gardens/Parks'] ?? 5,
                'latitude' => 14.3333,
                'longitude' => 121.0833,
                'address' => 'Biñan, Laguna',
                'operating_hours' => '6:00 AM - 6:00 PM daily',
                'entrance_fee' => 50.00,
                'is_active' => true
            ]
        ];

        foreach ($pois as $poiData) {
            PointOfInterest::create($poiData);
        }
    }
}