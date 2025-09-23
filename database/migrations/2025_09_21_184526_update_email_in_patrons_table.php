<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            // Just modify existing column instead of adding new one
            $table->string('email')->nullable()->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            // Rollback: remove unique + nullable, back to normal string
            $table->string('email')->change();
        });
    }
};
