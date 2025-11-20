<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Book;
use App\Models\Section;
use App\Models\Dewey;
use App\Models\BookCopy;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BooksController extends Controller
{
    // --------------------------
    // List all active books
    // --------------------------
    public function index()
    {
        $books = Book::with(['section', 'deweyRelation', 'copies'])
            ->where('is_active', true)
            ->latest()
            ->get();

        return Inertia::render('Books', [
            'books' => $books,
            'sections' => Section::select('id', 'section_name')->get(),
            'deweys' => Dewey::select('id', 'dewey_number', 'dewey_classification')->get(),
        ]);
    }

    // --------------------------
    // Add new book
    // --------------------------
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'isbn' => 'required|string|unique:books,isbn',
            'publisher' => 'nullable|string',
            'book_copies' => 'required|integer|min:1',
            'call_number' => 'required|string',
            'section_id' => 'required|integer',
            'dewey_id' => 'required|integer',
            'accession_numbers' => 'required|array',
            'accession_numbers.*' => 'required|string|distinct',
            'subject' => 'nullable|string',
            'date_purchase' => 'nullable|date',
            'book_price' => 'nullable|numeric|min:0',
            'other_info' => 'nullable|string',
            'year' => 'nullable|string|max:4',
            'publication_place' => 'nullable|string',
            'book_cover' => 'nullable',
        ]);

        // Check duplicate accession numbers
        $duplicates = BookCopy::whereIn('accession_number', $validated['accession_numbers'])
            ->with('book:id,title')
            ->get();

        if ($duplicates->isNotEmpty()) {
            $messages = $duplicates->map(fn($copy) =>
                "Accession number '{$copy->accession_number}' already exists in book '{$copy->book->title}'."
            )->implode("\n");

            return back()->withErrors(['accession_numbers' => $messages])->withInput();
        }

        // Handle book cover
        $bookCoverPath = null;
        if ($request->hasFile('book_cover')) {
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $bookCoverPath = '/storage/' . $path;
        } elseif ($request->filled('book_cover') && filter_var($request->book_cover, FILTER_VALIDATE_URL)) {
            try {
                $contents = @file_get_contents($request->book_cover);
                if ($contents !== false) {
                    $filename = time() . '_' . uniqid() . '.jpg';
                    $path = 'uploads/' . $filename;
                    Storage::disk('public')->put($path, $contents);
                    $bookCoverPath = '/storage/' . $path;
                }
            } catch (\Exception $e) {
                Log::error('Failed to download book cover: ' . $e->getMessage());
            }
        }

        // Create Book
        $book = Book::create([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'isbn' => $validated['isbn'],
            'publisher' => $validated['publisher'] ?? null,
            'book_copies' => $validated['book_copies'],
            'copies_available' => $validated['book_copies'],
            'call_number' => $validated['call_number'],
            'year' => $validated['year'] ?? null,
            'publication_place' => $validated['publication_place'] ?? null,
            'section_id' => $validated['section_id'],
            'dewey_id' => $validated['dewey_id'],
            'subject' => $validated['subject'] ?? null,
            'date_purchase' => $validated['date_purchase'] ?? null,
            'book_price' => $validated['book_price'] ?? null,
            'other_info' => $validated['other_info'] ?? null,
            'status' => 'Available',
            'book_cover' => $bookCoverPath,
            'is_active' => true,
        ]);

        // Add Book Copies
        foreach ($validated['accession_numbers'] as $number) {
            BookCopy::create([
                'book_id' => $book->id,
                'accession_number' => $number,
                'status' => 'Available',
            ]);
        }

        return back()->with('success', 'Book and copies added successfully!');
    }

    // --------------------------
    // Update book
    // --------------------------
    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books,isbn,' . $book->id,
            'publisher' => 'nullable|string|max:255',
            'book_copies' => 'required|integer|min:1',
            'call_number' => 'required|string|max:255',
            'accession_numbers' => 'required|array',
            'accession_numbers.*' => 'required|string|distinct',
            'year' => 'nullable|string|max:4',
            'publication_place' => 'nullable|string|max:255',
            'section_id' => 'nullable|exists:sections,id',
            'dewey_id' => 'nullable|exists:deweys,id',
            'subject' => 'nullable|string|max:255',
            'date_purchase' => 'nullable|date',
            'book_price' => 'nullable|numeric|min:0',
            'other_info' => 'nullable|string|max:1000',
            'book_cover' => 'nullable',
        ]);

        // Check duplicate accession numbers
        $duplicates = BookCopy::whereIn('accession_number', $validated['accession_numbers'])
            ->where('book_id', '!=', $book->id)
            ->get();

        if ($duplicates->isNotEmpty()) {
            $messages = $duplicates->map(fn($copy) =>
                "Accession number '{$copy->accession_number}' already exists in book '{$copy->book->title}'."
            )->implode("\n");

            return back()->withErrors(['accession_numbers' => $messages])->withInput();
        }

        $data = $validated;

        // Handle book cover
        if ($request->hasFile('book_cover')) {
            if ($book->book_cover && file_exists(public_path($book->book_cover))) {
                unlink(public_path($book->book_cover));
            }
            $file = $request->file('book_cover');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $data['book_cover'] = '/storage/' . $path;
        } elseif ($request->filled('book_cover') && filter_var($request->book_cover, FILTER_VALIDATE_URL)) {
            try {
                $contents = @file_get_contents($request->book_cover);
                if ($contents !== false) {
                    $filename = time() . '_' . uniqid() . '.jpg';
                    $path = 'uploads/' . $filename;
                    Storage::disk('public')->put($path, $contents);
                    $data['book_cover'] = '/storage/' . $path;
                }
            } catch (\Exception $e) {
                Log::error('Failed to update book cover: ' . $e->getMessage());
            }
        }

        // Store old total copies
        $oldTotalCopies = $book->book_copies;

        // Update book
        $book->update($data);

        // Sync book copies
        $existingCopies = $book->copies()->get();
        foreach ($validated['accession_numbers'] as $index => $number) {
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

        // Remove extra copies if decreased
        if ($existingCopies->count() > count($validated['accession_numbers'])) {
            $copiesToDelete = $existingCopies->slice(count($validated['accession_numbers']));
            foreach ($copiesToDelete as $copy) {
                $copy->delete();
            }
        }

        // Update copies_available
        $availableCount = $book->copies()->where('status', 'Available')->count();
        $book->update([
            'copies_available' => $availableCount,
            'status' => $availableCount > 0 ? 'Available' : 'Not Available',
            'is_active' => $availableCount > 0,
        ]);

        return redirect()->route('books.index')->with('success', 'Book updated successfully.');
    }

    // --------------------------
    // Delete book
    // --------------------------
    public function destroy(Book $book)
    {
        if ($book->book_cover && file_exists(public_path($book->book_cover))) {
            unlink(public_path($book->book_cover));
        }

        $book->delete();
        return redirect()->route('books.index')->with('success', 'Book deleted successfully.');
    }

    // --------------------------
    // Archive a single copy
    // --------------------------
    public function archiveCopy(Request $request, BookCopy $copy)
    {
        $request->validate([
            'status' => 'required|in:Lost,Old,Damaged'
        ]);

        $book = $copy->book;

        // Update the copy status
        $copy->update(['status' => $request->status]);

        // Decrease total copies and available copies manually
        $book->book_copies = max($book->book_copies - 1, 0);
        $book->copies_available = max($book->copies_available - 1, 0);

        // Update status and is_active based on current book_copies
        $book->status = $book->book_copies > 0 ? 'Available' : 'Not Available';
        $book->is_active = $book->book_copies > 0 ? 1 : 0;

        // Save all changes
        $book->save();

        return back()->with('success', 'Copy archived successfully.');
    }

    // --------------------------
    // List all archived books
    // --------------------------
    public function archivedBooks()
    {
        $books = Book::with(['section', 'deweyRelation', 'copies'])
            ->whereDoesntHave('copies', function ($query) {
                $query->whereIn('status', ['Available', 'Borrowed', 'Reserve']);
            })
            ->get();

        return Inertia::render('ArchivedBooks', [
            'books' => $books,
        ]);
    }

    // --------------------------
    // Show book detail (admin)
    // --------------------------
    public function show($id)
    {
        $book = Book::with(['section', 'deweyRelation', 'copies'])->findOrFail($id);

        return Inertia::render('BookShow', [
            'book' => $book,
        ]);
    }

    // --------------------------
    // Show book detail (public)
    // --------------------------
    public function publicShow(Book $book)
    {
        $book->load(['section', 'copies']);

        return Inertia::render('BookDetail', [
            'book' => $book,
        ]);
    }

    // --------------------------
    // Get book copies as JSON
    // --------------------------
    public function getCopies(Book $book)
    {
        return response()->json(
            $book->copies()->select('id', 'accession_number', 'status')->get()
        );
    }

    // --------------------------
    // Books by section
    // --------------------------
    public function booksBySection(Section $section)
    {
        $books = Book::with('copies')
            ->where('section_id', $section->id)
            ->get()
            ->map(function ($book) {
                $book->accession_number = $book->copies->first()->accession_number ?? 'N/A';
                return $book;
            });

        return Inertia::render('BySection', [
            'section' => $section,
            'books' => $books,
        ]);
    }
}
