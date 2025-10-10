<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\TourGuide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class AuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test tourist registration
     */
    public function test_tourist_can_register(): void
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+639123456789',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'user_type',
                        'phone',
                        'is_verified',
                        'is_active',
                        'created_at',
                        'updated_at'
                    ],
                    'token'
                ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'user_type' => 'tourist',
            'is_verified' => false,
            'is_active' => true,
        ]);
    }

    /**
     * Test tour guide registration
     */
    public function test_tour_guide_can_register(): void
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+639123456789',
            'bio' => $this->faker->paragraph,
            'license_number' => 'TG' . $this->faker->unique()->numberBetween(1000, 9999),
            'experience_years' => $this->faker->numberBetween(1, 20),
            'hourly_rate' => $this->faker->numberBetween(500, 5000),
            'languages' => 'English, Tagalog, Spanish',
            'transportation_type' => 'car',
        ];

        $response = $this->postJson('/api/guide/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'user_type',
                        'phone',
                        'is_verified',
                        'is_active',
                    ],
                    'tour_guide' => [
                        'id',
                        'user_id',
                        'bio',
                        'license_number',
                        'experience_years',
                        'hourly_rate',
                        'languages',
                        'transportation_type',
                    ],
                    'token'
                ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'user_type' => 'guide',
        ]);

        $this->assertDatabaseHas('tour_guides', [
            'license_number' => $userData['license_number'],
            'experience_years' => $userData['experience_years'],
            'hourly_rate' => $userData['hourly_rate'],
        ]);
    }

    /**
     * Test user login
     */
    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'user_type',
                        'is_verified',
                        'is_active',
                    ],
                    'token'
                ]);
    }

    /**
     * Test login with invalid credentials
     */
    public function test_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'message' => 'Invalid credentials'
                ]);
    }

    /**
     * Test login with deactivated account
     */
    public function test_login_with_deactivated_account(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
                ->assertJson([
                    'message' => 'Account is deactivated'
                ]);
    }

    /**
     * Test user logout
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Logged out successfully'
                ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    /**
     * Test get authenticated user
     */
    public function test_get_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/user');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'user_type',
                        'phone',
                        'profile_picture',
                        'is_verified',
                        'is_active',
                        'created_at',
                        'updated_at'
                    ]
                ]);
    }

    /**
     * Test update user profile
     */
    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $updateData = [
            'name' => 'Updated Name',
            'phone' => '+639987654321',
            'profile_picture' => 'https://example.com/avatar.jpg',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/user/profile', $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Profile updated successfully',
                    'user' => [
                        'name' => 'Updated Name',
                        'phone' => '+639987654321',
                        'profile_picture' => 'https://example.com/avatar.jpg',
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'phone' => '+639987654321',
        ]);
    }

    /**
     * Test update user password
     */
    public function test_user_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('oldpassword'),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/user/password', [
            'current_password' => 'oldpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Password updated successfully'
                ]);

        // Verify new password works
        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'newpassword123',
        ])->assertStatus(200);
    }

    /**
     * Test update password with wrong current password
     */
    public function test_update_password_with_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('oldpassword'),
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/user/password', [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'message' => 'Current password is incorrect'
                ]);
    }

    /**
     * Test registration validation errors
     */
    public function test_registration_validation_errors(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    /**
     * Test tour guide registration validation errors
     */
    public function test_tour_guide_registration_validation_errors(): void
    {
        $response = $this->postJson('/api/guide/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'different',
            'bio' => '',
            'license_number' => '',
            'experience_years' => -1,
            'hourly_rate' => -100,
            'languages' => '',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'name', 'email', 'password', 'bio', 
                    'license_number', 'experience_years', 'hourly_rate', 'languages'
                ]);
    }

    /**
     * Test duplicate email registration
     */
    public function test_duplicate_email_registration(): void
    {
        $existingUser = User::factory()->create();

        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => $existingUser->email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test duplicate license number for tour guide
     */
    public function test_duplicate_license_number_registration(): void
    {
        $existingGuide = TourGuide::factory()->create();

        $response = $this->postJson('/api/guide/register', [
            'name' => 'Test Guide',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'bio' => 'Test bio',
            'license_number' => $existingGuide->license_number,
            'experience_years' => 5,
            'hourly_rate' => 1000,
            'languages' => 'English',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['license_number']);
    }

    /**
     * Test unauthorized access to protected routes
     */
    public function test_unauthorized_access_to_protected_routes(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);

        $response = $this->putJson('/api/user/profile', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/logout');
        $response->assertStatus(401);
    }

    /**
     * Test invalid token access
     */
    public function test_invalid_token_access(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token',
        ])->getJson('/api/user');

        $response->assertStatus(401);
    }
}

