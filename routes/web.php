<?php

use App\Http\Controllers\Api\BookApiController;
use App\Http\Controllers\Api\SectionApiController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    BooksController,
    DeweyController,
    IssuedBookController,
    PatronController,
    SectionController
};
use App\Models\Book;
use App\Models\Patron;
use App\Models\Section;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Home
Route::get('/', function () {
    $books = Book::with('section')->get();
    $sections = Section::all();

    return Inertia::render('welcome', [
        'books' => $books,
        'sections' => $sections,
    ]);
})->name('home');

// Dashboard (Authenticated)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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

// Issued Books
Route::resource('issuedbooks', IssuedBookController::class);

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
    \Log::info("Fetching patron with school_id: $school_id");

    $patron = Patron::where('school_id', $school_id)->first();

    if (!$patron) {
        \Log::error("Patron with school_id: $school_id not found.");
        return response()->json(['message' => 'Patron not found'], 404);
    }

    \Log::info("Found patron: ", ['patron' => $patron]);
    return response()->json($patron);

});

// Route::get('fetchapi', function(){
//     $data = Book::get();
//     return response()->json($data, 200);
// });
Route::get('/api/books', function () {
    return response()->json(Book::with('section')->get());
});

// Route::get('/api/books/search', function (Request $request) {
//     $query = $request->input('q');
//     return response()->json(Book::where('title', 'like', "%$query%")->with('section')->get());
// });


// Route::get('/api/sections-with-books', function () {
//     $sections = Section::with('books')->get();

//     return $sections->map(function ($section) {
//         return [
//             'section_name' => $section->section_name,
//             'books' => $section->books->map(function ($book) {
//                 return [
//                     'id' => $book->id,
//                     'title' => $book->title,
//                     'author' => $book->author,
//                 ];
//             }),
//         ];
//     });
// });


    // Route::prefix('api')->group(function () {
    //     Route::get('/books', [BookApiController::class, 'index']);
    //     Route::get('/sections-with-books', [SectionApiController::class, 'index']);
    // });


    // Route::prefix('api')->group(function () {
    
    //     // Get all books
    //     Route::get('/books', function () {
    //         $books = Book::with('section')
    //             ->select('id', 'title', 'author', 'isbn', 'copies_available', 'book_cover', 'section_id')
    //             ->paginate(10); // or ->get() if you don't want pagination
    
    //         return response()->json([
    //             'status' => true,
    //             'message' => 'Books fetched successfully',
    //             'data' => $books
    //         ]);
    //     });
    
    //     // 🔍 Search books
    //     Route::get('/books/search', function (Request $request) {
    //         $query = $request->input('q');
    
    //         $books = Book::where('title', 'like', "%$query%")
    //             ->orWhere('author', 'like', "%$query%")
    //             ->with('section')
    //             ->select('id', 'title', 'author', 'isbn', 'copies_available', 'book_cover', 'section_id')
    //             ->paginate(10);
    
    //         return response()->json([
    //             'status' => true,
    //             'message' => 'Search completed',
    //             'data' => $books
    //         ]);
    //     });
    
    //     // 🏷️ Get all sections with their books
    //     Route::get('/sections-with-books', function () {
    //         $sections = Section::with('books:id,section_id,title,author,isbn')
    //             ->select('id', 'section_name')
    //             ->get();
    
    //         return response()->json([
    //             'status' => true,
    //             'message' => 'Sections fetched successfully',
    //             'data' => $sections
    //         ]);
    //     });
    
    //     // Get book by ISBN
    //     Route::get('/books/isbn/{isbn}', function ($isbn) {
    //         $book = Book::where('isbn', $isbn)->with('section')->first();
    
    //         if (!$book) {
    //             return response()->json([
    //                 'status' => false,
    //                 'message' => 'Book not found'
    //             ], 404);
    //         }
    
    //         return response()->json([
    //             'status' => true,
    //             'message' => 'Book fetched successfully',
    //             'data' => $book
    //         ]);
    //     });
    
    // });

// Extra Route Files
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
