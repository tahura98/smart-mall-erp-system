<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Total Office Center parking management table.
     */
    public function up(): void
    {
        Schema::create('parking_logs', function (Blueprint $table) {
            $table->id();
            $table->string('token_no', 100)->unique(); // e.g. TOC-PRK-202601-0001
            $table->string('vehicle_reg_no', 100);      // e.g. Dhaka Metro-Ga-11-2233
            $table->enum('vehicle_type', ['Car', 'Bike', 'SUV'])->default('Car');
            $table->string('basement_zone', 100);       // e.g. Basement 1 - Zone A
            $table->timestamp('entry_time');
            $table->timestamp('exit_time')->nullable();
            $table->decimal('fee_bdt', 10, 2)->default(0.00); // Parking fee in BDT
            $table->enum('status', ['Parked', 'Exited', 'Lost Token'])->default('Parked');
            $table->foreignId('operator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['token_no', 'status']);
            $table->index(['vehicle_reg_no', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parking_logs');
    }
};
