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

    protected $casts = [
        'issued_date' => 'date',
        'due_date'    => 'date',
    ];

    public function patron()
    {
        return $this->belongsTo(Patron::class, 'patron_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }
}

//code 1