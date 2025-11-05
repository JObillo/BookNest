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
        $issuedBooks = IssuedBook::with(['book', 'patron', 'copy'])->latest()->get();

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
            'school_id'        => 'required|exists:patrons,school_id',
            'isbn'             => 'required|exists:books,isbn',
            'accession_number' => 'required|exists:book_copies,accession_number',
            'due_date'         => 'required|date|after:now',
        ]);

        $patron = Patron::where('school_id', $request->school_id)->firstOrFail();
        $book   = Book::where('isbn', $request->isbn)->firstOrFail();
        $copy   = \App\Models\BookCopy::where('accession_number', $request->accession_number)
                    ->where('book_id', $book->id)
                    ->firstOrFail();

        // Prevent duplicate active borrow
        $hasActiveBorrow = IssuedBook::where('patron_id', $patron->id)
            ->whereIn('status', ['Issued', 'Overdue'])
            ->exists();

        if ($hasActiveBorrow) {
            return back()->withErrors([
                'school_id' => 'This borrower already has a borrowed book. Please return it first.',
            ]);
        }

        // Prevent issuing unavailable or reserved copy
        if (!in_array($copy->status, ['Available'])) {
            return back()->withErrors([
                'accession_number' => 'This book copy is not available for borrowing.',
            ]);
        }

        // Create issued record
        IssuedBook::create([
            'patron_id'   => $patron->id,
            'book_id'     => $book->id,
            'copy_id'     => $copy->id,
            'issued_date' => now('Asia/Manila')->setSeconds(0),
            'due_date' => Carbon::parse($request->due_date)
                ->setTime(8, 0, 0)
                ->setTimezone('Asia/Manila'),
            'status'      => 'Issued',
            'fine_amount' => 0,
            'fine_status' => 'no fine',
        ]);

        // Update copy & book availability
        $copy->update(['status' => 'Borrowed']);

        $book->decrement('copies_available');

        // If now only one copy remains, reserve it
        if ($book->copies_available === 1) {
            $remainingCopy = \App\Models\BookCopy::where('book_id', $book->id)
                ->where('status', 'Available')
                ->first();

            if ($remainingCopy) {
                $remainingCopy->update(['status' => 'Reserve']);
            }
        }

        $book->status = $book->copies_available <= 1 ? 'Not Available' : 'Available';
        $book->save();

        return redirect()
            ->route('issuedbooks.index')
            ->with('success', 'Book successfully issued.');
    }

    // Return a book
    public function returnBook(Request $request, $id)
    {
        $issuedBook = IssuedBook::with(['book', 'copy'])->findOrFail($id);
        $book = $issuedBook->book;
        $copy = $issuedBook->copy;

        // Calculate fine
        $fine = $issuedBook->calculateFine();

        // Determine fine status
        $fineStatus = $fine > 0
            ? ($request->input('fine_status') ?? 'unpaid')
            : 'cleared';

        // Update issued book record
        $issuedBook->update([
            'status'        => 'Returned',
            'fine_amount'   => $fine,
            'fine_status'   => $fineStatus,
            'returned_date' => now('Asia/Manila')->setSeconds(0),
        ]);

        // Mark the returned copy as available
        if ($copy) {
            $copy->update(['status' => 'Available']);
        }

        // Increase available copy count
        $book->increment('copies_available');

        // After updating count, check current availability
        $availableCopies = \App\Models\BookCopy::where('book_id', $book->id)
            ->where('status', 'Available')
            ->count();

        // If at least 1 available copy, unreserve the reserved copy (if any)
        if ($availableCopies >= 1) {
            $reservedCopy = \App\Models\BookCopy::where('book_id', $book->id)
                ->where('status', 'Reserve')
                ->first();

            if ($reservedCopy) {
                $reservedCopy->update(['status' => 'Available']);
            }
        }

        // Update book status based on copies available
        $book->status = $book->copies_available > 0 ? 'Available' : 'Not Available';
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
