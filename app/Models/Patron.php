<?php

namespace App\Models;

use App\Enums\PatronType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable; // imported
use Illuminate\Foundation\Auth\User as Authenticatable; // optional if you want auth

class Patron extends Model // or extends Authenticatable if you need login
{
    use Notifiable; // <-- THIS IS REQUIRED

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

    // Relationship with IssuedBook
    public function issuedBooks()
    {
        return $this->hasMany(IssuedBook::class);
    }
}
