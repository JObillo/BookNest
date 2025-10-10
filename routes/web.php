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
};

use Illuminate\Support\Facades\Log;

use App\Models\Book;
use App\Models\Patron;
use App\Models\Section;
use App\Models\Ebook;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Home
Route::get('/', function () {
    $books = Book::with('section')->get();
    $sections = Section::all();
    $ebooks = Ebook::all();

    return Inertia::render('welcome', [
        'books' => $books,
        'sections' => $sections,
        'ebooks' => $ebooks
    ]);
})->name('home');

// Dashboard (Authenticated)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');
});

// Books
Route::resource('books', BooksController::class);
Route::get('/books/isbn/{isbn}', function ($isbn) {
    $book = Book::where('isbn', $isbn)->first();

    if (!$book) {
        return response()->json(['message' => 'Book not found'], 404);
    }

    return response()->json($book);
});

// Borrowers
Route::resource('borrowers', PatronController::class);

// Issued Books
Route::resource('issuedbooks', IssuedBookController::class);
Route::get('/issuedbooks/check/{school_id}/{isbn}', [IssuedBooksController::class, 'checkDuplicate']);



// Returned books
Route::get('/returnedbooks', [IssuedBookController::class, 'returnedBooks'])->name('returnedbooks.index');
// Return a book
Route::put('/issuedbooks/{id}/return', [IssuedBookController::class, 'returnBook'])->name('issuedbooks.return');


// Sections
Route::resource('section', SectionController::class);
// Route::get('/section/{section}', [BooksController::class, 'booksBySection'])->name('books.bySection');
Route::get('/section/{section}', [BooksController::class, 'booksBySection'])->name('books.bySection');

// Route::get('/section/{section}/books', [BooksController::class, 'booksBySection'])->name('books.bySection');
// Route::get('/section/{section_name}', function ($section_name) {
//     $section = Section::where('section_name', $section_name)->first();

//     if (!$section) {
//         abort(404);
//     }

//     $books = Book::where('section_id', $section->id)->with('section')->get();

//     return Inertia::render('BySection', [
//         'section' => $section,
//         'books' => $books,
//     ]);
// })->name('books.bySection');



// Dewey Decimal Classifications
Route::resource('deweys', DeweyController::class);

// Patrons
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::get('/books/{book}', [BooksController::class, 'show'])->name('books.show');


// Route::get('/ebooks', [EbookController::class, 'index'])->name('ebooks.index');

// 1 Inertia page route — renders your React component
Route::get('/ebooks', function () {
    return Inertia::render('Ebooks');
})->name('ebooks.index');

// 2 API route — returns JSON data for fetching
Route::get('/api/ebooks', [EbookController::class, 'index']);

// 3 Manage ebooks (admin)
Route::get('/ebooks/manage', [EbookController::class, 'manage'])->name('ebooks.manage');

// 4️⃣ Download, show, delete routes
Route::get('/ebooks/{ebook}/download', [EbookController::class, 'download'])->name('ebooks.download');
Route::get('/ebooks/{ebook}', [EbookController::class, 'show'])->name('ebooks.show');
Route::delete('/ebooks/{id}', [EbookController::class, 'destroy']);

Route::get('/ebooks', [EbookController::class, 'studentView'])->name('ebooks.index');

// Route::delete('/api/ebooks/reset', [EbookController::class, 'resetCache']);
// Route::post('/ebooks/fetch', [EbookController::class, 'fetchNew']);

Route::get('/admin/ebooks', [EbookController::class, 'adminView'])->name('ebooks.admin');
// Route::resource('report', ReportController::class);

Route::get('/api/ebooks/free', [EbookController::class, 'freeEbooks']);


// Route::get('/ebooks', function () {
//     return Inertia::render('Ebooks'); // <-- Just render the page, no JSON
// });

Route::prefix('reports')->group(function () {
    Route::get('/most-borrowed', [ReportController::class, 'mostBorrowed'])->name('reports.mostBorrowed');
    Route::get('/least-borrowed', [ReportController::class, 'leastBorrowed'])->name('reports.leastBorrowed');
    Route::get('top-borrowers', [ReportController::class,'topBorrowers'])->name('reports.topBorrowers');
    Route::get('/managesemester', [ReportController::class, 'managesemester'])->name('reports.managesemester');
    Route::post('/managesemester', [ReportController::class, 'storeSemester'])->name('reports.semester.store');
    Route::put('/managesemester/{semester}', [ReportController::class, 'updateSemester'])->name('reports.semester.update');
    Route::delete('/managesemester/{semester}', [ReportController::class, 'deleteSemester'])->name('reports.semester.delete');
});

Route::get('/reports/top-borrowers/{patron}/books', [ReportController::class, 'borrowerBooks']);
    // Semester Contorller
    
// Route::post('/semesters/start', [SemesterController::class, 'start']);
// Route::post('/semesters/end', [SemesterController::class, 'end']);

// Extra Route Files
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
