<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\BackupController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {

    // Redirect /settings to profile page
    Route::redirect('settings', 'settings/profile');

    // ----------------------
    // Profile Routes
    // ----------------------
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ----------------------
    // Password Routes
    // ----------------------
    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    // ----------------------
    // Appearance Page
    // ----------------------
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // ----------------------
    // Backup & Restore Page (renders the TSX page)
    // ----------------------
    Route::get('settings/backup-restore', function () {
        return Inertia::render('settings/BackupandRestore'); // Matches BackupRestore.tsx
    })->name('settings.backup-restore');

    // ----------------------
    // Backup & Restore API Endpoints
    // ----------------------
    Route::prefix('settings')->group(function () {
    Route::get('/backups', [BackupController::class, 'index']); // List backups
    Route::post('/backups', [BackupController::class, 'store']); // Create backup
    Route::post('/backup/store', [BackupController::class, 'store'])->name('settings.backup.store'); // ✅ Alias for frontend
    Route::get('/backups/download/{filename}', [BackupController::class, 'download']);
    Route::post('/backups/restore/{filename}', [BackupController::class, 'restore']);
    Route::get('/restore-status', [BackupController::class, 'restoreStatus']);
    Route::delete('/backups/delete/{filename}', [BackupController::class, 'delete']);

});



});
