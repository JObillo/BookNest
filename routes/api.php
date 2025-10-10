<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SectionApiController;
use App\Http\Controllers\EbookController;
use App\Http\Controllers\Api\BookApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| These routes are loaded by RouteServiceProvider within a group which
| is assigned the "api" middleware group. They automatically get
| the prefix "/api". Example: /api/sections
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Ebook routes
Route::get('/ebooks', [EbookController::class, 'index']);
Route::post('/ebooks/fetch', [EbookController::class, 'fetchNew']);
Route::delete('/ebooks/reset', [EbookController::class, 'reset']);

// Section routes
Route::prefix('sections')->group(function () {
    Route::get('/', [SectionApiController::class, 'index']);          // GET /api/sections
    Route::get('{section}/books', [SectionApiController::class, 'books']); // GET /api/sections/{id}/books
});

Route::get('/books/{book}', [BookApiController::class, 'show']);
// no api dsa