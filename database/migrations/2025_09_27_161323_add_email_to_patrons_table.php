<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            // Add email column if it doesn’t exist
            if (!Schema::hasColumn('patrons', 'email')) {
                $table->string('email')->unique()->after('name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            $table->dropColumn('email');
        });
    }
};
