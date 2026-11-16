<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_no',
        'unit_id',
        'tenant_user_id',
        'issue_category', // Central AC, Electrical, Plumbing, Elevator, Security
        'description',
        'priority',       // Low, Medium, High, Urgent
        'status',         // Open, In Progress, Resolved, Closed
        'resolution_notes',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * The unit reporting the maintenance ticket.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * The tenant user who submitted this ticket.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    /**
     * Scope for open tickets.
     */
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['Open', 'In Progress']);
    }

    /**
     * Scope for resolved tickets.
     */
    public function scopeResolved($query)
    {
        return $query->whereIn('status', ['Resolved', 'Closed']);
    }
}
