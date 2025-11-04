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
        Schema::create('itinerary_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_id')->constrained()->onDelete('cascade');
            $table->foreignId('point_of_interest_id')->nullable()->constrained('points_of_interest')->onDelete('set null');
            $table->string('title');
            $table->text('description');
            $table->integer('day_number')->default(1);
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_minutes');
            $table->integer('order_sequence');
            $table->string('activity_type'); // 'visit', 'meal', 'transport', 'activity', 'break'
            $table->decimal('additional_cost', 8, 2)->default(0);
            $table->text('notes')->nullable();
            $table->json('custom_location')->nullable(); // For non-POI activities
            $table->timestamps();
            
            $table->index(['itinerary_id', 'day_number', 'order_sequence']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('itinerary_items');
    }
};
