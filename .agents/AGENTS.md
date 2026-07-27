# Workspace Rules — Leather Goods Manufacturing CRM

## Standing Rules
1. **Skill Primacy**: Before writing ANY code, re-check the relevant skill file(s) under `.agents/skills/` and follow them exactly — do not rely on general best-practice memory instead of what's specified. If a skill file and a default approach conflict, the skill file wins. If something isn't covered by a skill file, ask the user before improvising.
2. **File Structure Integrity**:
   - Controllers stay thin — business logic (like stock deduction) belongs in `app/Services/`, not in controllers.
   - One model per file in `app/Models/`, one migration per table.
   - Inertia pages in `resources/js/Pages/`, reusable UI in `resources/js/Components/ui/`, layout components in `resources/js/Components/layout/`.
   - No stray files in the project root; no logic duplicated across files.
   - Before creating a new file, check if one already exists that should be extended instead.
   - After each phase, briefly list the files created/changed and why.
3. **10 Mandatory UI States**: Every screen must implement all 10 UI states (Empty, Loading, Error, Offline, Slow Network, No Search Results, Permission Denied, Session Expired, Form Validation, Success).
