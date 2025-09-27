<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IssuedBook;
use App\Notifications\OverdueBooks;

class SendOverdueEmails extends Command
{
    protected $signature = 'overdue:send';
    protected $description = 'Send overdue book emails to patrons daily';

    public function handle()
    {
        // Find overdue books by due_date (more reliable than status text)
        $overdueBooks = IssuedBook::where('due_date', '<', now())
            ->where('status', '!=', 'Returned')
            ->get();

        foreach ($overdueBooks as $issuedBook) {
            $patron = $issuedBook->patron;
            $book   = $issuedBook->book;

            if (!$patron || !$book) {
                continue; // skip if relationships missing
            }

            $data = [
                'title' => $book->title,
            ];

            $patron->notify(new OverdueBooks($data));
        }

        $this->info('Overdue emails sent successfully!');
    }
}