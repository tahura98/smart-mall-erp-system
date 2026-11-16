<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Total Office Center commercial invoices table.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no', 100)->unique(); // e.g. TOC-INV-202601-0001
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->foreignId('lease_id')->nullable()->constrained('leases')->nullOnDelete();
            $table->string('billing_month', 50); // e.g. 2026-01 or January 2026
            $table->decimal('rent_amount', 12, 2); // Base Monthly Rent in BDT
            $table->decimal('cam_charge', 12, 2);  // Common Area Maintenance Charge in BDT
            $table->decimal('prev_meter_unit', 10, 2)->default(0.00); // Electricity previous meter reading
            $table->decimal('curr_meter_unit', 10, 2)->default(0.00); // Electricity current meter reading
            $table->decimal('unit_rate', 8, 2)->default(12.50);        // DESCO / DPDC commercial electricity unit rate in BDT
            $table->decimal('electricity_bill', 12, 2)->default(0.00);// (curr - prev) * unit_rate
            $table->decimal('vat_percentage', 5, 2)->default(5.00);    // Standard commercial complex VAT in Bangladesh (5% or 15%)
            $table->decimal('vat_amount', 12, 2)->default(0.00);
            $table->decimal('total_payable_bdt', 14, 2);              // rent + cam + electricity + vat
            $table->enum('payment_method', [
                'Bank Transfer',
                'bKash Corporate',
                'Cash',
                'Cheque'
            ])->nullable();
            $table->string('transaction_reference', 191)->nullable(); // e.g. bKash TrxID or Bank Cheque No
            $table->enum('status', ['Unpaid', 'Paid', 'Overdue'])->default('Unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['invoice_no', 'status']);
            $table->index(['unit_id', 'billing_month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
