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
        Schema::table('patrons', function (Blueprint $table) {
            $table->string('contact_number')->nullable()->after('email');
            $table->string('address')->nullable()->after('contact_number');
            $table->string('purpose')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('patrons', function (Blueprint $table) {
            $table->dropColumn(['contact_number', 'address', 'purpose']);
        });
    }

};
