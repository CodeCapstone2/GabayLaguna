<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\PointOfInterest;
use App\Models\TourGuide;
use App\Models\City;
use Illuminate\Support\Facades\DB;

class ItinerarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get city IDs
        $cities = City::all()->pluck('id', 'name')->toArray();
        
        // Get POI IDs
        $pois = PointOfInterest::all()->pluck('id', 'name')->toArray();
        
        // Get guide IDs
        $guides = TourGuide::all()->pluck('id')->toArray();

        if (empty($guides)) {
            $this->command->warn('No tour guides found. Please seed tour guides first.');
            return;
        }

        $itineraries = [
            [
                'title' => 'Pagsanjan Falls Adventure',
                'description' => 'Experience the thrill of shooting the rapids to reach the majestic Pagsanjan Falls. This full-day adventure includes boat rides, waterfall visits, and local cuisine.',
                'duration_type' => 'full_day',
                'duration_days' => 1,
                'duration_hours' => 8,
                'base_price' => 2500.00,
                'difficulty_level' => 'moderate',
                'max_participants' => 8,
                'min_participants' => 2,
                'highlights' => [
                    'Shooting the rapids boat ride',
                    'Swimming at Pagsanjan Falls',
                    'Local Filipino lunch',
                    'Professional tour guide'
                ],
                'included_items' => [
                    'Round-trip boat ride',
                    'Professional tour guide',
                    'Lunch at local restaurant',
                    'Entrance fees',
                    'Life jackets'
                ],
                'excluded_items' => [
                    'Transportation to Pagsanjan',
                    'Personal expenses',
                    'Tips for boatmen'
                ],
                'requirements' => [
                    'Swimming attire',
                    'Waterproof bag',
                    'Extra clothes',
                    'Sunscreen',
                    'Camera'
                ],
                'meeting_point' => 'Pagsanjan Tourism Office',
                'meeting_instructions' => 'Meet at the tourism office at 8:00 AM. Please arrive 15 minutes early for briefing.',
                'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                'items' => [
                    [
                        'title' => 'Meet and Briefing',
                        'description' => 'Meet your guide and receive safety briefing',
                        'day_number' => 1,
                        'start_time' => '08:00',
                        'end_time' => '08:30',
                        'duration_minutes' => 30,
                        'order_sequence' => 1,
                        'activity_type' => 'break',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Safety briefing and equipment check'
                    ],
                    [
                        'title' => 'Boat Ride to Falls',
                        'description' => 'Exciting boat ride through narrow gorges',
                        'day_number' => 1,
                        'start_time' => '08:30',
                        'end_time' => '10:00',
                        'duration_minutes' => 90,
                        'order_sequence' => 2,
                        'activity_type' => 'activity',
                        'point_of_interest_id' => $pois['Pagsanjan Falls'] ?? null,
                        'additional_cost' => 0,
                        'notes' => 'Shooting the rapids experience'
                    ],
                    [
                        'title' => 'Pagsanjan Falls Visit',
                        'description' => 'Swimming and photo opportunities at the falls',
                        'day_number' => 1,
                        'start_time' => '10:00',
                        'end_time' => '12:00',
                        'duration_minutes' => 120,
                        'order_sequence' => 3,
                        'activity_type' => 'visit',
                        'point_of_interest_id' => $pois['Pagsanjan Falls'] ?? null,
                        'additional_cost' => 0,
                        'notes' => 'Swimming and relaxation time'
                    ],
                    [
                        'title' => 'Lunch Break',
                        'description' => 'Local Filipino cuisine lunch',
                        'day_number' => 1,
                        'start_time' => '12:00',
                        'end_time' => '13:00',
                        'duration_minutes' => 60,
                        'order_sequence' => 4,
                        'activity_type' => 'meal',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Traditional Filipino lunch'
                    ],
                    [
                        'title' => 'Return Boat Ride',
                        'description' => 'Return journey with more rapids',
                        'day_number' => 1,
                        'start_time' => '13:00',
                        'end_time' => '14:30',
                        'duration_minutes' => 90,
                        'order_sequence' => 5,
                        'activity_type' => 'activity',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Return journey with different rapids'
                    ],
                    [
                        'title' => 'Town Exploration',
                        'description' => 'Explore Pagsanjan town and local shops',
                        'day_number' => 1,
                        'start_time' => '14:30',
                        'end_time' => '16:00',
                        'duration_minutes' => 90,
                        'order_sequence' => 6,
                        'activity_type' => 'visit',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Free time for shopping and exploration'
                    ]
                ]
            ],
            [
                'title' => 'Laguna Heritage & Culture Tour',
                'description' => 'Discover the rich history and culture of Laguna through visits to heritage sites, museums, and traditional towns.',
                'duration_type' => 'full_day',
                'duration_days' => 1,
                'duration_hours' => 10,
                'base_price' => 1800.00,
                'difficulty_level' => 'easy',
                'max_participants' => 15,
                'min_participants' => 2,
                'highlights' => [
                    'Rizal Shrine visit',
                    'Heritage town of Pila',
                    'Traditional Filipino lunch',
                    'Cultural museum tour'
                ],
                'included_items' => [
                    'Professional tour guide',
                    'Entrance fees',
                    'Lunch',
                    'Transportation between sites'
                ],
                'excluded_items' => [
                    'Personal expenses',
                    'Souvenirs',
                    'Tips'
                ],
                'requirements' => [
                    'Comfortable walking shoes',
                    'Camera',
                    'Hat',
                    'Water bottle'
                ],
                'meeting_point' => 'Calamba City Hall',
                'meeting_instructions' => 'Meet at Calamba City Hall at 8:00 AM. Look for the tour guide with Gabay Laguna signage.',
                'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                'items' => [
                    [
                        'title' => 'Rizal Shrine Visit',
                        'description' => 'Tour the childhood home of Dr. Jose Rizal',
                        'day_number' => 1,
                        'start_time' => '08:00',
                        'end_time' => '10:00',
                        'duration_minutes' => 120,
                        'order_sequence' => 1,
                        'activity_type' => 'visit',
                        'point_of_interest_id' => $pois['Rizal Shrine'] ?? null,
                        'additional_cost' => 0,
                        'notes' => 'Historical tour and museum visit'
                    ],
                    [
                        'title' => 'Travel to Pila',
                        'description' => 'Journey to the heritage town of Pila',
                        'day_number' => 1,
                        'start_time' => '10:00',
                        'end_time' => '11:00',
                        'duration_minutes' => 60,
                        'order_sequence' => 2,
                        'activity_type' => 'transport',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Scenic drive through Laguna countryside'
                    ],
                    [
                        'title' => 'Pila Heritage Tour',
                        'description' => 'Explore the historic town of Pila',
                        'day_number' => 1,
                        'start_time' => '11:00',
                        'end_time' => '12:30',
                        'duration_minutes' => 90,
                        'order_sequence' => 3,
                        'activity_type' => 'visit',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Heritage church and town plaza'
                    ],
                    [
                        'title' => 'Traditional Lunch',
                        'description' => 'Authentic Filipino cuisine',
                        'day_number' => 1,
                        'start_time' => '12:30',
                        'end_time' => '13:30',
                        'duration_minutes' => 60,
                        'order_sequence' => 4,
                        'activity_type' => 'meal',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Local restaurant with traditional dishes'
                    ],
                    [
                        'title' => 'San Pablo Seven Lakes',
                        'description' => 'Visit the famous Seven Lakes of San Pablo',
                        'day_number' => 1,
                        'start_time' => '13:30',
                        'end_time' => '15:30',
                        'duration_minutes' => 120,
                        'order_sequence' => 5,
                        'activity_type' => 'visit',
                        'point_of_interest_id' => $pois['Seven Lakes'] ?? null,
                        'additional_cost' => 0,
                        'notes' => 'Lake Pandin bamboo raft ride'
                    ],
                    [
                        'title' => 'Liliw Town Visit',
                        'description' => 'Explore Liliw town and its famous church',
                        'day_number' => 1,
                        'start_time' => '15:30',
                        'end_time' => '17:00',
                        'duration_minutes' => 90,
                        'order_sequence' => 6,
                        'activity_type' => 'visit',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Baroque church and local footwear shops'
                    ],
                    [
                        'title' => 'Return to Calamba',
                        'description' => 'Journey back to starting point',
                        'day_number' => 1,
                        'start_time' => '17:00',
                        'end_time' => '18:00',
                        'duration_minutes' => 60,
                        'order_sequence' => 7,
                        'activity_type' => 'transport',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Return journey with tour summary'
                    ]
                ]
            ],
            [
                'title' => 'Enchanted Kingdom Adventure',
                'description' => 'A fun-filled day at the Philippines premier theme park with thrilling rides, shows, and entertainment.',
                'duration_type' => 'full_day',
                'duration_days' => 1,
                'duration_hours' => 8,
                'base_price' => 2200.00,
                'difficulty_level' => 'easy',
                'max_participants' => 20,
                'min_participants' => 1,
                'highlights' => [
                    'Unlimited rides access',
                    'Live shows and entertainment',
                    'Theme park lunch',
                    'Professional guide'
                ],
                'included_items' => [
                    'Theme park entrance',
                    'Unlimited rides',
                    'Lunch voucher',
                    'Professional guide',
                    'Show tickets'
                ],
                'excluded_items' => [
                    'Personal expenses',
                    'Arcade games',
                    'Souvenirs',
                    'Additional food'
                ],
                'requirements' => [
                    'Comfortable clothes',
                    'Closed shoes',
                    'Camera',
                    'Extra clothes for water rides'
                ],
                'meeting_point' => 'Enchanted Kingdom Main Gate',
                'meeting_instructions' => 'Meet at the main gate at 9:00 AM. Look for the tour guide with Gabay Laguna signage.',
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
                'items' => [
                    [
                        'title' => 'Park Entry and Orientation',
                        'description' => 'Enter the park and receive orientation',
                        'day_number' => 1,
                        'start_time' => '09:00',
                        'end_time' => '09:30',
                        'duration_minutes' => 30,
                        'order_sequence' => 1,
                        'activity_type' => 'break',
                        'point_of_interest_id' => $pois['Enchanted Kingdom'] ?? null,
                        'additional_cost' => 0,
                        'notes' => 'Park orientation and safety briefing'
                    ],
                    [
                        'title' => 'Thrilling Rides Session',
                        'description' => 'Experience the park\'s most exciting rides',
                        'day_number' => 1,
                        'start_time' => '09:30',
                        'end_time' => '12:00',
                        'duration_minutes' => 150,
                        'order_sequence' => 2,
                        'activity_type' => 'activity',
                        'point_of_interest_id' => $pois['Enchanted Kingdom'] ?? null,
                        'additional_cost' => 0,
                        'notes' => 'Space Shuttle, Anchor\'s Away, and more'
                    ],
                    [
                        'title' => 'Lunch Break',
                        'description' => 'Theme park lunch',
                        'day_number' => 1,
                        'start_time' => '12:00',
                        'end_time' => '13:00',
                        'duration_minutes' => 60,
                        'order_sequence' => 3,
                        'activity_type' => 'meal',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Lunch at park restaurant'
                    ],
                    [
                        'title' => 'Family Rides and Shows',
                        'description' => 'Enjoy family-friendly rides and live shows',
                        'day_number' => 1,
                        'start_time' => '13:00',
                        'end_time' => '15:30',
                        'duration_minutes' => 150,
                        'order_sequence' => 4,
                        'activity_type' => 'activity',
                        'point_of_interest_id' => $pois['Enchanted Kingdom'] ?? null,
                        'additional_cost' => 0,
                        'notes' => 'Live shows and family rides'
                    ],
                    [
                        'title' => 'Free Time and Shopping',
                        'description' => 'Free time for additional rides and shopping',
                        'day_number' => 1,
                        'start_time' => '15:30',
                        'end_time' => '17:00',
                        'duration_minutes' => 90,
                        'order_sequence' => 5,
                        'activity_type' => 'visit',
                        'point_of_interest_id' => null,
                        'additional_cost' => 0,
                        'notes' => 'Free time for personal activities'
                    ]
                ]
            ]
        ];

        foreach ($itineraries as $itineraryData) {
            $items = $itineraryData['items'];
            unset($itineraryData['items']);

            // Create itinerary
            $itinerary = Itinerary::create($itineraryData);

            // Create itinerary items
            foreach ($items as $itemData) {
                $itinerary->items()->create($itemData);
            }

            // Attach random guides
            $randomGuides = array_slice($guides, 0, rand(1, 3));
            $guideData = [];
            foreach ($randomGuides as $index => $guideId) {
                $guideData[$guideId] = [
                    'is_primary' => $index === 0,
                    'commission_rate' => 10.00,
                    'is_active' => true
                ];
            }
            $itinerary->guides()->attach($guideData);
        }

        $this->command->info('Itineraries seeded successfully!');
    }
}



