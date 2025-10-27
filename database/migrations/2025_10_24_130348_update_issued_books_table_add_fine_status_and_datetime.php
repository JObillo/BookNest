<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('issued_books', function (Blueprint $table) {
            // Change issued_date and due_date to DATETIME type
            $table->dateTime('issued_date')->change();
            $table->dateTime('due_date')->change();

            // Add fine_status column
            $table->enum('fine_status', ['pending', 'cleared'])
                  ->default('pending')
                  ->after('fine_amount');
        });
    }

    public function down(): void
    {
        Schema::table('issued_books', function (Blueprint $table) {
            $table->date('issued_date')->change();
            $table->date('due_date')->change();
            $table->dropColumn('fine_status');
        });
    }
};

//code 1