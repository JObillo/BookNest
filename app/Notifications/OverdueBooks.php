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
            ->greeting("Hello {$notifiable->name},")
            ->line("The book **'{$this->mailData['title']}'** was due on **{$this->mailData['due_date']}**.")
            ->line("As of now, your current fine is **₱{$this->mailData['fine_amount']}**.")
            ->line('')
            ->line('**Library Fine Policy:**')
            ->line('- For overnight books, a fine of ₱25.00 per day, ₱10.00 for the first hour, and ₱5.00 for each succeeding hour (including Sundays and holidays) will be collected for all overdue books.')
            ->line('- You are not allowed to borrow any library resources if you still have an overdue book.')
            ->line('')
            ->line('Please return your overdue book as soon as possible to avoid further fines.')
            ->salutation('Thank you, Your Library');
    }
}
