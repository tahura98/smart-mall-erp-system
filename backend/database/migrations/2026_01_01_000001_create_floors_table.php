<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Total Office Center floors table.
     */
    public function up(): void
    {
        Schema::create('floors', function (Blueprint $table) {
            $table->id();
            $table->string('level_name', 100); // e.g. Ground Floor, Level 1, Level 2, Basement 1
            $table->string('zone_type', 100);  // e.g. Shopping Mall / Food Court / Corporate Office
            $table->string('block_code', 50);  // e.g. Block A, Block B, North Wing
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['level_name', 'zone_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('floors');
    }
};
