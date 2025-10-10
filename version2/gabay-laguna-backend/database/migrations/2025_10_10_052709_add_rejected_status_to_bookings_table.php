<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Modify the status enum to include 'rejected'
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending')->change();
        });
    }
};
