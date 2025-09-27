<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('issued_books', function (Blueprint $table) {
            $table->enum('status', ['Issued', 'Returned', 'Overdue'])
                  ->default('Issued')
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('issued_books', function (Blueprint $table) {
            $table->enum('status', ['Issued', 'Returned'])
                  ->default('Issued')
                  ->change();
        });
    }
};