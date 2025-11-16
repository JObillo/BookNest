<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('book_copies', function (Blueprint $table) {
            // Modify enum to add Old and Damaged
            $table->enum('status', [
                'Available',
                'Borrowed',
                'Reserve',
                'Lost',
                'Old',
                'Damaged'
            ])->default('Available')->change();
        });
    }

    public function down()
    {
        Schema::table('book_copies', function (Blueprint $table) {
            // Revert back to original enum
            $table->enum('status', [
                'Available',
                'Borrowed',
                'Reserve',
                'Lost'
            ])->default('Available')->change();
        });
    }
};
