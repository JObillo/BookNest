<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Dewey;
use App\Models\Section;
use App\Models\IssuedBook;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\SearchLog;

class DashboardController extends Controller
{
    public function index()
    {
        // Books that are currently issued (not yet returned)
        $issuedBookIds = IssuedBook::where('status', 'issued')->pluck('book_id');

        $stats = [
            'total_books' => Book::count(),

            // Available books are those not currently issued
            'available_books' => Book::whereNotIn('id', $issuedBookIds)->count(),

            // OR if you manually update book status:
            // 'available_books' => Book::where('status', 'available')->count(),

            'total_sections' => Section::count(),
            'deweys' => Dewey::whereNotNull('dewey_classification')->count(),

            // Total issued ever
            'issued_books' => IssuedBook::count(),

            // Currently not returned
            'not_returned_books' => IssuedBook::where('status', 'issued')->count(),

            // Already returned
            'returned_books' => IssuedBook::where('status', 'returned')->count(),

           'mostBorrowed' => IssuedBook::select('book_id', DB::raw('count(*) as borrow_count'))
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
                ]),

            'leastBorrowed' => IssuedBook::select('book_id', DB::raw('count(*) as borrow_count'))
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
                ]),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'mostBorrowed' =>$stats['mostBorrowed'],
            'leastBorrowed' =>$stats['leastBorrowed'],
        ]);
    }
}
