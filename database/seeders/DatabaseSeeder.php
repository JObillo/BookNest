<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default Librarian
        User::updateOrCreate(
            ['email' => 'librarian@example.com'],
            [
                'name' => 'Librarian',
                'password' => Hash::make('philCST*123'),
            ]
        );
    }
}
