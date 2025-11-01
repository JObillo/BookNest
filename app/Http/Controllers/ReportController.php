<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\IssuedBook;
use Illuminate\Support\Facades\DB;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Patron;

class ReportController extends Controller
{
    // ------------------------------
    // Helper to get all semesters
    // ------------------------------
    private function getSemesters()
    {
        return Semester::orderBy('start_date', 'desc')->get();
    }

    // ------------------------------
// Resolve selected semester
// ------------------------------
private function resolveSemester($semesterId)
{
    if ($semesterId && $semesterId !== 'All') {
        return Semester::find((int) $semesterId); // specific semester
    }

    if ($semesterId === 'All') {
        return 'All'; // special case for all
    }

    // default: active semester
    return Semester::where('status', 'Active')
        ->orderBy('start_date', 'desc')
        ->first();
}

// ------------------------------
// Most Borrowed Books
// ------------------------------
public function mostBorrowed(Request $request)
{
    $limit = $request->input('limit', 10);
    $semesterId = $request->input('semester_id');
    $category = $request->input('category', 'All');

    $semesters = $this->getSemesters();
    $semester = $this->resolveSemester($semesterId);

    $startDate = $semester !== 'All' ? $semester?->start_date : null;
    $endDate   = $semester !== 'All' ? $semester?->end_date : null;

    $query = IssuedBook::select(
            'issued_books.book_id',
            'books.accession_number',
            DB::raw('COUNT(*) as borrow_count')
        )
        ->join('books', 'issued_books.book_id', '=', 'books.id')
        ->when($category !== 'All', fn($q) => $q->where('books.section_id', $category))
        ->when($semester !== 'All' && $startDate && $endDate, fn($q) =>
            $q->whereBetween('issued_books.issued_date', [$startDate, $endDate])
        )
        ->groupBy('issued_books.book_id', 'books.accession_number')
        ->orderByDesc('borrow_count')
        ->limit($limit)
        ->with('book')
        ->get();

    return Inertia::render('Reports/MostBorrowed', [
        'books' => $query,
        'sections' => Section::all(),
        'semesters' => $semesters,
        'selectedSemester' => $semester === 'All' ? 'All' : ($semester?->id ?? null),
        'filters' => [
            'limit' => $limit,
            'category' => $category,
        ],
    ]);
}


    // ------------------------------
    // Least Borrowed Books
    // ------------------------------
    public function leastBorrowed(Request $request)
    {
        $limit = $request->input('limit', 10);
        $semesterId = $request->input('semester_id');
        $category = $request->input('category', 'All');

        $semesters = $this->getSemesters();
        $semester = $this->resolveSemester($semesterId);

        $startDate = $semester !== 'All' ? $semester?->start_date : null;
        $endDate   = $semester !== 'All' ? $semester?->end_date : null;

        $query = IssuedBook::select('book_id', DB::raw('COUNT(*) as borrow_count'))
            ->join('books', 'issued_books.book_id', '=', 'books.id')
            ->when($category !== 'All', fn($q) => $q->where('books.section_id', $category))
            ->when($semester && $startDate && $endDate, fn($q) =>
                $q->whereBetween('issued_books.issued_date', [$startDate, $endDate])
            )
            ->groupBy('book_id')
            ->orderBy('borrow_count') // ascending for least borrowed
            ->limit($limit)
            ->with('book')
            ->get();

        return Inertia::render('Reports/LeastBorrowed', [
            'books' => $query,
            'sections' => Section::all(),
            'semesters' => $semesters,
            // if semester is "All" keep it, otherwise pass the id of active semester
            'selectedSemester' => $semester === 'All' ? 'All' : ($semester?->id ?? null),
            'filters' => [
                'limit' => $limit,
                'category' => $category,
        ],
        ]);
    }

