<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            // Change the enum values
            $table->enum('patron_type', ['Student', 'Faculty', 'Guest', 'Staff'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            // Revert back to original enum if needed
            $table->enum('patron_type', ['Student', 'Faculty', 'Guest'])->change();
        });
    }
};
