<?php

/**
 * 1-Click Production Setup & Diagnostic Script for Hostinger
 * SECURITY: Delete this file after initial setup!
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
use Illuminate\Http\Request;

$action = $_GET['action'] ?? 'setup';

if ($action === 'test_route') {
    echo "<h2>Testing Laravel Request Execution to /login...</h2>";
    try {
        $request = Request::create('/login', 'GET');
        $response = $kernel->handle($request);
        echo "<p><strong>Status Code:</strong> " . $response->getStatusCode() . "</p>";
        if ($response->getStatusCode() >= 400) {
            echo "<p><strong>Response Content:</strong></p>";
            echo "<pre>" . htmlspecialchars(substr($response->getContent(), 0, 2000)) . "</pre>";
        } else {
            echo "<p style='color: green;'>Laravel /login rendered successfully with HTTP " . $response->getStatusCode() . "!</p>";
        }
    } catch (\Throwable $e) {
        echo "<h3 style='color: red;'>EXPLICIT EXCEPTION ON /login:</h3>";
        echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . " (Line " . $e->getLine() . ")</p>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    }
    exit;
}

if ($action === 'tail_log') {
    echo "<h2>Latest Laravel Log Entries:</h2>";
    $logFile = __DIR__ . '/../storage/logs/laravel.log';
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        echo "<pre>" . htmlspecialchars(substr($content, -4000)) . "</pre>";
    } else {
        echo "<p>No log file found at storage/logs/laravel.log</p>";
    }
    exit;
}

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

    echo "<p>4. Creating Public Storage Symlink safely...</p>";
    $targetPath = __DIR__ . '/../storage/app/public';
    $linkPath = __DIR__ . '/storage';

    if (!file_exists($linkPath)) {
        if (function_exists('symlink')) {
            @symlink($targetPath, $linkPath);
            echo "<pre>Symlink created using native PHP symlink().</pre>";
        } else {
            echo "<p style='color: orange;'>Native symlink function not available, skipped safely.</p>";
        }
    } else {
        echo "<pre>Storage symlink already exists.</pre>";
    }

    echo "<p>5. Re-building optimized cache...</p>";
    Artisan::call('config:cache');
    Artisan::call('route:cache');
    Artisan::call('view:cache');
    echo "<pre>" . Artisan::output() . "</pre>";

    echo "<h3 style='color: green;'>SUCCESS! Setup completed cleanly.</h3>";
    echo "<p><a href='/setup_production.php?token=salah_secret_2026&action=test_route'>Test /login Request Internal Execution</a></p>";
    echo "<p><a href='/setup_production.php?token=salah_secret_2026&action=tail_log'>View Recent Error Logs</a></p>";

} catch (\Throwable $e) {
    echo "<h3 style='color: red;'>ERROR during setup execution:</h3>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . " (Line " . $e->getLine() . ")</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
