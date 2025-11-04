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
            $table->foreignId('itinerary_id')->nullable()->constrained()->onDelete('set null');
            $table->json('itinerary_customizations')->nullable();
            
            $table->index('itinerary_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['itinerary_id']);
            $table->dropColumn(['itinerary_id', 'itinerary_customizations']);
        });
    }
};



