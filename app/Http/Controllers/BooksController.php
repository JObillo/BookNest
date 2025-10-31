<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Book;
use App\Models\Section;
use App\Models\Dewey;
use App\Models\BookCopy;

class BooksController extends Controller
{
    public function index()
    {
        $books = Book::with(['section', 'deweyRelation', 'copies'])->latest()->get();

        return Inertia::render('Books', [
            'books' => $books,
            'sections' => Section::select('id', 'section_name')->get(),
            'deweys' => Dewey::select('id', 'dewey_number', 'dewey_classification')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'isbn' => 'required|string|unique:books,isbn',
            'publisher' => 'required|string',
            'book_copies' => 'required|integer|min:1',
            'call_number' => 'required|string',
            'section_id' => 'required|integer',
            'dewey_id' => 'required|integer',
            'accession_numbers' => 'required|array',
            'accession_numbers.*' => 'required|string|distinct',
            'subject' => 'required|string',
            'date_purchase' => 'required|date',
            'book_price' => 'required',
            'other_info' => 'required|string',
            'book_cover' => 'nullable|image|max:2048',
        ]);

        $bookCoverPath = null;
        if ($request->hasFile('book_cover')) {
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $bookCoverPath = '/storage/' . $path;
        }

        $book = Book::create([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'isbn' => $validated['isbn'],
            'publisher' => $validated['publisher'],
            'book_copies' => $validated['book_copies'],
            'copies_available' => $validated['book_copies'],
            'call_number' => $validated['call_number'],
            'year' => $request->year,
            'publication_place' => $request->publication_place,
            'section_id' => $validated['section_id'],
            'dewey_id' => $validated['dewey_id'],
            'subject' => $validated['subject'],
            'date_purchase' => $validated['date_purchase'],
            'book_price' => $validated['book_price'],
            'other_info' => $validated['other_info'],
            'description' => $request->description,
            'status' => 'Available',
            'book_cover' => $bookCoverPath,
        ]);

        // Create book copies
        foreach ($validated['accession_numbers'] as $index => $number) {
            \App\Models\BookCopy::create([
                'book_id' => $book->id,
                'accession_number' => $number,
                // If only 1 copy in total, mark as "Reserve"
                'status' => $validated['book_copies'] === 1 ? 'Reserve' : 'Available',
            ]);
        }

        return back()->with('success', 'Book and copies added successfully!');
    }


    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books,isbn,' . $book->id,
            'publisher' => 'required|string|max:255',
            'book_copies' => 'required|integer|min:1',
            'accession_numbers' => 'required|array',
            'accession_numbers.*' => 'required|string|distinct',
            'call_number' => 'required|string|max:255',
            'year' => 'nullable|string|max:255',
            'publication_place' => 'nullable|string|max:255',
            'section_id' => 'nullable|exists:sections,id',
            'dewey_id' => 'nullable|exists:deweys,id',
            'subject' => 'nullable|string|max:255',
            'date_purchase' => 'nullable|date',
            'book_price' => 'nullable|numeric|min:0',
            'other_info' => 'nullable|string|max:1000',
            'description' => 'nullable|string|max:500',
            'book_cover' => 'nullable|image|max:2048',
        ]);

        $data = $request->only([
            'title','author','isbn','publisher','book_copies','call_number',
            'year','publication_place','section_id','dewey_id','subject',
            'date_purchase','book_price','other_info','description'
        ]);

        if ($request->hasFile('book_cover')) {
            if ($book->book_cover && file_exists(public_path($book->book_cover))) {
                unlink(public_path($book->book_cover));
            }
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $data['book_cover'] = '/storage/' . $path;
        }

        $book->update($data);

        $existingCopies = $book->copies()->get();

        foreach ($request->accession_numbers as $index => $number) {
            if (isset($existingCopies[$index])) {
                $existingCopies[$index]->update(['accession_number' => $number]);
            } else {
                BookCopy::create([
                    'book_id' => $book->id,
                    'accession_number' => $number,
                    'status' => 'Available',
                ]);
            }
        }

        return redirect()->route('books.index')->with('success', 'Book updated successfully.');
    }

    public function destroy(Book $book)
    {
        $book->delete();
        return redirect()->route('books.index')->with('success', 'Book deleted successfully.');
    }

    public function show($id)
    {
        $book = Book::with(['section', 'deweyRelation', 'copies'])->findOrFail($id);

        return Inertia::render('BookShow', [
            'book' => $book,
        ]);
    }

public function publicShow(Book $book)
{
    $book->load(['section', 'copies']); // 👈 load copies relationship

    return Inertia::render('BookDetail', [
        'book' => $book,
    ]);
}




    public function getCopies(Book $book)
    {
        return response()->json(
            $book->copies()->select('id', 'accession_number', 'status')->get()
        );
    }

    public function booksBySection(Section $section)
{
    // Fetch all books under the given section, including their copies
    $books = Book::with('copies')
        ->where('section_id', $section->id)
        ->get()
        ->map(function ($book) {
            // Add first accession number for display (if available)
            $book->accession_number = $book->copies->first()->accession_number ?? 'N/A';
            return $book;
        });

    return Inertia::render('BySection', [
        'section' => $section,
        'books' => $books,
    ]);
}


}
