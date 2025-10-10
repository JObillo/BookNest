<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('dewey')->nullable()->after('dewey_id');
            $table->string('subject')->nullable()->after('dewey');
            $table->date('date_purchase')->nullable()->after('subject');
            $table->decimal('book_price', 10, 2)->nullable()->after('date_purchase');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['dewey', 'subject', 'date_purchase', 'book_price']);
        });
    }
};
