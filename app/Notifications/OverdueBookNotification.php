<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\IssuedBook;

class OverdueBookNotification extends Notification
{
    use Queueable;

    protected $issuedBook;

    public function __construct(IssuedBook $issuedBook)
    {
        $this->issuedBook = $issuedBook;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'message'  => "The book '{$this->issuedBook->book->title}' is overdue!",
            'due_date' => $this->issuedBook->due_date
                ? $this->issuedBook->due_date->toDateString()
                : null,
        ];
    }
}
