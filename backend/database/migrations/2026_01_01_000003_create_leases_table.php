<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Total Office Center leases table.
     */
    public function up(): void
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->string('agreement_no', 100)->unique(); // e.g. TOC-LSE-2026-0001
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->foreignId('tenant_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('company_or_shop_name', 191);
            $table->string('proprietor_name', 191);
            $table->string('phone_bd', 30); // Bangladeshi mobile/phone e.g. +88017XXXXXXXX
            $table->string('trade_license_no', 100);
            $table->string('tin_no', 100); // Bangladeshi e-TIN
            $table->decimal('security_deposit_bdt', 14, 2)->default(0.00);
            $table->decimal('advance_rent_bdt', 14, 2)->default(0.00);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['Active', 'Terminated', 'Expired', 'Draft'])->default('Active');
            $table->timestamps();

            $table->index(['agreement_no', 'status']);
            $table->index(['unit_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};
