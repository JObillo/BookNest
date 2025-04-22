<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Patron;
use App\Models\IssuedBook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IssuedBookController extends Controller
{
    // Show all issued books (Issued + Returned)
    public function index()
    {
        $issuedBooks = IssuedBook::with(['book', 'patron'])->latest()->get();

        return Inertia::render('IssuedBooks', [
            'issuedbooks' => $issuedBooks,
        ]);
    }

    // Show only returned books
    public function returnedBooks()
    {
        $returnedBooks = IssuedBook::with(['book', 'patron'])
            ->where('status', 'Issued')
            ->latest()
            ->get();

        return Inertia::render('ReturnedBooks', [
            'issuedbooks' => $returnedBooks,
        ]);
    }

    // Store a newly issued book
    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:patrons,school_id',
            'isbn' => 'required|exists:books,isbn',
            'due_date' => 'required|date|after:today',
        ]);

        $patron = Patron::where('school_id', $request->school_id)->firstOrFail();
        $book = Book::where('isbn', $request->isbn)->firstOrFail();

        if ($book->copies_available < 2) {
            return back()->withErrors(['isbn' => 'No available copies to issue.']);
        }

        IssuedBook::create([
            'patron_id' => $patron->id,
            'book_id' => $book->id,
            'issued_date' => now()->toDateString(),
            'due_date' => $request->due_date,
            'status' => 'Issued',
        ]);

        $book->decrement('copies_available');
        $book->status = $book->copies_available > 1 ? 'Available' : 'Not Available';
        // $book->status = $book->copies_available > 0 ? 'Available' : 'Not Available';

        $book->save();

        return redirect()->route('issuedbooks.index')->with('success', 'Book successfully issued.');
    }

    // Mark book as returned
    public function returnBook($id)
    {
        $issuedBook = IssuedBook::findOrFail($id);
        $book = $issuedBook->book;

        if ($issuedBook->status === 'Returned') {
            return back()->withErrors(['status' => 'This book is already returned.']);
        }

        $issuedBook->status = 'Returned';
        $issuedBook->save();

        $book->increment('copies_available');
        $book->status = 'Available';
        $book->save();

        // return redirect()->route('issuedbooks.index')->with('success', 'Book successfully returned.');
        return response()->json(['message' => 'Book successfully returned.']);

    }
}
