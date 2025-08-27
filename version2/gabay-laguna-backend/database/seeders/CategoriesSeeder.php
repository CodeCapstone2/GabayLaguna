<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Waterfalls/Adventure',
                'description' => 'Natural waterfalls, adventure activities, and outdoor experiences',
                'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Theme Parks',
                'description' => 'Amusement parks, theme parks, and family entertainment centers',
                'image' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Lakes/Nature',
                'description' => 'Lakes, natural parks, scenic spots, and eco-tourism destinations',
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Historical/Cultural',
                'description' => 'Historical sites, museums, cultural landmarks, and heritage locations',
                'image' => 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Gardens/Parks',
                'description' => 'Botanical gardens, public parks, and recreational areas',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Resorts/Spas',
                'description' => 'Resorts, hot springs, spa facilities, and wellness centers',
                'image' => 'https://images.unsplash.com/photo-1561503972-83b7c429a728?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Shopping/Artisan',
                'description' => 'Shopping districts, artisan villages, and local product markets',
                'image' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
                'is_active' => true
            ],
            [
                'name' => 'Educational',
                'description' => 'Educational institutions, learning centers, and research facilities',
                'image' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
                'is_active' => true
            ],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert($category);
        }
    }
}