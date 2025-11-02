<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookApiController extends Controller
{
    // List all books
    public function index()
    {
        return response()->json(Book::all());
    }

    // Show a single book
    public function show(Book $book)
    {
        return response()->json($book);
    }

    // Store a new book
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string',
                'author' => 'required|string',
                'isbn' => 'required|string|unique:books,isbn',
                'publisher' => 'required|string',
                'book_copies' => 'required|integer|min:1',
                'call_number' => 'required|string',
                'year' => 'required|integer',
                'publication_place' => 'required|string',
                'section_id' => 'required|integer',
                'dewey_id' => 'required|integer',
                'accession_numbers' => 'required|array',
                'accession_numbers.*' => 'required|string|distinct',
                'subject' => 'required|string',
                'date_purchase' => 'required|date',
                'book_price' => 'required',
                'other_info' => 'required|string',
                'book_cover' => 'nullable|image|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $validated = $validator->validated();

            // Handle book cover upload
            $bookCoverPath = null;
            if ($request->hasFile('book_cover')) {
                $file = $request->file('book_cover');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads', $filename, 'public');
                $bookCoverPath = '/storage/' . $path;
            }

            // Create the book
            $book = Book::create([
                'title' => $validated['title'],
                'author' => $validated['author'],
                'isbn' => $validated['isbn'],
                'publisher' => $validated['publisher'],
                'book_copies' => $validated['book_copies'],
                'copies_available' => $validated['book_copies'],
                'call_number' => $validated['call_number'],
                'year' => $validated['year'],
                'publication_place' => $validated['publication_place'],
                'section_id' => $validated['section_id'],
                'dewey_id' => $validated['dewey_id'],
                'subject' => $validated['subject'],
                'date_purchase' => $validated['date_purchase'],
                'book_price' => $validated['book_price'],
                'other_info' => $validated['other_info'],
                'status' => 'Available',
                'book_cover' => $bookCoverPath,
            ]);

            // Create book copies
            foreach ($validated['accession_numbers'] as $number) {
                BookCopy::create([
                    'book_id' => $book->id,
                    'accession_number' => $number,
                    'status' => 'Available',
                ]);
            }

            return response()->json([
                'message' => 'Book added successfully!',
                'book' => $book,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
