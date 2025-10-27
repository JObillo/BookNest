<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Step 1: Temporarily convert fine_status to VARCHAR
        Schema::table('issued_books', function (Blueprint $table) {
            $table->string('fine_status', 20)->default('no fine')->change();
        });

        // Step 2: Update old values to new ones
        DB::table('issued_books')
            ->where('fine_status', 'pending')
            ->update(['fine_status' => 'unpaid']);

        DB::table('issued_books')
            ->whereNull('fine_status')
            ->orWhere('fine_status', '')
            ->update(['fine_status' => 'no fine']);

        // Step 3: Convert back to ENUM safely
        DB::statement("ALTER TABLE issued_books MODIFY fine_status ENUM('unpaid', 'cleared', 'no fine') DEFAULT 'no fine'");
    }

    public function down(): void
    {
        // Revert back to old ENUM (pending/cleared)
        Schema::table('issued_books', function (Blueprint $table) {
            $table->string('fine_status', 20)->default('pending')->change();
        });

        DB::table('issued_books')
            ->where('fine_status', 'unpaid')
            ->update(['fine_status' => 'pending']);

        DB::statement("ALTER TABLE issued_books MODIFY fine_status ENUM('pending', 'cleared') DEFAULT 'pending'");
    }
};
