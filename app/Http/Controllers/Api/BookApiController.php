<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class BookApiController extends Controller
{
    public function index(Request $request)
    {
        $books = Book::with('section')
                    ->select('id', 'title', 'author', 'isbn', 'copies_available', 'book_cover', 'section_id')
                    ->paginate(10); // paginated for mobile performance

        return response()->json([
            'status' => true,
            'message' => 'Books fetched successfully.',
            'data' => $books
        ]);
    }

    public function show($isbn)
    {
        $book = Book::where('isbn', $isbn)->with('section')->first();

        if (!$book) {
            return response()->json([
                'status' => false,
                'message' => 'Book not found.'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Book found.',
            'data' => $book
        ]);
    }
}
