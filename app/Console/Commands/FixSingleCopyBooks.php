<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Book;

class FixSingleCopyBooks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'books:fix-single-copy';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set single-copy books to reserve and mark book as not available';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $books = Book::with('copies')->get();

        foreach ($books as $book) {
            if ($book->copies->count() === 1) {
                $copy = $book->copies->first();

                // Set the only copy to Reserve
                $copy->status = 'Reserve';
                $copy->save();

                // Update the book to Not Available
                $book->status = 'Not Available';
                $book->copies_available = 0;
                $book->is_active = 0;
                $book->save();

                $this->info("Book '{$book->title}' updated: single copy reserved.");
            }
        }

        $this->info("All single-copy books have been updated!");
        return 0;
    }
}
