<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Keeps ONLY the official Super Admin account for Total Office Center ERP.
     * All operational data (floors, units, leases, invoices, parking, tickets) is created cleanly via the UI / API.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@totalofficecenter.com'],
            [
                'name' => 'TOC Super Admin',
                'phone' => '+8801700000000',
                'password' => Hash::make('Admin@1234'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}
