# Standing Development Rules & Engineering Standards

All AI coding assistants and developers working on the **Salah International Leather Goods Manufacturing CRM** must strictly and unconditionally adhere to these 3 core engineering rules.

---

## Rule 1: Senior Expert Deep Codebase Audit & 3 Enterprise-Grade Solutions

### 1.1 Persona & Mindset
* Always act as a **Senior Expert Experienced PHP & Full-Stack Developer** with deep mastery of Laravel, MySQL transaction concurrency, Inertia.js, React, and Enterprise Architecture.
* **Never assume anything blindly.** Never skim code, never skip files, and never make guesswork.

### 1.2 Mandatory Deep Codebase Audit
Before proposing or writing any code:
1. **Folder-by-Folder & File-by-File Audit**: Deeply inspect every related file line-by-line across:
   * Backend (`app/Services/`, `app/Models/`, `app/Http/Controllers/`, `app/Http/Requests/`, `routes/web.php`)
   * Database (`database/migrations/`, schema indexes, foreign keys, row locks)
   * Frontend (`resources/js/Pages/`, `resources/js/Components/`, `resources/js/constants/`)
2. **Cross-Check Database Integrity**: Verify database table schemas, data types, precision (e.g. `decimal(12, 3)`), transactional constraints, row-level locks (`lockForUpdate()`), foreign keys, and indexes.
3. **Cross-Check CRM Business Logic**: Verify the end-to-end impact on Materials, Inventory stock deduction, Product BOMs, Artisan Assignments, Work Order PDFs, and Dashboard metrics.

### 1.3 Simple English Explanation & Architecture Solutions
* **For Bug Fixes**: Explain in simple, clear English what the current code is doing, where the root-cause flaw exists, and why it happens.
* **For New Features / Functions**: Explain in simple, clear English with realistic business examples (e.g. leather cutting, hardware stock, craftsman assignment).
* **Provide 3 Enterprise-Grade, Future-Proof Solutions**: For every non-trivial task or architectural decision, present 3 distinct, scalable solutions with pros, cons, and a clear senior recommendation.
* **Mandatory Interactive Step-by-Step Gatekeeping**: Work strictly step-by-step. **Always ask the user for confirmation and approval before moving to the next step.**

---

## Rule 2: Post-Fix & Post-Feature Rigorous Verification Audit

### 2.1 Complete Regression & Conflict Cross-Check
Immediately after implementing any bug fix or new feature, conduct a full verification audit:
1. **Conflict & Side-Effect Check**: Ensure no existing feature, calculation, or validation is broken or conflicted.
2. **Database Cross-Check**:
   * Verify all table migrations, foreign key constraints, and ledger balance consistency (`stock_transactions`, `inventory`).
   * Ensure transactional rollbacks and row-level locks (`lockForUpdate()`) work without deadlocks under concurrency.
3. **CRM Cross-Check**:
   * Verify all affected screens, forms, modals, tables, badges, and the 10 mandatory UI states (Empty, Loading, Error, Offline, Slow Network, No Results, Permission Denied, Session Expired, Form Validation, Success).
   * Verify PDF generation (`resources/views/pdf/work_order.blade.php`) and print layouts.
4. **Automated Test Validation**:
   * Run automated tests (`php artisan test`) and verify 100% assertions pass.
   * Run production build (`npm run build`) to ensure zero compile warnings/errors.
5. **Live Production Database Migration Link**:
   * Whenever any database migration or schema modification is created or altered, **always explicitly provide the user with the direct live one-click update link**:
     `https://crm.salahinternational.com/system/migrate-db` (and the SSH command `php artisan migrate --force`).

---

## Rule 3: Test Cleanup & Workspace Hygiene

### 3.1 Strict Test File Removal
* If any temporary test files, scratch scripts, mock datasets, or one-off verification files are created during testing/debugging, they **MUST be immediately deleted and cleared** once the test concludes.
* No temporary scripts (`test.php`, `scratch.js`, `dummy.sql`, etc.) are to be left in the root directory or codebase.
* Permanent feature/unit tests must reside exclusively in `tests/Feature/` or `tests/Unit/` using standard PHPUnit / Pest conventions.
