<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SectionApiController;
use App\Http\Controllers\EbookController;
use App\Http\Controllers\Api\BookApiController;
use App\Http\Controllers\Api\DeweyApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MobileEbookController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authenticated user info
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Ebook routes
Route::get('/ebooks', [EbookController::class, 'index']);
// Route::get('/ebooks/free', [EbookController::class, 'freeEbooks']);
Route::post('/ebooks/fetch', [EbookController::class, 'fetchNew']);
Route::delete('/ebooks/reset', [EbookController::class, 'reset']);

// mobile ebook route
Route::get('/mobile/ebooks', [MobileEbookController::class, 'index']);


// Section routes
Route::prefix('sections')->group(function () {
    Route::get('/', [SectionApiController::class, 'index']);          
    Route::get('{section}/books', [SectionApiController::class, 'books']); 
});

// Dewey routes
Route::get('/deweys', [DeweyApiController::class, 'index']);

// Book routes
Route::get('/books', [BookApiController::class, 'index']);
Route::get('/books/{book}', [BookApiController::class, 'show']);

// Auth route
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/books', [BookApiController::class, 'store']);
});
