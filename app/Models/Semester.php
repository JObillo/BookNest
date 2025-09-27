<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    // Fields that can be mass assigned
    protected $fillable = [
        'name',
        'school_year',
        'start_date',
        'end_date',
        'status', // optional if you keep the Active/Inactive column
    ];

    // Optional: cast dates automatically
    protected $casts = [
    'start_date' => 'date:Y-m-d',
    'end_date' => 'date:Y-m-d',
];
}
