<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    BooksController,
    DeweyController,
    IssuedBookController,
    PatronController,
    SectionController,
    DashboardController,
    EbookController,
    ReportController,
    SemesterController,
    NotificationController,
    BookImportController
};
use Illuminate\Support\Facades\Log;
use App\Models\Book;
use App\Models\Patron;
use App\Models\Section;
use App\Models\Ebook;


// -------------------------
// Home
// -------------------------
Route::get('/', function () {
    $books = Book::with('section')->get();
    $sections = Section::all();
    $ebooks = Ebook::all();

    return Inertia::render('welcome', [
        'books' => $books,
        'sections' => $sections,
        'ebooks' => $ebooks,
    ]);
})->name('home');

// -------------------------
// Dashboard (Authenticated)
// -------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');
});

// -------------------------
// Books
// -------------------------
Route::get('/books/archived', [BooksController::class, 'archivedBooks'])->name('books.archived');

Route::resource('books', BooksController::class);
Route::get('/books/isbn/{isbn}', function ($isbn) {
    $book = Book::where('isbn', $isbn)->first();

    if (!$book) {
        return response()->json(['message' => 'Book not found'], 404);
    }

    return response()->json($book);
});
Route::get('/books/{book}', [BooksController::class, 'show'])->name('books.show');
Route::get('/book/{book}', [BooksController::class, 'publicShow'])->name('books.publicShow');
Route::post('/book-copies/{copy}/archive', [BooksController::class, 'archiveCopy'])
    ->name('bookCopies.archive');

// CSV Import route (add here)
Route::post('/books/import', [BookImportController::class, 'import'])->name('books.import');

// -------------------------
// Borrowers
// -------------------------
Route::resource('borrowers', PatronController::class);

Route::post('/borrowers/import', [PatronController::class, 'import'])->name('borrowers.import');


// -------------------------
// Issued Books
// -------------------------
Route::resource('issuedbooks', IssuedBookController::class);
// Route::get('/issued-books', [IssuedBooksController::class, 'index']);
// Route::get('/issuedbooks/check/{school_id}/{isbn}', [IssuedBooksController::class, 'checkDuplicate']);
// After
Route::get('/issued-books', [IssuedBookController::class, 'index']);
Route::get('/issuedbooks/check/{school_id}/{isbn}', [IssuedBookController::class, 'checkDuplicate']);

Route::post('/issued-books/{id}/return', [IssuedBookController::class, 'returnBook']);
Route::get('/returnedbooks', [IssuedBookController::class, 'returnedBooks'])->name('returnedbooks.index');
Route::put('/issuedbooks/{id}/return', [IssuedBookController::class, 'returnBook'])->name('issuedbooks.return');
Route::get('/update-fines', [IssuedBookController::class, 'updateOverdueFines']);
Route::get('/fines', [IssuedBookController::class, 'fines'])->name('fines.index');
Route::put('/fines/{id}/status', [IssuedBookController::class, 'updateFineStatus']);

// -------------------------
// Sections
// -------------------------
Route::resource('section', SectionController::class);
Route::get('/section/{section}', [BooksController::class, 'booksBySection'])->name('books.bySection');

// -------------------------
// Dewey Decimal Classifications
// -------------------------
Route::resource('deweys', DeweyController::class);

// -------------------------
// Patrons
// -------------------------
Route::get('/patrons', [PatronController::class, 'index']);
Route::get('/patrons/{id}', [PatronController::class, 'show']);
Route::get('/patrons/school/{school_id}', function ($school_id) {
    Log::info("Fetching patron with school_id: $school_id");
    $patron = Patron::where('school_id', $school_id)->first();

    if (!$patron) {
        Log::error("Patron with school_id: $school_id not found.");
        return response()->json(['message' => 'Patron not found'], 404);
    }

    Log::info("Found patron: ", ['patron' => $patron]);
    return response()->json($patron);
});

// -------------------------
// Dashboard (Authenticated - Secondary)
// -------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// -------------------------
// Ebooks
// -------------------------
Route::get('/ebooks', function () {
    return Inertia::render('Ebooks');
})->name('ebooks.index');

Route::get('/api/ebooks', [EbookController::class, 'index']);
Route::get('/ebooks/manage', [EbookController::class, 'manage'])->name('ebooks.manage');
Route::get('/ebooks/{ebook}/download', [EbookController::class, 'download'])->name('ebooks.download');
Route::get('/ebooks/{ebook}', [EbookController::class, 'show'])->name('ebooks.show');
Route::delete('/ebooks/{id}', [EbookController::class, 'destroy']);
Route::get('/ebooks', [EbookController::class, 'studentView'])->name('ebooks.index');
Route::get('/admin/ebooks', [EbookController::class, 'adminView'])->name('ebooks.admin');
Route::get('/api/ebooks/free', [EbookController::class, 'freeEbooks']);

// -------------------------
// Reports
// -------------------------
Route::prefix('reports')->group(function () {
    Route::get('/most-borrowed', [ReportController::class, 'mostBorrowed'])->name('reports.mostBorrowed');
    Route::get('/least-borrowed', [ReportController::class, 'leastBorrowed'])->name('reports.leastBorrowed');
    Route::get('/top-borrowers', [ReportController::class, 'topBorrowers'])->name('reports.topBorrowers');
});
Route::get('/reports/top-borrowers/{patron}/books', [ReportController::class, 'borrowerBooks']);
// routes/web.php
Route::get('/semester/active', [SemesterController::class, 'getActive']);
Route::get('/managesemester', [ReportController::class, 'managesemester'])->name('reports.managesemester');
Route::post('/managesemester', [ReportController::class, 'storeSemester'])->name('reports.semester.store');
Route::put('/managesemester/{semester}', [ReportController::class, 'updateSemester'])->name('reports.semester.update');
Route::delete('/managesemester/{semester}', [ReportController::class, 'deleteSemester'])->name('reports.semester.delete');

// -------------------------
// Extra Route Files
// -------------------------
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
