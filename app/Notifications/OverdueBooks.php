<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OverdueBooks extends Notification
{
    use Queueable;

    public $mailData;

    public function __construct($mailData)
    {
        $this->mailData = $mailData;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Library Book Overdue Notice')
            ->greeting("Hello {$notifiable->name}!")
            ->line("The book '{$this->mailData['title']}' is overdue. Please return it as soon as possible.")
            ->salutation('Thank you, Your Library');
    }
}