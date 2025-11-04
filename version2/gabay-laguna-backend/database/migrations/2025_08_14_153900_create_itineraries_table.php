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
        Schema::create('itineraries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('duration_type'); // 'half_day', 'full_day', 'multi_day'
            $table->integer('duration_days')->default(1);
            $table->integer('duration_hours')->default(4);
            $table->decimal('base_price', 10, 2);
            $table->string('difficulty_level'); // 'easy', 'moderate', 'challenging'
            $table->integer('max_participants')->default(10);
            $table->integer('min_participants')->default(1);
            $table->json('highlights'); // Array of key highlights
            $table->json('included_items'); // What's included
            $table->json('excluded_items'); // What's not included
            $table->json('requirements'); // What tourists need to bring
            $table->string('meeting_point');
            $table->text('meeting_instructions');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('image')->nullable();
            $table->timestamps();
            
            $table->index(['is_active', 'is_featured']);
            $table->index('duration_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('itineraries');
    }
};



