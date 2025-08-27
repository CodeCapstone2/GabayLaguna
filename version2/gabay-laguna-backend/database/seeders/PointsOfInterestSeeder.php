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
                'name' => 'Pagsanjan Falls',
                'description' => 'One of the most famous waterfalls in the Philippines, featuring thrilling boat rides through narrow gorges and spectacular cascading waters.',
                'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                'city_id' => $cities['Pagsanjan'] ?? 1,
                'category_id' => $categories['Waterfalls/Adventure'] ?? 1,
                'latitude' => 14.273889,
                'longitude' => 121.452222,
                'address' => 'Pagsanjan, Laguna',
                'operating_hours' => '8:00 AM - 5:00 PM daily',
                'entrance_fee' => 500.00,
                'is_active' => true
            ],
            [
                'name' => 'Enchanted Kingdom',
                'description' => 'The first and only world-class theme park in the Philippines featuring thrilling rides, shows, and attractions for the whole family.',
                'image' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
                'city_id' => $cities['Sta. Rosa'] ?? 2,
                'category_id' => $categories['Theme Parks'] ?? 2,
                'latitude' => 14.327778,
                'longitude' => 121.079722,
                'address' => 'Sta. Rosa, Laguna',
                'operating_hours' => '10:00 AM - 8:00 PM (weekdays), 9:00 AM - 9:00 PM (weekends)',
                'entrance_fee' => 1200.00,
                'is_active' => true
            ],
            [
                'name' => 'Lake Caliraya',
                'description' => 'A man-made lake surrounded by lush mountains, perfect for water sports, fishing, and relaxing getaways.',
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
                'city_id' => $cities['Lumban'] ?? 3,
                'category_id' => $categories['Lakes/Nature'] ?? 3,
                'latitude' => 14.316667,
                'longitude' => 121.533333,
                'address' => 'Lumban, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 50.00,
                'is_active' => true
            ],
            [
                'name' => 'Nagcarlan Underground Cemetery',
                'description' => 'A historical underground cemetery built in 1845, serving as a secret meeting place for revolutionaries during the Spanish era.',
                'image' => 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800',
                'city_id' => $cities['Nagcarlan'] ?? 4,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.136111,
                'longitude' => 121.416389,
                'address' => 'Nagcarlan, Laguna',
                'operating_hours' => '8:00 AM - 5:00 PM daily',
                'entrance_fee' => 20.00,
                'is_active' => true
            ],
            [
                'name' => 'Rizal Shrine',
                'description' => 'The ancestral home of Dr. Jose Rizal, the national hero of the Philippines, featuring well-preserved artifacts and historical exhibits.',
                'image' => 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800',
                'city_id' => $cities['Calamba'] ?? 5,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.183333,
                'longitude' => 121.166667,
                'address' => 'Calamba, Laguna',
                'operating_hours' => '8:00 AM - 5:00 PM daily',
                'entrance_fee' => 30.00,
                'is_active' => true
            ],
            [
                'name' => 'Pila Heritage Town',
                'description' => 'A well-preserved Spanish colonial town with ancestral houses and historical landmarks dating back to the 16th century.',
                'image' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                'city_id' => $cities['Pila'] ?? 6,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.233333,
                'longitude' => 121.366667,
                'address' => 'Pila, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Makiling Botanic Gardens',
                'description' => 'A beautiful botanical garden at the foot of Mount Makiling featuring diverse plant species, hiking trails, and educational tours.',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
                'city_id' => $cities['Los Baños'] ?? 7,
                'category_id' => $categories['Gardens/Parks'] ?? 5,
                'latitude' => 14.133333,
                'longitude' => 121.200000,
                'address' => 'Los Baños, Laguna',
                'operating_hours' => '8:00 AM - 5:00 PM daily',
                'entrance_fee' => 25.00,
                'is_active' => true
            ],
            [
                'name' => 'Hot Springs Resort',
                'description' => 'A relaxing resort featuring natural hot spring pools known for their therapeutic properties and healing minerals.',
                'image' => 'https://images.unsplash.com/photo-1561503972-83b7c429a728?w=800',
                'city_id' => $cities['Los Baños'] ?? 7,
                'category_id' => $categories['Resorts/Spas'] ?? 6,
                'latitude' => 14.166667,
                'longitude' => 121.216667,
                'address' => 'Los Baños, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 300.00,
                'is_active' => true
            ],
            [
                'name' => 'San Pablo Seven Lakes',
                'description' => 'A cluster of seven crater lakes formed by volcanic activity, each with unique characteristics and scenic beauty.',
                'image' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
                'city_id' => $cities['San Pablo City'] ?? 8,
                'category_id' => $categories['Lakes/Nature'] ?? 3,
                'latitude' => 14.066667,
                'longitude' => 121.333333,
                'address' => 'San Pablo City, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Pandin Lake',
                'description' => 'The cleanest and most pristine among the Seven Lakes, offering bamboo raft rides and fresh local cuisine.',
                'image' => 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                'city_id' => $cities['San Pablo City'] ?? 8,
                'category_id' => $categories['Lakes/Nature'] ?? 3,
                'latitude' => 14.116667,
                'longitude' => 121.366667,
                'address' => 'San Pablo City, Laguna',
                'operating_hours' => '6:00 AM - 6:00 PM daily',
                'entrance_fee' => 100.00,
                'is_active' => true
            ],
            [
                'name' => 'Mount Makiling',
                'description' => 'A dormant volcano and protected forest reserve known for its rich biodiversity, hiking trails, and mystical legends.',
                'image' => 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800',
                'city_id' => $cities['Los Baños'] ?? 7,
                'category_id' => $categories['Gardens/Parks'] ?? 5,
                'latitude' => 14.133333,
                'longitude' => 121.200000,
                'address' => 'Los Baños, Laguna',
                'operating_hours' => '6:00 AM - 3:00 PM daily',
                'entrance_fee' => 50.00,
                'is_active' => true
            ],
            [
                'name' => 'Liliw Footwear Capital',
                'description' => 'Famous for its local footwear industry, featuring rows of shops selling quality handmade shoes and slippers.',
                'image' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
                'city_id' => $cities['Liliw'] ?? 9,
                'category_id' => $categories['Shopping/Artisan'] ?? 7,
                'latitude' => 14.133333,
                'longitude' => 121.433333,
                'address' => 'Liliw, Laguna',
                'operating_hours' => '8:00 AM - 7:00 PM daily',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Paete Woodcarving Village',
                'description' => 'Known as the \'Woodcarving Capital of the Philippines\', featuring skilled artisans and beautiful handcrafted religious icons.',
                'image' => 'https://images.unsplash.com/photo-1580637250481-b5c6dfa22c99?w=800',
                'city_id' => $cities['Paete'] ?? 10,
                'category_id' => $categories['Shopping/Artisan'] ?? 7,
                'latitude' => 14.366667,
                'longitude' => 121.483333,
                'address' => 'Paete, Laguna',
                'operating_hours' => '8:00 AM - 6:00 PM daily',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Majayjay Falls',
                'description' => 'A beautiful cascading waterfall with natural pools, surrounded by lush tropical vegetation and perfect for swimming.',
                'image' => 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800',
                'city_id' => $cities['Majayjay'] ?? 11,
                'category_id' => $categories['Waterfalls/Adventure'] ?? 1,
                'latitude' => 14.150000,
                'longitude' => 121.466667,
                'address' => 'Majayjay, Laguna',
                'operating_hours' => '7:00 AM - 5:00 PM daily',
                'entrance_fee' => 40.00,
                'is_active' => true
            ],
            [
                'name' => 'Crocodile Lake',
                'description' => 'The largest among the Seven Lakes, known for its crocodile-shaped perimeter and rich aquatic ecosystem.',
                'image' => 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800',
                'city_id' => $cities['San Pablo City'] ?? 8,
                'category_id' => $categories['Lakes/Nature'] ?? 3,
                'latitude' => 14.083333,
                'longitude' => 121.333333,
                'address' => 'San Pablo City, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'University of the Philippines Los Baños',
                'description' => 'A premier academic institution and research university set amidst lush greenery and historical landmarks.',
                'image' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
                'city_id' => $cities['Los Baños'] ?? 7,
                'category_id' => $categories['Educational'] ?? 8,
                'latitude' => 14.166667,
                'longitude' => 121.233333,
                'address' => 'Los Baños, Laguna',
                'operating_hours' => '24/7',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Bunga Falls',
                'description' => 'A stunning waterfall with multiple tiers and natural pools, offering a refreshing escape into nature.',
                'image' => 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
                'city_id' => $cities['Nagcarlan'] ?? 4, // Using Nagcarlan since it's in Nagcarlan
                'category_id' => $categories['Waterfalls/Adventure'] ?? 1,
                'latitude' => 14.233333,
                'longitude' => 121.500000,
                'address' => 'Nagcarlan, Laguna',
                'operating_hours' => '7:00 AM - 5:00 PM daily',
                'entrance_fee' => 30.00,
                'is_active' => true
            ],
            [
                'name' => 'Pangil River Rapids',
                'description' => 'A thrilling river adventure with natural rapids, perfect for tubing and water activities amidst scenic landscapes.',
                'image' => 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800',
                'city_id' => $cities['Pangil'] ?? 13,
                'category_id' => $categories['Waterfalls/Adventure'] ?? 1,
                'latitude' => 14.400000,
                'longitude' => 121.466667,
                'address' => 'Pangil, Laguna',
                'operating_hours' => '8:00 AM - 4:00 PM daily',
                'entrance_fee' => 200.00,
                'is_active' => true
            ],
            [
                'name' => 'Luisiana Church',
                'description' => 'A centuries-old Spanish colonial church with beautiful architecture and historical significance in the region.',
                'image' => 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800',
                'city_id' => $cities['Luisiana'] ?? 14,
                'category_id' => $categories['Historical/Cultural'] ?? 4,
                'latitude' => 14.183333,
                'longitude' => 121.516667,
                'address' => 'Luisiana, Laguna',
                'operating_hours' => '6:00 AM - 6:00 PM daily',
                'entrance_fee' => 0.00,
                'is_active' => true
            ],
            [
                'name' => 'Calauan Nature Park',
                'description' => 'An eco-tourism park featuring wildlife, botanical gardens, and recreational facilities for family outings.',
                'image' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
                'city_id' => $cities['Calauan'] ?? 15,
                'category_id' => $categories['Gardens/Parks'] ?? 5,
                'latitude' => 14.150000,
                'longitude' => 121.316667,
                'address' => 'Calauan, Laguna',
                'operating_hours' => '8:00 AM - 5:00 PM daily',
                'entrance_fee' => 80.00,
                'is_active' => true
            ]
        ];

        foreach ($pois as $poiData) {
            PointOfInterest::create($poiData);
        }
    }
}