<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class BookApiController extends Controller
{
    public function show(Book $book)
    {
        // Load section info if you want
        $book->load('section');

        return response()->json($book);
    }
}

//no api sdasdas asadas