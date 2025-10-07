<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        \App\Console\Commands\SendOverdueNotifications::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        \Log::info('✅ Custom App\Console\Kernel schedule() is being used!');
        $schedule->command('inspire')->everyMinute();

        $schedule->command('overdue:send')
            ->everyMinute()
            ->appendOutputTo(storage_path('logs/schedule.log'));

        $schedule->command('overdue:notify-admin')
        ->everyMinute()
        ->appendOutputTo(storage_path('logs/notifications.log'))
        ->before(function () {
            \Log::info("✅ Running overdue:notify-admin...");
        })
        ->after(function () {
            \Log::info("✅ Finished overdue:notify-admin!");
        });
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}

