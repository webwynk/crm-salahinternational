---
name: ui-states-checklist
description: Checklist for implementing all 10 mandatory UI states (Empty, Loading, Error, Offline, Slow Network, No Results, Permission Denied, Session Expired, Form Validation, Success) on every screen.
---

# UI States Checklist — Leather CRM

Apply this table to **every screen** (Products list, Product detail/BOM, Materials, Labour, Assignments, Login, Dashboard). Treat "10/10 states implemented" as a definition-of-done for any screen.

| # | State | Trigger | What to show |
|---|---|---|---|
| 1 | **Empty State** | 0 records returned | Icon + title + 1-line description + primary CTA ("+ Add Product") |
| 2 | **Loading State** | Initial data fetch in progress | Skeleton matching real layout (shimmer 1.5s loop) |
| 3 | **Error State** | API/Page load fails | Inline banner: "Something went wrong loading X." + Retry button |
| 4 | **No Internet** | `navigator.onLine === false` | Persistent banner: "You're offline — changes won't be saved" |
| 5 | **Slow Network** | Request takes > ~3s | Progressive message: "Still loading… taking longer than usual" |
| 6 | **No Search Results** | Search/Filter returns 0 rows | "No results for 'X'" + "Clear filters" button |
| 7 | **Permission Denied** | Staff attempts Admin action | Disabled control with tooltip / inline 403 message |
| 8 | **Session Expired** | Session invalid/expired | Redirect to `/login?session=expired` with banner |
| 9 | **Form Validation** | Field validation failure | Inline red border + helper text + shake animation 150ms |
| 10 | **Success State** | Action completes | Toast notification (bottom-right, auto-dismiss 4s) + summary |

## Special Assignment Flow States
- **Insufficient stock (pre-check)**: dry-run stock validation prior to submit.
- **Confirmation step**: summary modal before final stock deduction.
- **Partial failure recovery**: retry PDF if PDF generation fails after deduction.
