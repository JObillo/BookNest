<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bookpub extends Model
{
    protected $table = 'bookpubs';

    protected $primaryKey = 'cd';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['cd', 'name', 'f3'];
}
