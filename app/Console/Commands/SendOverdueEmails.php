<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IssuedBook;
use App\Notifications\OverdueBooks;
use Carbon\Carbon;

class SendOverdueEmails extends Command
{
    protected $signature = 'overdue:send';
    protected $description = 'Send overdue book emails to patrons daily';

    public function handle()
    {
        // get overdue records (not returned)
        $overdueBooks = IssuedBook::where('due_date', '<', now())
            ->where('status', '!=', 'Returned')
            ->with(['patron', 'book'])
            ->get();

        foreach ($overdueBooks as $issuedBook) {
            $patron = $issuedBook->patron;
            $book   = $issuedBook->book;

            if (! $patron || ! $book) {
                continue;
            }

            // Ensure due_date is interpreted in Manila timezone for display and math
            // If model casts are set properly, due_date is a Carbon instance; handle both cases.
            if ($issuedBook->due_date instanceof Carbon) {
                $dueDateManila = $issuedBook->due_date->copy()->setTimezone('Asia/Manila');
            } else {
                $dueDateManila = Carbon::parse($issuedBook->due_date, 'Asia/Manila');
            }

            $nowManila = Carbon::now('Asia/Manila');

            // Calculate overdue time (hours & days)
            $totalOverdueHours = $dueDateManila->diffInHours($nowManila);
            $daysOverdue = intdiv($totalOverdueHours, 24);
            $hoursOverdue = $totalOverdueHours % 24;

            // Use the model's calculation to ensure consistency with UI/database
            $fine = (float) $issuedBook->calculateFine();

            // If database doesn't have fine (0 or null) you may want to store it
            // but we won't force-write here; we just send the correct value.
            // Optionally uncomment to persist:
            // if ($issuedBook->fine_amount != $fine) { $issuedBook->update(['fine_amount' => $fine]); }

            $data = [
                'title'        => $book->title,
                'due_date'     => $dueDateManila->format('F d, Y h:i A'), // e.g. October 24, 2025 08:00 AM
                'days_overdue' => $daysOverdue,
                'hours_overdue' => $hoursOverdue,
                'fine_amount'  => number_format($fine, 2),
            ];

            $patron->notify(new OverdueBooks($data));
        }

        $this->info('Overdue emails sent successfully!');
    }
}
