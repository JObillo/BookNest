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
        // Build a small human readable "overdue" string
        $days = (int) ($this->mailData['days_overdue'] ?? 0);
        $hours = (int) ($this->mailData['hours_overdue'] ?? 0);
        $parts = [];
        if ($days > 0) $parts[] = "{$days} day" . ($days > 1 ? 's' : '');
        if ($hours > 0) $parts[] = "{$hours} hour" . ($hours > 1 ? 's' : '');
        $overdueText = $parts ? implode(', ', $parts) : 'less than 1 hour';

        return (new MailMessage)
            ->subject('Library Book Overdue Notice')
            ->greeting("Hello {$notifiable->name},")
            ->line("The book **'{$this->mailData['title']}'** was due on **{$this->mailData['due_date']}**.")
            ->line("It has been overdue for **{$overdueText}**.")
            ->line("As of now, your current fine is **₱{$this->mailData['fine_amount']}**.")
            ->line('')
            ->line('**Library Fine Policy:**')
            ->line('- For overnight books: ₱25.00 per day.')
            ->line('- For hourly loans: ₱10.00 for the first hour and ₱5.00 for each succeeding hour.')
            ->line('- Sundays and holidays are included in fine computation.')
            ->line('')
            ->line('You cannot borrow new books while any overdue items remain.')
            ->line('Please return your overdue book as soon as possible to avoid further fines.')
            ->salutation('Thank you, Your Library');
    }
}
