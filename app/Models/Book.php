<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $table = 'books';
    protected $fillable = [
        'title',
        'author',
        'isbn',
        'publisher',
        'book_copies',
        'copies_available', 
        'status',
        'accession_number',
        'call_number',
        'year',
        'publication_place',
        'book_cover',
        'section_id',
        'dewey_id',
    ];

    // Relationships
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function dewey()
    {
        return $this->belongsTo(Dewey::class);
    }
}
