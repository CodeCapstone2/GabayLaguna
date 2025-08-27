<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TourGuide;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
	/**
	 * Seed the application's database.
	 */
	public function run(): void
	{
		// User::factory(10)->create();

		// Ensure a default admin exists for initial access
		$admin = User::firstOrCreate(
			['email' => 'admin@gabaylaguna.com'],
			[
				'name' => 'Admin',
				'password' => Hash::make('Password123!'),
				'user_type' => 'admin',
				'is_active' => true,
				'is_verified' => true,
			]
		);

		// Seed a default tour guide (with profile)
		$guideUser = User::firstOrCreate(
			['email' => 'guide@gabaylaguna.com'],
			[
				'name' => 'Sample Guide',
				'password' => Hash::make('Password123!'),
				'user_type' => 'guide',
				'phone' => '+639001112222',
				'is_active' => true,
				'is_verified' => true,
			]
		);
		TourGuide::firstOrCreate(
			['user_id' => $guideUser->id],
			[
				'bio' => 'Licensed tour guide with expertise in local history and culture.',
				'license_number' => 'GL-123456',
				'experience_years' => 5,
				'hourly_rate' => 750.00,
				'languages' => 'English, Filipino',
				'transportation_type' => 'Car',
				'is_verified' => true,
				'is_available' => true,
			]
		);

		// Seed a default tourist
		User::firstOrCreate(
			['email' => 'tourist@gabaylaguna.com'],
			[
				'name' => 'Sample Tourist',
				'password' => Hash::make('Password123!'),
				'user_type' => 'tourist',
				'phone' => '+639009998887',
				'is_active' => true,
				'is_verified' => true,
			]
		);
	}
}
