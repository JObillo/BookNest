<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\IssuedBook;
use Illuminate\Support\Facades\DB;
use App\Models\Section;
use Carbon\Carbon;

class ReportController extends Controller
{
public function mostBorrowed(Request $request)
    {
        $limit = $request->input('limit', 10);
        $range = $request->input('range', 'month');
        $category = $request->input('category', 'All'); // default to All

        $query = IssuedBook::select('book_id', DB::raw('COUNT(*) as borrow_count'))
            ->join('books', 'issued_books.book_id', '=', 'books.id')
            ->when($category !== 'All', function ($q) use ($category) {
                $q->where('books.section_id', $category); // only filter when not "All"
            })
            ->when($range === 'week', function ($q) {
                $q->whereBetween('issued_books.issued_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
            })
            ->when($range === 'month', function ($q) {
                $q->whereBetween('issued_books.issued_date', [
                    Carbon::now()->startOfMonth(),
                    Carbon::now()->endOfMonth()
                ]);
            })
            ->when($range === 'semester', function ($q) {
                $q->whereBetween('issued_books.issued_date', [
                    Carbon::create(now()->year, 7, 1),
                    Carbon::create(now()->year, 11, 30)
                ]);
            })
            ->groupBy('book_id')
            ->orderByDesc('borrow_count')
            ->limit($limit)
            ->with('book')
            ->get();

        $sections = Section::all();

        return Inertia::render('Reports/MostBorrowed', [
            'books' => $query,
            'sections' => $sections,
            'filters' => [
                'limit' => $limit,
                'range' => $range,
                'category' => $category,
            ]
        ]);
    }




    public function leastBorrowed(Request $request)
{
    $limit = $request->input('limit', 10);
    $range = $request->input('range', 'month');
    $category = $request->input('category', 'All'); // default to All

    $query = IssuedBook::select('book_id', DB::raw('COUNT(*) as borrow_count'))
        ->join('books', 'issued_books.book_id', '=', 'books.id')
        ->when($category !== 'All', function ($q) use ($category) {
            $q->where('books.section_id', $category); // filter by section if not "All"
        })
        ->when($range === 'week', function ($q) {
            $q->whereBetween('issued_books.issued_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek(Carbon::SUNDAY)
            ]);
        })
        ->when($range === 'month', function ($q) {
            $q->whereBetween('issued_books.issued_date', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ]);
        })
        ->when($range === 'semester', function ($q) {
            $q->whereBetween('issued_books.issued_date', [
                Carbon::create(now()->year, 7, 1),
                Carbon::create(now()->year, 11, 30)
            ]);
        })
        ->groupBy('book_id')
        ->orderBy('borrow_count') // ascending for least borrowed
        ->limit($limit)
        ->with('book')
        ->get();

    $sections = Section::all();

    return Inertia::render('Reports/LeastBorrowed', [
        'books' => $query,
        'sections' => $sections,
        'filters' => [
            'limit' => $limit,
            'range' => $range,
            'category' => $category,
        ]
    ]);
}
    
}


