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
                'name' => 'Pagsanjan',
                'description' => 'A first-class municipality in Laguna known for its famous Pagsanjan Falls and historical landmarks.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.273889,
                'longitude' => 121.452222,
                'is_active' => true
            ],
            [
                'name' => 'Sta. Rosa',
                'description' => 'A highly urbanized city known for its industrial parks, commercial centers, and Enchanted Kingdom theme park.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.327778,
                'longitude' => 121.079722,
                'is_active' => true
            ],
            [
                'name' => 'Lumban',
                'description' => 'Known as the "Embroidery Capital of the Philippines" and home to Lake Caliraya.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.316667,
                'longitude' => 121.533333,
                'is_active' => true
            ],
            [
                'name' => 'Nagcarlan',
                'description' => 'Famous for its historical Nagcarlan Underground Cemetery and beautiful waterfalls.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.136111,
                'longitude' => 121.416389,
                'is_active' => true
            ],
            [
                'name' => 'Calamba',
                'description' => 'The birthplace of national hero Jose Rizal and known for its hot springs and resorts.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.183333,
                'longitude' => 121.166667,
                'is_active' => true
            ],
            [
                'name' => 'Pila',
                'description' => 'A historical town with well-preserved Spanish colonial architecture and heritage sites.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.233333,
                'longitude' => 121.366667,
                'is_active' => true
            ],
            [
                'name' => 'Los Baños',
                'description' => 'Known as the "Special Science and Nature City" and home to UP Los Baños and hot springs.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.166667,
                'longitude' => 121.233333,
                'is_active' => true
            ],
            [
                'name' => 'San Pablo City',
                'description' => 'Known as the "City of Seven Lakes" and the first city in Laguna province.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.066667,
                'longitude' => 121.333333,
                'is_active' => true
            ],
            [
                'name' => 'Liliw',
                'description' => 'Famous for its footwear industry, cool climate, and beautiful church.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.133333,
                'longitude' => 121.433333,
                'is_active' => true
            ],
            [
                'name' => 'Paete',
                'description' => 'Known as the "Woodcarving Capital of the Philippines" with skilled artisans.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.366667,
                'longitude' => 121.483333,
                'is_active' => true
            ],
            [
                'name' => 'Majayjay',
                'description' => 'A mountainous town known for its cool climate, historical church, and beautiful waterfalls.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.150000,
                'longitude' => 121.466667,
                'is_active' => true
            ],
            [
                'name' => 'Pangil',
                'description' => 'Known for its river adventures, historical sites, and agricultural products.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.400000,
                'longitude' => 121.466667,
                'is_active' => true
            ],
            [
                'name' => 'Luisiana',
                'description' => 'A mountainous town known for its scenic views, agriculture, and peaceful environment.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.183333,
                'longitude' => 121.516667,
                'is_active' => true
            ],
            [
                'name' => 'Calauan',
                'description' => 'Known for its agricultural lands, nature parks, and proximity to Laguna de Bay.',
                'image' => 'D:\X\xampp\htdocs\GabayLaguna\version2\gabay-laguna-frontend\public\assets\BinanCity.jpg',
                'latitude' => 14.150000,
                'longitude' => 121.316667,
                'is_active' => true
            ],
        ];

        foreach ($cities as $city) {
            DB::table('cities')->insert($city);
        }
    }
}