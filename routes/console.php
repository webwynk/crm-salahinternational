<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Hostinger Premium Shared Hosting Queue Processor
// Triggered every minute via Hostinger hPanel Cron: php artisan schedule:run
Schedule::command('queue:work --stop-when-empty')->everyMinute();
