<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class IssuedBook extends Model
{
    protected $fillable = [
        'patron_id',
        'book_id',
        'copy_id',  
        'issued_date',
        'due_date',
        'returned_date',
        'status',
        'fine_amount',
        'fine_status',
    ];

    protected $casts = [
        'issued_date' => 'datetime',
        'due_date'    => 'datetime',
        'returned_date' => 'datetime',
        'fine_amount' => 'float',
    ];


    public function patron()
    {
        return $this->belongsTo(Patron::class, 'patron_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function copy()
    {
        return $this->belongsTo(BookCopy::class, 'copy_id');
    }


    // Helper to check if book can be issued
    public static function canIssue($bookId): bool
    {
        $book = \App\Models\Book::find($bookId);

        if (!$book) {
            return false;
        }

        //Prevent issuing when available copies are 1 or less (1 is reserved)
        if ($book->copies_available <= 1) {
            return false;
        }

        return true;
    }

    // Automatically check and update status when model is accessed
    protected static function booted()
    {
        static::retrieved(function ($book) {
            $now = now('Asia/Manila');

            if ($book->status !== 'Returned' && $book->due_date && $book->due_date->lessThan($now)) {
                if ($book->status !== 'Overdue') {
                    $book->update(['status' => 'Overdue']);
                }
            }
        });
    }

    // Fine calculation logic
    public function calculateFine(): float
    {
        $now = Carbon::now('Asia/Manila');
        $dueDate = Carbon::parse($this->due_date)->setTimezone('Asia/Manila');

        if ($dueDate->greaterThan($now)) {
            return 0;
        }

        $totalHours = floor($this->due_date->diffInMinutes($now) / 60);
        $totalDays = floor($totalHours / 24);
        $remainingHours = $totalHours % 24;

        $fine = 0;

        if ($totalDays >= 1) {
            $fine += $totalDays * 25;
        }

        if ($remainingHours > 0) {
            if ($remainingHours <= 1) {
                $fine += 10;
            } else {
                $fine += 10 + (($remainingHours - 1) * 5);
            }
        }

        return round($fine, 2);
    }

public function getFineAmountAttribute($value)
{
    if ($this->status === 'Returned') {
        return $value; // keep stored fine for returned books
    }

    $fine = $this->calculateFine();
    $currentFine = $this->getAttributes()['fine_amount'] ?? 0;

    // Update fine and status dynamically
    if ($fine > 0 && $currentFine != $fine) {
        $this->update([
            'fine_amount' => $fine,
            'fine_status' => 'unpaid', // use 'unpaid' instead of pending
        ]);
    } elseif ($fine == 0 && $this->fine_status !== 'cleared') {
        $this->update([
            'fine_amount' => 0,
            'fine_status' => 'no fine', // for books with no fine
        ]);
    }

    return $fine;
}

}

// dasdasdsad