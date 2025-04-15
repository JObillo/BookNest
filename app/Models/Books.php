<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Books extends Model
{
    protected $fillable = [
        'title',
        'isbn',
        'author',
        'publisher',
        'book_copies',
        'call_number',
        'book_cover',
    ];
}
