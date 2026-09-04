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

// Wipe all Work Order Assignments (Optionally refund stock)
Artisan::command('assignments:wipe {--no-refund : Do not refund stock back to inventory}', function (\App\Services\AssignmentService $assignmentService) {
    $refund = ! $this->option('no-refund');
    $this->info('Wiping all Work Order assignments from database and storage...');
    $result = $assignmentService->wipeAllAssignments($refund);
    $this->info("Done! Deleted {$result['assignments_deleted']} assignments, {$result['materials_cleared']} material lines, {$result['pdfs_cleared']} PDF records.");
    $this->comment($refund ? 'Stock has been refunded back to inventory.' : 'Stock was not refunded.');
})->purpose('Wipe all Work Order assignments, materials, and PDFs from database and storage disk');

