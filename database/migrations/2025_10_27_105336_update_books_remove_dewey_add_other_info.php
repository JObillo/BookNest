<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Remove the dewey column if it exists
            if (Schema::hasColumn('books', 'dewey')) {
                $table->dropColumn('dewey');
            }

            // Add a single column for other info
            $table->text('other_info')->nullable()->after('book_price');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Revert changes
            $table->string('dewey')->nullable();
            $table->dropColumn('other_info');
        });
    }
};
