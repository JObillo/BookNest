<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IssuedBook extends Model
{
    protected $fillable = [
        'patron_id',
        'book_id',
        'issued_date',
        'due_date',
        'status',
    ];

    public function patron()
    {
        return $this->belongsTo(Patron::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}

//code 1