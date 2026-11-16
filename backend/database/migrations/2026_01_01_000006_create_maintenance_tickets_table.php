<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Total Office Center maintenance tickets table.
     */
    public function up(): void
    {
        Schema::create('maintenance_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_no', 100)->unique(); // e.g. TOC-TKT-202601-0001
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('tenant_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('issue_category', [
                'Central AC',
                'Electrical',
                'Plumbing',
                'Elevator',
                'Security'
            ]);
            $table->text('description');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Urgent'])->default('Medium');
            $table->enum('status', ['Open', 'In Progress', 'Resolved', 'Closed'])->default('Open');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['ticket_no', 'status']);
            $table->index(['issue_category', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_tickets');
    }
};
