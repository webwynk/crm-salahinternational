---
name: security-checklist
description: Security checklist for authentication, authorization (RBAC), input validation, injection, CSRF, database, logging, PDF generation, deployment.
---

# Security Checklist — Leather CRM

## 1. Authentication & Session
- [ ] Passwords hashed with `bcrypt` (cost ≥ 12)
- [ ] Account lockout after N failed attempts (5) for a cooldown period (15 min)
- [ ] Generic error messages on login (no user-enumeration)
- [ ] Logout invalidates session server-side
- [ ] Session cookie configured httpOnly, secure in production, SameSite=lax

## 2. Authorization (RBAC)
- [ ] Every route explicitly checks role (`ADMIN` vs `STAFF`) server-side
- [ ] Object-level checks (IDOR prevention) on all resource fetches/updates
- [ ] Admin-only actions double-checked at controller/policy level

## 3. Input Validation & Injection Prevention
- [ ] All input validated server-side via Request classes
- [ ] Parameterized Eloquent queries only
- [ ] Sanitize/escape user input rendered in PDFs or emails
- [ ] Image upload validation: MIME whitelist, max size limit

## 4. API & Network Security
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting on mutation & auth routes
- [ ] Security headers applied
- [ ] CSRF protection active on form submissions

## 5. Database Security
- [ ] Least privilege DB user
- [ ] Row-level locking (`FOR UPDATE`) on stock deduction transactions
- [ ] `stock_transactions` and `assignment_materials` are append-only

## 6. PDF Generation Security
- [ ] HTML escaped in PDF templates
- [ ] DomPDF pure-PHP engine running safely within shared hosting sandbox
