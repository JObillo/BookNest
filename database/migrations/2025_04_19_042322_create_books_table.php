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
        Schema::create('books', function (Blueprint $table) {
            $table->id(); 
            $table->string('title', 255); 
            $table->string('author', 255); 
            $table->string('isbn', 13)->unique(); 
            $table->string('publisher', 255); 
            $table->unsignedInteger('book_copies'); 
            $table->string('accession_number')->nullable();
            $table->string('call_number')->unique();
            $table->date('year')->nullable(); 
            $table->string('publication_place', 255)->nullable(); 
            $table->string('book_cover')->nullable(); 
            
            
            $table->unsignedBigInteger('section_id');  
            $table->unsignedBigInteger('dewey_id');   

            $table->timestamps(); 

            $table->foreign('section_id')->references('id')->on('sections')->onDelete('cascade');
            $table->foreign('dewey_id')->references('id')->on('deweys')->onDelete('cascade'); 

            // Index on isbn, accession_number, and call_number for faster searching
            $table->index(['isbn', 'accession_number', 'call_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
