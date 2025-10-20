<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Patron;
use App\Models\IssuedBook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IssuedBookController extends Controller
{
    // Show all issued books (Issued, Returned and Overdue)
    public function index()
    {
        $issuedBooks = IssuedBook::with(['book', 'patron'])->latest()->get();

        foreach ($issuedBooks as $issuedBook) {
            if ($issuedBook->status === 'Issued' && now()->greaterThan($issuedBook->due_date)) {
                $issuedBook->status = 'Overdue';
                $issuedBook->save();
            }
        }

        return Inertia::render('IssuedBooks', [
            'issuedbooks' => $issuedBooks,
        ]);
    }

    // Show only returned books
    public function returnedBooks()
    {
        $returnedBooks = IssuedBook::with(['book', 'patron'])
            ->whereIn('status', ['Issued', 'Overdue'])
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

        // Check if patron already has this book issued and not returned
        $alreadyIssued = IssuedBook::where('patron_id', $patron->id)
            ->where('book_id', $book->id)
            ->where('status', 'Issued')
            ->exists();

        if ($alreadyIssued) {
            return back()->withErrors(['isbn' => 'This borrower already has this book issued.']);
        }

        if ($book->copies_available < 1) {
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

// app/Http/Controllers/IssuedBooksController.php
    public function checkDuplicate($school_id, $isbn)
    {
        // Check if the patron already has this book issued and not yet returned
        $exists = \DB::table('issued_books')
            ->join('books', 'issued_books.book_id', '=', 'books.id')
            ->join('patrons', 'issued_books.patron_id', '=', 'patrons.id')
            ->where('patrons.school_id', $school_id)
            ->where('books.isbn', $isbn)
            ->where('issued_books.status', 'Issued') // only count books still issued
            ->exists();

        return response()->json(['exists' => $exists]);
    }


}

//code 1