<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('issued_books', function (Blueprint $table) {
            $table->decimal('fine_amount', 8, 2)->default(0)->after('status');
            $table->dateTime('returned_date')->nullable()->after('due_date');
        });
    }

    public function down(): void
    {
        Schema::table('issued_books', function (Blueprint $table) {
            $table->dropColumn(['fine_amount', 'returned_date']);
        });
    }
};
