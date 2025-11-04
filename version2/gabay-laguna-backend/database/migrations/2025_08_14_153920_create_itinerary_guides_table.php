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
        Schema::create('itinerary_guides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_id')->constrained()->onDelete('cascade');
            $table->foreignId('tour_guide_id')->constrained()->onDelete('cascade');
            $table->boolean('is_primary')->default(false);
            $table->decimal('commission_rate', 5, 2)->default(10.00); // Percentage
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['itinerary_id', 'tour_guide_id']);
            $table->index(['tour_guide_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('itinerary_guides');
    }
};



