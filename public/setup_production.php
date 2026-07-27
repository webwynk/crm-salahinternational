<?php

/**
 * 1-Click Production Setup Script for Hostinger
 * SECURITY: Delete this file after initial database setup!
 */

// Protect with secret token parameter: e.g. /setup_production.php?token=salah_secret_2026
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
    echo "<p>1. Generating Application Encryption Key...</p>";
    Artisan::call('key:generate', ['--force' => true]);
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<p>2. Running MySQL Database Migrations & Seeding Accounts...</p>";
    Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<p>3. Creating Public Storage Symlink...</p>";
    Artisan::call('storage:link');
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<p>4. Caching Config & Routes...</p>";
    Artisan::call('config:cache');
    Artisan::call('route:cache');
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<h3 style='color: green;'>SUCCESS! CRM setup complete.</h3>";
    echo "<p>Login at: <a href='/login'>/login</a></p>";
    echo "<p><strong>IMPORTANT: Delete public/setup_production.php now for security!</strong></p>";

} catch (\Exception $e) {
    echo "<h3 style='color: red;'>ERROR during setup:</h3>";
    echo "<pre>" . $e->getMessage() . "\n" . $e->getTraceAsString() . "</pre>";
}
