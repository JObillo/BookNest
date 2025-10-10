<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modify existing ENUM and add new ENUM columns
        DB::statement("ALTER TABLE patrons MODIFY patron_type ENUM('Student', 'Faculty', 'Guest') NOT NULL");

        DB::statement("ALTER TABLE patrons MODIFY course ENUM(
            'BSIT', 'BSCS', 'BSCpE', 'BSED', 'BEED', 'BSBA', 'BSHM', 'BSCRIM'
        ) NULL");

        DB::statement("ALTER TABLE patrons MODIFY year ENUM(
            '1st Year', '2nd Year', '3rd Year', '4th Year'
        ) NULL");

        DB::statement("ALTER TABLE patrons MODIFY department ENUM(
            'College of Education', 'College of Computer Studies', 
            'College of Business', 'College of Criminology', 'College of Hospitality Management'
        ) NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE patrons MODIFY patron_type ENUM('Student', 'Faculty') NOT NULL");
        DB::statement("ALTER TABLE patrons MODIFY course VARCHAR(255) NULL");
        DB::statement("ALTER TABLE patrons MODIFY year VARCHAR(255) NULL");
        DB::statement("ALTER TABLE patrons MODIFY department VARCHAR(255) NULL");
    }
};