    // ------------------------------
    // Top Borrowers
    // ------------------------------
   public function topBorrowers(Request $request)
{
    $limit = $request->input('limit', 10);
    $semesterId = $request->input('semester_id');

    $semesters = $this->getSemesters();
    $semester = $this->resolveSemester($semesterId);

    $startDate = $semester !== 'All' ? $semester?->start_date : null;
    $endDate   = $semester !== 'All' ? $semester?->end_date : null;

    // Query top borrowers
    $query = IssuedBook::select('patron_id', DB::raw('COUNT(*) as borrow_count'))
        ->when($semester !== 'All' && $startDate && $endDate, fn($q) =>
            $q->whereBetween('issued_books.issued_date', [$startDate, $endDate])
        )
        ->groupBy('patron_id')
        ->orderByDesc('borrow_count')
        ->limit($limit)
        ->with('patron')
        ->get();

    // Determine what to send as selectedSemester
    $selectedSemesterId = $semester === 'All' 
        ? 'All' 
        : ($semester?->id ?? 'All'); // fallback just in case

    return Inertia::render('Reports/TopBorrowed', [
        'borrowers' => $query,
        'semesters' => $semesters,
        'selectedSemester' => $selectedSemesterId,
        'filters' => [
            'limit' => $limit,
        ],
    ]);
}


    // ------------------------------
    // Manage Semester Page
    // ------------------------------
    public function managesemester()
    {
        $semesters = Semester::orderBy('start_date', 'desc')->get();
        return Inertia::render('Reports/ManageSemester', [
            'semesters' => $semesters
        ]);
    }

    // ------------------------------
    // Store new semester
    // ------------------------------
public function storeSemester(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'school_year' => 'required|string|max:9',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'status' => 'required|in:Active,Inactive',
    ]);

    // 🚫 Prevent creating as Active if already expired
    if (now()->greaterThan($request->end_date) && $request->status === 'Active') {
        return back()->with('error', '⚠️ You cannot create an expired semester as Active.');
    }

    if ($request->status === 'Active') {
        Semester::where('status', 'Active')->update(['status' => 'Inactive']);
    }

    Semester::create($request->all());
    return redirect()->back()->with('success', 'Semester added successfully!');
}


    // ------------------------------
    // Update semester
    // ------------------------------
public function updateSemester(Request $request, Semester $semester)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'school_year' => 'required|string|max:9',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'status' => 'required|in:Active,Inactive',
    ]);

    // 🚫 Prevent re-activating expired semesters
    if (now()->greaterThan($request->end_date) && $request->status === 'Active') {
        return back()->with('error', '⚠️ You cannot set an expired semester as Active.');
    }

    if ($request->status === 'Active') {
        Semester::where('id', '!=', $semester->id)->update(['status' => 'Inactive']);
    }

    if (
        $request->status === 'Inactive' &&
        Semester::where('status', 'Active')->count() === 1 &&
        $semester->status === 'Active'
    ) {
        return back()->with('error', '⚠️ You must have at least one active semester.');
    }

    $semester->update($request->all());
    return redirect()->back()->with('success', 'Semester updated successfully!');
}


    // ------------------------------
    // Delete semester
    // ------------------------------
    public function deleteSemester(Semester $semester)
    {
        if ($semester->status === 'Active' && Semester::where('status', 'Active')->count() === 1) {
            return back()->with('error', '⚠️ You cannot delete the last active semester.');
        }

        $semester->delete();
        return redirect()->back()->with('success', 'Semester deleted successfully!');
    }


    public function borrowerBooks($patronId)
{
    $patron = Patron::findOrFail($patronId);

    $borrowedBooks = IssuedBook::with('book')
        ->where('patron_id', $patronId)
        ->get()
        ->map(function ($record) {
            return [
                'id' => $record->id,
                'title' => $record->book->title,
                'author' => $record->book->author,
                'borrowed_at' => $record->borrowed_at,
                'returned_at' => $record->returned_at,
            ];
        });

    return response()->json([
        'patron' => $patron,
        'borrowedBooks' => $borrowedBooks,
    ]);
}

}