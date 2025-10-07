<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\IssuedBook;
use App\Models\User;
use App\Notifications\OverdueBookNotification;

class SendOverdueNotifications extends Command
{
    protected $signature = 'overdue:notify-admin';
    protected $description = 'Send overdue book notifications to the single user in the system';

    public function handle()
    {
        // ✅ Get the first user (admin)
        $user = User::first();

        if (!$user) {
            $this->error('No user found in the system.');
            return;
        }

        // ✅ Get overdue books (not returned yet)
        $overdueBooks = IssuedBook::where('due_date', '<', now())
            ->where('status', '!=', 'Returned')
            ->with('book')
            ->get();

        if ($overdueBooks->isEmpty()) {
            $this->info('No overdue books found.');
            return;
        }

        // ✅ Send notifications
        foreach ($overdueBooks as $issuedBook) {
            $user->notify(new OverdueBookNotification($issuedBook));
        }

        $this->info('Overdue notifications sent to the user successfully!');
    }
}
