<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EbookController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// JSON API routes
Route::get('/ebooks', [EbookController::class, 'index']);
Route::post('/ebooks/fetch', [EbookController::class, 'fetchNew']);
Route::delete('/ebooks/reset', [EbookController::class, 'reset']);


