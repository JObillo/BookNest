<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('issued_books', function (Blueprint $table) {
            $table->foreignId('copy_id')->nullable()->constrained('book_copies')->nullOnDelete();
        });
    }

        /**
         * Reverse the migrations.
         */
    public function down()
    {
        Schema::table('issued_books', function (Blueprint $table) {
            $table->dropConstrainedForeignId('copy_id');
        });
    }
};
