<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Backup extends Model
{
    use HasFactory;

    // Columns that can be mass-assigned
    protected $fillable = [
        'filename', // name of the backup file
        'path',     // path on the server
        'type',     // backup type (full, incremental, etc.)
    ];

    // Laravel automatically manages created_at and updated_at
}

