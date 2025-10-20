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
        $overdueBooks = IssuedBook::where('due_date', '<', now())
            ->where('status', '!=', 'Returned')
            ->get();

        foreach ($overdueBooks as $issuedBook) {
            $patron = $issuedBook->patron;
            $book   = $issuedBook->book;

            if (!$patron || !$book) continue;

            // Use fine from database
            $fine = $issuedBook->fine_amount;

            $data = [
                'title' => $book->title,
                'due_date' => $issuedBook->due_date->format('F d, Y h:i A'),
                'fine_amount' => number_format($fine, 2),
            ];

            $patron->notify(new OverdueBooks($data));
        }

        $this->info('Overdue emails sent successfully!');
    }

}
