<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        \App\Console\Commands\SendOverdueEmails::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        \Log::info('App\Console\Kernel schedule() is active.');

        // Run every minute for testing
        $schedule->command('overdue:send')
            ->everyMinute()
            ->appendOutputTo(storage_path('logs/schedule.log'))
            ->before(function () {
                \Log::info('Starting overdue:send command...');
            })
            ->after(function () {
                \Log::info('Finished overdue:send command!');
            });

        // Optional admin notification
        $schedule->command('overdue:notify-admin')
            ->everyMinute()
            ->appendOutputTo(storage_path('logs/notifications.log'))
            ->before(function () {
                \Log::info('Running overdue:notify-admin...');
            })
            ->after(function () {
                \Log::info('Finished overdue:notify-admin!');
            });
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
