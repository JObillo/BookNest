<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Book;
use App\Models\Section;
use App\Models\Dewey;
use App\Models\Ebook;


class BooksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Books', [
            'books' => Book::with(['section', 'deweyRelation'])->latest()->get(),
            'sections' => Section::select('id', 'section_name')->get(),
            'deweys' => Dewey::select('id', 'dewey_number', 'dewey_classification')->get(),
            'ebooks' => Ebook::select('id', 'title', 'author', 'year', 'cover', 'publisher', 'file_url')
            ->latest()
            ->take(5) // remove this if you want all, keep it if you only want the newest 5
            ->get(),
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
            'dewey' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'date_purchase' => 'nullable|date',
            'book_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:500', // Keep as is
            'book_cover' => 'nullable|image|max:2048',
        ]);
    
        // Log the incoming description for debugging
        Log::info('Incoming description: ' . $request->description);
    
        // Handle file upload
        if ($request->hasFile('book_cover')) {
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $validated['book_cover'] = '/storage/' . $path;
        }
    
        // Ensure description is handled properly - convert empty string to space to avoid null
        $validated['description'] = $request->input('description', '');
        if (trim($validated['description']) === '') {
            $validated['description'] = ' '; // Use a space instead of empty string
        }
    
        // 👇 Set copies_available based on book_copies
        $validated['copies_available'] = $validated['book_copies'];
    
        // (Optional) Set default status as 'Available'
        $validated['status'] = 'Available';
    
        $book = Book::create($validated);
    
        Log::info('Book saved with description: ' . $book->description);
    
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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books,isbn,' . $book->id,  // Skip current book's ISBN for uniqueness
            'publisher' => 'required|string|max:255',
            'book_copies' => 'required|integer|min:1',
            'accession_number' => 'nullable|string|max:255',
            'call_number' => 'required|string|max:255',
            'year' => 'nullable|string|max:255', 
            'publication_place' => 'nullable|string|max:255',
            'section_id' => 'nullable|exists:sections,id',
            'dewey_id' => 'nullable|exists:deweys,id',
            'dewey' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'date_purchase' => 'nullable|date',
            'book_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'book_cover' => 'nullable|image|max:2048',
        ]);
    
        Log::info('Update request data:', $request->all());
        
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
            'dewey',
            'subject',
            'date_purchase',
            'book_price',
        ]);
    
        // Ensure description is handled properly - convert empty string to space to avoid null
        $data['description'] = $request->input('description', '');
        if (trim($data['description']) === '') {
            $data['description'] = ' '; // Use a space instead of empty string
        }
    
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
            Log::info('Book updated with description: ' . $book->description);
        } else {
            // Log failure to update
            Log::error('Failed to update book:', $book->toArray());
        }
    
        // Redirect back with a success message
        return redirect()->route('books.index')->with('success', 'Book updated successfully.');
    }

    /**
     * Display books by section.
     */
    public function booksBySection(Section $section)
    {
        if (!$section) {
            abort(404, 'Section not found');
        }

        $books = $section->books()->with('section')->get(); // eager load section

        return Inertia::render('BySection', [
            'section' => $section,
            'books' => $books
        ]);
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        $book->delete();
        return redirect()->route('books.index')->with('success', 'Book deleted successfully.');
    }

    public function show(Book $book)
    {
        $book->load('section','deweyRelation'); // <-- correct relationship name
        return Inertia::render('BookDetail', [
            'book' => $book,
        ]);
    }


}

//no api dsadsadasdasd