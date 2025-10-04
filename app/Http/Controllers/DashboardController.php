<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Dewey;
use App\Models\Section;
use App\Models\IssuedBook;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\SearchLog;
use App\Models\Semester;

class DashboardController extends Controller
{
    public function index()
{
    $activeSemester = Semester::where('status', 'Active')->first();

    $issuedBookIds = IssuedBook::where('status', 'issued')->pluck('book_id');

    $stats = [
        'total_books' => Book::count(),
        'available_books' => Book::whereNotIn('id', $issuedBookIds)->count(),
        'total_sections' => Section::count(),
        'deweys' => Dewey::whereNotNull('dewey_classification')->count(),
        'issued_books' => IssuedBook::count(),
        'not_returned_books' => IssuedBook::where('status', 'issued')->count(),
        'returned_books' => IssuedBook::where('status', 'returned')->count(),
    ];

    // Query only issued books in the active semester
    $issuedBooksQuery = IssuedBook::query();
    if ($activeSemester) {
        $issuedBooksQuery->whereBetween('issued_date', [
            $activeSemester->start_date,
            $activeSemester->end_date
        ]);
    }

    // Most Borrowed
    $stats['mostBorrowed'] = $issuedBooksQuery->select('book_id', DB::raw('count(*) as borrow_count'))
        ->with('book:id,title,author')
        ->groupBy('book_id')
        ->orderByDesc('borrow_count')
        ->take(5)
        ->get()
        ->map(fn ($borrow) => [
            'id' => $borrow->book->id,
            'title' => $borrow->book->title,
            'author' => $borrow->book->author,
            'borrow_count' => $borrow->borrow_count,
        ]);

    // Least Borrowed
    $stats['leastBorrowed'] = $issuedBooksQuery->select('book_id', DB::raw('count(*) as borrow_count'))
        ->with('book:id,title,author')
        ->groupBy('book_id')
        ->orderBy('borrow_count', 'asc')
        ->take(5)
        ->get()
        ->map(fn ($borrow) => [
            'id' => $borrow->book->id,
            'title' => $borrow->book->title,
            'author' => $borrow->book->author,
            'borrow_count' => $borrow->borrow_count,
        ]);

    return Inertia::render('dashboard', [
        'stats' => $stats,
        'mostBorrowed' => $stats['mostBorrowed'],
        'leastBorrowed' => $stats['leastBorrowed'],
    ]);
}

}
