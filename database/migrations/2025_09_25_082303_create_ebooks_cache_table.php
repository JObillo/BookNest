<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::create('ebooks_cache', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('author')->nullable();
        $table->string('publisher')->nullable();
        $table->string('year')->nullable();
        $table->string('cover')->nullable();
        $table->string('file_url')->nullable();
        $table->text('description')->nullable();
        $table->timestamps();
    });
}

public function down(): void {
    Schema::dropIfExists('ebooks_cache');
}

};