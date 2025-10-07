<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminOverdueNotification extends Notification
{
    use Queueable;

    protected $patronName;
    protected $bookTitle;
    protected $dueDate;

    public function __construct($patronName, $bookTitle, $dueDate)
    {
        $this->patronName = $patronName;
        $this->bookTitle = $bookTitle;
        $this->dueDate = $dueDate;
    }

    public function via($notifiable)
    {
        return ['database']; // store in DB, not email
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => "📚 {$this->patronName} has an overdue book: '{$this->bookTitle}' (Due: {$this->dueDate})",
        ];
    }
}
//this is bullshit code not working