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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tourist_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tour_guide_id')->constrained()->onDelete('cascade');
            $table->foreignId('point_of_interest_id')->nullable()->constrained()->onDelete('set null');
            $table->date('tour_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_hours');
            $table->integer('number_of_people');
            $table->text('special_requests')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->decimal('total_amount', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
