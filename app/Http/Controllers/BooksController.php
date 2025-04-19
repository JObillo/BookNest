<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Book;
use App\Models\Section;
use App\Models\Dewey;

class BooksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Books', [
            'books' => Book::with(['section', 'dewey'])->get(),
            'sections' => Section::select('id', 'section_name')->get(),
            'deweys' => Dewey::select('id', 'dewey_number', 'dewey_classification')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books',
            'publisher' => 'required|string|max:255',
            'book_copies' => 'required|integer',
            'accession_number' => 'nullable|string|max:255',
            'call_number' => 'required|string|max:255',
            'year' => 'nullable|string|max:255',
            'publication_place' => 'nullable|string|max:255',
            'section_id' => 'nullable|integer|exists:sections,id',
            'dewey_id' => 'nullable|integer|exists:deweys,id',
            'book_cover' => 'nullable|image|max:2048',
        ]);
    
        if ($request->hasFile('book_cover')) {
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $validated['book_cover'] = '/storage/' . $path;
        }
    
        $book = Book::create($validated);
    
        // 🔍 Add this log to confirm
        \Log::info('Book saved:', $book->toArray());
    
        return redirect()->route('books.index')->with('success', 'Book Added successfully.');
    }
    
    

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Find the book to update
        $book = Book::findOrFail($id);
    
        // Validate the input
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books,isbn,' . $book->id,  // Skip current book's ISBN for uniqueness
            'publisher' => 'required|string|max:255',
            'book_copies' => 'required|integer|min:1',
            'accession_number' => 'required|string|max:255',
            'call_number' => 'required|string|max:255',
            'year' => 'nullable|string|max:255',  // Allow null or string year
            'publication_place' => 'required|string|max:255',
            'section_id' => 'required|exists:sections,id',
            'dewey_id' => 'required|exists:deweys,id',
            'book_cover' => 'nullable|image|max:2048',
        ]);
    
        // Only pick fields that should be updated
        $data = $request->only([
            'title',
            'author',
            'isbn',
            'publisher',
            'book_copies',
            'accession_number',
            'call_number',
            'year',
            'publication_place',
            'section_id',
            'dewey_id',
        ]);
    
        // Handle the book cover if a new one is uploaded
        if ($request->hasFile('book_cover')) {
            // Delete the old cover if it exists
            if ($book->book_cover && file_exists(public_path($book->book_cover))) {
                unlink(public_path($book->book_cover));
            }
    
            // Store the new cover image
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $data['book_cover'] = '/storage/' . $path;
        }
    
        // Update the book
        if ($book->update($data)) {
            // Log successful update for debugging
            \Log::info('Book updated:', $book->toArray());
        } else {
            // Log failure to update
            \Log::error('Failed to update book:', $book->toArray());
        }
    
        // Redirect back with a success message
        return redirect()->route('books.index')->with('success', 'Book updated successfully.');
    }
    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        $book->delete();
        return redirect()->route('books.index')->with('success', 'Book deleted successfully.');
    }
}
