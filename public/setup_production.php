<?php

/**
 * 1-Click Production Setup & Cache Fix Script for Hostinger
 * SECURITY: Delete this file after initial database setup!
 */

$secretToken = 'salah_secret_2026';
if (($_GET['token'] ?? '') !== $secretToken) {
    http_response_code(403);
    die('403 Forbidden: Invalid authorization token.');
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;

echo "<h2>CRM Production Setup Executing...</h2>";

try {
    echo "<p>1. Clearing old cached configuration...</p>";
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<p>2. Generating Application Encryption Key...</p>";
    Artisan::call('key:generate', ['--force' => true]);
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<p>3. Running MySQL Database Migrations & Seeding Accounts...</p>";
    Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<p>4. Creating Public Storage Symlink...</p>";
    try {
        Artisan::call('storage:link');
        echo "<pre>" . Artisan::output() . "</pre>";
    } catch (\Exception $e) {
        echo "<p style='color: orange;'>Storage link already exists or skipped.</p>";
    }

    echo "<p>5. Re-building optimized cache...</p>";
    Artisan::call('config:cache');
    Artisan::call('route:cache');
    Artisan::call('view:cache');
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<h3 style='color: green;'>SUCCESS! Setup completed cleanly.</h3>";
    echo "<p><a href='/login'>Click here to go to Login Page (/login)</a></p>";

} catch (\Throwable $e) {
    echo "<h3 style='color: red;'>ERROR during setup execution:</h3>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . " (Line " . $e->getLine() . ")</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
