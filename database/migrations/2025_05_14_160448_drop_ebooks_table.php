<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('ebooks');
    }

    public function down(): void
    {
        Schema::create('ebooks', function ($table) {
            $table->id();
            // Add fields back if you want to support re-migration
            $table->timestamps();
        });
    }
};
