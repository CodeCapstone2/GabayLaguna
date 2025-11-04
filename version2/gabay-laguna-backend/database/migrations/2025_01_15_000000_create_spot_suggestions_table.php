<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('spot_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_guide_id')->constrained('tour_guides')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->foreignId('city_id')->constrained('cities')->onDelete('cascade');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('tour_guide_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('spot_suggestions');
    }
};


