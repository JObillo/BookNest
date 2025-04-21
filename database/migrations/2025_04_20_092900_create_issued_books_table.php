<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('issued_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patron_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->date('issued_date');
            $table->date('due_date');
            $table->enum('status', ['Issued', 'Returned'])->default('Issued');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issued_books');
    }
};
