<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up(): void
{
    Schema::create('search_logs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('book_id')->nullable(); // if matched a book
        $table->string('query'); // user search text
        $table->unsignedBigInteger('user_id')->nullable(); // who searched (optional)
        $table->timestamps();

        $table->foreign('book_id')->references('id')->on('books')->onDelete('cascade');
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_logs');
    }
};
