<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookCopy extends Model
{
    protected $fillable = ['book_id', 'accession_number', 'status'];

    // Optional: use constants for cleaner reference
    public const STATUS_AVAILABLE = 'Available';
    public const STATUS_BORROWED  = 'Borrowed';
    public const STATUS_LOST      = 'Lost';
    public const STATUS_RESERVE   = 'Reserve';

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Check if the copy is available for issuing
     */
    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_AVAILABLE;
    }

    /**
     * Mark this copy as reserved (for last copy protection)
     */
    public function reserve(): void
    {
        $this->update(['status' => self::STATUS_RESERVE]);
    }
}
