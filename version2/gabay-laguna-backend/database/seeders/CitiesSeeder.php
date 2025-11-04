<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            [
                'name' => 'San Pedro',
                'description' => 'A component city in Laguna known for its commercial growth and development.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\SanPedroCity.jpg',
                'latitude' => 14.3500,
                'longitude' => 121.0500,
                'is_active' => true
            ],
            [
                'name' => 'Biñan',
                'description' => 'A thriving city in Laguna known for its historical landmarks and commercial district.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.3333,
                'longitude' => 121.0833,
                'is_active' => true
            ],
            [
                'name' => 'Santa Rosa',
                'description' => 'A highly urbanized city known for its industrial parks, commercial centers, and Enchanted Kingdom theme park.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\StaRosaCity.jpg',
                'latitude' => 14.3167,
                'longitude' => 121.0500,
                'is_active' => true
            ],
            [
                'name' => 'Cabuyao',
                'description' => 'A component city in Laguna known for its rapid urbanization and industrial development.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\CabuyaoCity.jpg',
                'latitude' => 14.2833,
                'longitude' => 121.1167,
                'is_active' => true
            ],
            [
                'name' => 'Calamba',
                'description' => 'The birthplace of national hero Jose Rizal and known for its hot springs and resorts.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\CalambaCity.jpg',
                'latitude' => 14.2117,
                'longitude' => 121.1650,
                'is_active' => true
            ],
            [
                'name' => 'San Pablo',
                'description' => 'Known as the "City of Seven Lakes" and the first city in Laguna province.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\SanPabloCity.svg.png',
                'latitude' => 14.0667,
                'longitude' => 121.3333,
                'is_active' => true
            ],
        ];

        foreach ($cities as $city) {
            DB::table('cities')->insert($city);
        }
    }
}