<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Patron;
use App\Models\IssuedBook;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class IssuedBookController extends Controller
{
    // Show all issued books (Issued, Returned and Overdue)
    public function index()
    {
        $issuedBooks = IssuedBook::with(['book', 'patron'])->latest()->get();

        foreach ($issuedBooks as $issuedBook) {
            // Only touch non-returned records
            if ($issuedBook->status !== 'Returned') {
                $fine = $issuedBook->calculateFine();

                if ($fine > 0) {
                    $issuedBook->status = 'Overdue';
                    $issuedBook->fine_amount = $fine;
                    $issuedBook->fine_status = 'unpaid'; // unpaid for non-returned with fine
                } else {
                    // no fine (not yet due / within grace)
                    $issuedBook->fine_amount = 0;
                    $issuedBook->fine_status = 'no fine';
                }

                $issuedBook->saveQuietly();
            }
        }

        return Inertia::render('IssuedBooks', [
            'issuedbooks' => $issuedBooks,
        ]);
    }

    // Show unreturned books (Issued + Overdue) — this was previously called returnedBooks
    // It returns the records that are still not returned so front-end can treat them as "Unreturned"
    public function returnedBooks()
    {
        // Fetch issued records that are not returned (Issued or Overdue)
        $unreturnedBooks = IssuedBook::with(['book', 'patron'])
            ->whereIn('status', ['Issued', 'Overdue'])
            ->latest()
            ->get();

        foreach ($unreturnedBooks as $issuedBook) {
            // for safety update the dynamic fine and fine_status for unreturned
            if ($issuedBook->status !== 'Returned') {
                $fine = $issuedBook->calculateFine();
                $issuedBook->fine_amount = $fine;
                $issuedBook->fine_status = $fine > 0 ? 'unpaid' : 'no fine';
                $issuedBook->saveQuietly();
            }
        }

        return Inertia::render('ReturnedBooks', [
            // Note: The front-end component was named "ReturnedBooks" but this route provides unreturned records.
            'issuedbooks' => $unreturnedBooks,
        ]);
    }

    // Issue a book
public function store(Request $request)
{
    $request->validate([
        'school_id' => 'required|exists:patrons,school_id',
        'isbn' => 'required|exists:books,isbn',
        'due_date' => 'required|date|after:now',
    ]);

    $patron = Patron::where('school_id', $request->school_id)->firstOrFail();
    $book = Book::where('isbn', $request->isbn)->firstOrFail();

    //  1. Check if borrower already has ANY active (Issued or Overdue) book
    $hasActiveBorrow = IssuedBook::where('patron_id', $patron->id)
        ->whereIn('status', ['Issued', 'Overdue'])
        ->exists();

    if ($hasActiveBorrow) {
        return back()->withErrors([
            'school_id' => 'This borrower already has a borrowed book. Please return it first before issuing another.'
        ]);
    }

    //  2. Prevent duplicate issue of same book
    $alreadyIssued = IssuedBook::where('patron_id', $patron->id)
        ->where('book_id', $book->id)
        ->whereIn('status', ['Issued', 'Overdue'])
        ->exists();

    if ($alreadyIssued) {
        return back()->withErrors([
            'isbn' => 'This borrower already has this book issued.'
        ]);
    }

    //  3. Prevent issuing if copies <= 1 (since 1 is reserved)
    if ($book->copies_available <= 1) {
        return back()->withErrors([
            'isbn' => 'This book is reserved. Cannot issue when only 1 copy is available.'
        ]);
    }

    //  4. Create issued record
    IssuedBook::create([
        'patron_id'   => $patron->id,
        'book_id'     => $book->id,
        'issued_date' => now('Asia/Manila')->setSeconds(0),
        'due_date'    => Carbon::parse($request->due_date)->setSeconds(0),
        'status'      => 'Issued',
        'fine_amount' => 0,
        'fine_status' => 'no fine',
    ]);

    //  5. Update book availability
    $book->decrement('copies_available');
    $book->status = $book->copies_available <= 1 ? 'Not Available' : 'Available';
    $book->save();

    return redirect()
        ->route('issuedbooks.index')
        ->with('success', 'Book successfully issued.');
}



    // Return a book
public function returnBook(Request $request, $id)
{
    $issuedBook = IssuedBook::findOrFail($id);
    $book = $issuedBook->book;

    // Calculate fine
    $fine = $issuedBook->calculateFine();

    // If the book is overdue and the user can choose fine status, get it from request
    $fineStatus = $fine > 0
        ? ($request->input('fine_status') ?? 'unpaid') // Default unpaid if not selected
        : 'cleared'; // Default cleared for non-overdue

    $issuedBook->update([
        'status'        => 'Returned',
        'fine_amount'   => $fine,
        'fine_status'   => $fineStatus,
        'returned_date' => now('Asia/Manila')->setSeconds(0),
    ]);

    // Update book stock
    $book->increment('copies_available');
    $book->status = 'Available';
    $book->save();

    return response()->json(['message' => 'Book returned successfully!']);
}


    // Check for duplicate issue (same as before)
    public function checkDuplicate($school_id, $isbn)
    {
        $exists = \DB::table('issued_books')
            ->join('books', 'issued_books.book_id', '=', 'books.id')
            ->join('patrons', 'issued_books.patron_id', '=', 'patrons.id')
            ->where('patrons.school_id', $school_id)
            ->where('books.isbn', $isbn)
            ->where('issued_books.status', 'Issued')
            ->exists();

        return response()->json(['exists' => $exists]);
    }


    public function fines()
{
    $fines = IssuedBook::with(['book', 'patron'])
        ->whereNotNull('fine_amount')
        ->where('fine_amount', '>', 0)
        ->whereIn('fine_status', ['unpaid', 'cleared'])
        ->latest()
        ->get();

    return inertia('FineList', [
        'fines' => $fines,
    ]);
}

public function updateFineStatus(Request $request, $id)
{
    $request->validate([
        'fine_status' => 'required|in:cleared,unpaid',
    ]);

    $issuedBook = IssuedBook::findOrFail($id);
    $issuedBook->update([
        'fine_status' => $request->fine_status,
    ]);

    return response()->json(['message' => 'Fine status updated successfully']);
}

}
