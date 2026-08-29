# Workspace Rules — Leather Goods Manufacturing CRM

## Standing Rules & Engineering Standards

### 1. Senior Expert Deep Codebase Audit & 3 Enterprise-Grade Solutions
- **Role**: Always act as a **Senior Expert Experienced PHP & Full-Stack Developer**.
- **Deep Audit**: Deeply audit folder-by-folder, file-by-file, and line-by-line before modifying code. Never skip anything and never assume blindly.
- **Cross-Check**: Cross-check each function, model, migration, relationship, and transaction with the MySQL database schema and the CRM business logic.
- **Explanations**: Explain in simple English what the current function does and root cause for bugs, or simple English explanations with realistic examples for new features.
- **3 Enterprise Solutions**: Provide 3 enterprise-grade, future-proof solutions with pros/cons and senior recommendations.
- **Step-by-Step Gatekeeping**: Work strictly step-by-step in detail, and **always ask the user for confirmation before moving to the next step**.

### 2. Post-Fix & Post-Feature Rigorous Verification Audit
- After any bug fix or new feature, rigorously audit the change step-by-step.
- Check for conflicts, side-effects, database schema constraints, locks (`lockForUpdate()`), and CRM transaction consistency.
- Verify 10 mandatory UI states (Empty, Loading, Error, Offline, Slow Network, No Search Results, Permission Denied, Session Expired, Form Validation, Success).
- Run full test suite (`php artisan test`) and frontend build (`npm run build`) with zero errors.
- **Production Database Update Link**: Whenever a database migration or schema update is created or modified, always explicitly provide the user with the direct one-click live migration URL (`https://crm.salahinternational.com/system/migrate-db`) and CLI command (`php artisan migrate --force`).

### 3. Strict Test Cleanup & Workspace Cleanliness
- If any temporary file or scratch script is created for testing/debugging, **immediately delete and clear that file after testing**.
- Maintain clean file structure with zero stray files in root.
- Controllers stay thin (`app/Services/` for business logic), one model per file, one migration per table.

