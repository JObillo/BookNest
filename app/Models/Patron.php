<?php

namespace App\Models;

use App\Enums\PatronType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Patron extends Model
{
    use Notifiable;
    protected $table = 'patrons';

    protected $fillable = [
        'school_id',
        'name',
        'course',
        'year',
        'department',
        'patron_type',
        'email',
    ];

    protected $casts = [
        'patron_type' => PatronType::class,
    ];

    // Define the relationship with IssuedBook
    public function issuedBooks()
    {
        return $this->hasMany(IssuedBook::class);
    }
}



