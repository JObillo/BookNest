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
    'description',
    'book_cover',
    'section_id',
    'dewey_id',
    'dewey',
    'subject',
    'date_purchase',
    'book_price',
    'is_ebook',
    'ebook_file'
];

    // Relationships
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function deweyRelation()
    {
        return $this->belongsTo(Dewey::class, 'dewey_id', 'id');
    }

    public function getCoverUrlAttribute()
    {
        if (!$this->book_cover) {
            return null;
        }

    // Remove leading slash
    $path = ltrim($this->book_cover, '/');

    // Prepend 'storage/' if not already
    if (!str_starts_with($path, 'storage/')) {
        $path = 'storage/' . $path;
    }

    // Encode only the filename
    $parts = explode('/', $path);
    $encodedFilename = rawurlencode(array_pop($parts));
    $path = implode('/', $parts) . '/' . $encodedFilename;

    return url($path);
}
}
