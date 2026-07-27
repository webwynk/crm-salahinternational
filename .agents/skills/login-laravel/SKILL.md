---
name: login-laravel
description: Breeze + Inertia + React + Sanctum authentication, account lockout logic (5 failed attempts), user roles (ADMIN/STAFF), role middleware, session expiry.
---

# Login Form Skill — Breeze + Inertia + React + Sanctum

## Users Table Schema Extensions
```php
Schema::table('users', function (Blueprint $table) {
    $table->string('role', 20)->default('STAFF')->after('email'); // ADMIN | STAFF
    $table->boolean('is_active')->default(true)->after('role');
    $table->unsignedInteger('failed_login_attempts')->default(0);
    $table->timestamp('locked_until')->nullable();
    $table->timestamp('last_login_at')->nullable();
});
```

---

## Lockout & Role Authorization Logic (`AuthenticatedSessionController.php`)

```php
public function store(LoginRequest $request): RedirectResponse
{
    $user = User::where('email', $request->email)->first();

    if ($user && $user->locked_until && $user->locked_until->isFuture()) {
        throw ValidationException::withMessages([
            'email' => 'Account temporarily locked. Try again later.',
        ]);
    }

    $request->authenticate(); // Breeze IP throttle + credential validation

    $user = $request->user();
    if (!$user->is_active) {
        Auth::logout();
        throw ValidationException::withMessages(['email' => 'This account has been deactivated.']);
    }

    $user->update(['failed_login_attempts' => 0, 'last_login_at' => now()]);
    $request->session()->regenerate();

    return redirect()->intended(route('dashboard'));
}
```

### Failed Attempt Lockout (`LoginRequest::authenticate()`)
```php
if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
    $user = User::where('email', $this->email)->first();
    if ($user) {
        $user->increment('failed_login_attempts');
        if ($user->failed_login_attempts >= 5) {
            $user->update(['locked_until' => now()->addMinutes(15)]);
        }
    }
    RateLimiter::hit($this->throttleKey());
    throw ValidationException::withMessages(['email' => trans('auth.failed')]);
}
```

---

## Role Middleware (`EnsureUserHasRole.php`)
```php
public function handle(Request $request, Closure $next, string $role): Response
{
    if ($request->user()?->role !== $role) {
        abort(403, 'You don\'t have permission to access this page.');
    }
    return $next($request);
}
```

---

## Session Expiry Handling (`app.jsx`)
```jsx
router.on('invalid', (event) => {
  if (event.detail.response.status === 409) {
    window.location.href = '/login?session=expired';
  }
});
```
