<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role', // 'super_admin', 'accounts_officer', 'tenant', 'parking_operator'
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Leases contracted under this tenant account.
     */
    public function leases(): HasMany
    {
        return $this->hasMany(Lease::class, 'tenant_user_id');
    }

    /**
     * Maintenance tickets created by this tenant.
     */
    public function maintenanceTickets(): HasMany
    {
        return $this->hasMany(MaintenanceTicket::class, 'tenant_user_id');
    }

    /**
     * RBAC helper checks
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAccountsOfficer(): bool
    {
        return $this->role === 'accounts_officer';
    }

    public function isTenant(): bool
    {
        return $this->role === 'tenant';
    }

    public function isParkingOperator(): bool
    {
        return $this->role === 'parking_operator';
    }

    /**
     * Check if user has any of the given roles.
     *
     * @param string|array $roles
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }
        return $this->role === $roles;
    }
}
