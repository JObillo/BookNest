<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1️ Clean up existing invalid year formats
        DB::statement("
            UPDATE books
            SET year = YEAR(year)
            WHERE year REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        ");

        // 2️ Change the column type to store only a 4-digit year
        Schema::table('books', function (Blueprint $table) {
            $table->integer('year')->unsigned()->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Rollback: return to varchar if ever needed
            $table->string('year', 255)->nullable()->change();
        });
    }
};
