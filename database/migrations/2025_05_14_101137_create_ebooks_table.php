<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
{
    Schema::create('ebooks', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('author');
        $table->string('publisher');
        $table->string('year');
        $table->string('cover');     // cover image path
        $table->string('file_url');  // ebook file path
        $table->timestamps();
    });
}

};

