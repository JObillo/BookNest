<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // e.g., "1st Semester"
            $table->string('school_year');   // e.g., "2025–2026"
            $table->date('start_date');      // semester start
            $table->date('end_date');        // semester end
            $table->enum('status', ['Active', 'Inactive'])->default('Inactive');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('semesters');
    }
};

