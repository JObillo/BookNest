<?php

// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Dewey;
use App\Models\Section;
use App\Models\IssuedBook;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_books' => Book::count(),
            'available_books' => Book::where('status', 'available')->count(),
            'total_sections' => Section::count(),
            'deweys' => Dewey::whereNotNull('dewey_classification')->count(),
            'issued_books' => IssuedBook::where('status', 'issued')->count(),
            'not_returned_books' => IssuedBook::where('status', 'not_returned')->count(),
            'returned_books' => IssuedBook::where('status', 'returned')->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}

