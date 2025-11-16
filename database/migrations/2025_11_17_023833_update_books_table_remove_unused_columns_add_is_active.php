<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Add is_active column
            $table->boolean('is_active')->default(true)->after('status');

            // Remove unnecessary columns
            $table->dropColumn(['accession_number', 'description', 'is_ebook', 'ebook_file']);
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Restore columns if rollback needed
            $table->string('accession_number')->nullable()->after('isbn');
            $table->text('description')->nullable()->after('other_info');
            $table->boolean('is_ebook')->default(false)->after('description');
            $table->string('ebook_file')->nullable()->after('is_ebook');

            // Remove is_active if rolling back
            $table->dropColumn('is_active');
        });
    }
};
