<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('patrons', function (Blueprint $table) {
            $table->id();
            $table->string('school_id')->unique();
            $table->string('name');
            $table->string('course')->nullable();
            $table->string('year')->nullable();
            $table->string('department')->nullable();
            $table->enum('patron_type', ['Student', 'Faculty']); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patrons');
    }
};

