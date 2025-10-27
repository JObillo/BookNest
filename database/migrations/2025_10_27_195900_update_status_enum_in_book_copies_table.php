<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update enum values to include 'Reserve'
        DB::statement("ALTER TABLE book_copies MODIFY status ENUM('Available', 'Borrowed', 'Lost', 'Reserve') NOT NULL DEFAULT 'Available'");
    }

    public function down(): void
    {
        //  Rollback: remove 'Reserve' (back to original)
        DB::statement("ALTER TABLE book_copies MODIFY status ENUM('Available', 'Borrowed', 'Lost') NOT NULL DEFAULT 'Available'");
    }
};
