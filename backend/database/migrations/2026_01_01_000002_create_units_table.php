<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Total Office Center units table.
     */
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('unit_no', 50)->unique(); // e.g. G-101, L1-204, Suite-501
            $table->foreignId('floor_id')->constrained('floors')->onDelete('cascade');
            $table->enum('unit_type', ['Retail Shop', 'Office Suite', 'Kiosk'])->default('Office Suite');
            $table->decimal('size_sqft', 10, 2);
            $table->decimal('base_rent_bdt', 12, 2); // Base Monthly Rent in Bangladeshi Taka
            $table->decimal('cam_rate_per_sqft', 10, 2)->default(25.00); // Common Area Maintenance rate per sqft in BDT
            $table->enum('status', ['Vacant', 'Occupied', 'Maintenance'])->default('Vacant');
            $table->timestamps();

            $table->index(['unit_no', 'status']);
            $table->index(['floor_id', 'unit_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
