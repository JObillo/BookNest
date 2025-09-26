<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EbookCache extends Model
{
    protected $table = 'ebooks_cache'; // explicitly set the table name

    protected $fillable = [
        'title','author','publisher','year','cover','file_url','description'
    ];
}
