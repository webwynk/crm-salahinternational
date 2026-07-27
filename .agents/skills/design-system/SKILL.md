---
name: design-system
description: Design tokens, color system, typography, components, icons, motion, responsive layout, anti-template checklist for Leather CRM.
---

# Design System Skill — Leather CRM (Modern Enterprise SaaS)

Stack assumed: **Next.js (React) + Tailwind CSS + Framer Motion + lucide-react icons**.
Goal: a UI that looks like a funded enterprise SaaS product (think Linear, Vercel, Stripe Dashboard, Retool) — **not** a Bootstrap/admin-template look.

---

## PHASE 1 — Design Foundations (Tokens)

Do NOT hardcode colors/spacing in components. Define everything as tokens first.

### 1.1 Color System (`tailwind.config.js`)
Use a neutral gray scale + one brand accent + semantic colors. Avoid pure black/white.

```js
colors: {
  brand: {
    50:'#f2f6ff',100:'#e6edff',200:'#c2d3ff',300:'#94b0ff',
    400:'#5c85ff',500:'#3b63f5', // primary
    600:'#2c4bd1',700:'#213aa6',800:'#1a2e80',900:'#141f57'
  },
  neutral: {
    0:'#ffffff',50:'#f8f9fb',100:'#f1f2f5',200:'#e4e6eb',
    300:'#d1d5db',400:'#9aa0ac',500:'#6b7280',600:'#4b5563',
    700:'#374151',800:'#1f2430',900:'#12141a'
  },
  success:{50:'#ecfdf3',500:'#12b76a',700:'#027a48'},
  warning:{50:'#fffaeb',500:'#f79009',700:'#b54708'},
  danger: {50:'#fef3f2',500:'#f04438',700:'#b42318'},
  info:   {50:'#eff8ff',500:'#2e90fa',700:'#175cd3'}
}
```
Rule: text on `neutral.0` background uses `neutral.800/900`, never pure `#000`. Borders always `neutral.200` (light) / `neutral.700` (dark).

### 1.2 Typography
Font: **Inter** (or `Geist`) via `next/font` — variable font, no external CDN flash.
```
--font-display: 'Inter', ui-sans-serif, system-ui;
```
Type scale (rem, 1.25 minor-third-ish, tuned for dashboards):
| Token | Size | Line-height | Weight | Use |
|---|---|---|---|---|
| text-xs | 12px | 16px | 500 | table meta, badges |
| text-sm | 13px | 18px | 400/500 | body default, table cells |
| text-base | 14px | 20px | 400 | form inputs |
| text-md | 16px | 24px | 600 | card titles |
| text-lg | 18px | 26px | 600 | section headers |
| text-xl | 22px | 30px | 700 | page titles |
| text-2xl | 28px | 36px | 700 | dashboard KPI numbers |

Note: enterprise SaaS body text is smaller (13–14px) than marketing sites — this is what makes dense data UIs feel "product-grade" not "template."

### 1.3 Spacing / Grid
8pt base grid: `2,4,8,12,16,20,24,32,40,48,64`. Never use arbitrary values like `13px`, `17px`.
Page container: max-width `1440px`, side padding `24px` mobile / `32px` desktop.

### 1.4 Radius & Elevation
```
--radius-sm: 6px;   (inputs, badges)
--radius-md: 10px;  (cards, dropdowns)
--radius-lg: 16px;  (modals)
--radius-full: 999px; (pills, avatars)

shadow-xs:  0 1px 2px rgba(16,24,40,0.05);
shadow-sm:  0 1px 3px rgba(16,24,40,0.10), 0 1px 2px rgba(16,24,40,0.06);
shadow-md:  0 4px 8px rgba(16,24,40,0.10);
shadow-lg:  0 12px 24px rgba(16,24,40,0.12); (modals only)
```
Flat design with 1px borders is preferred over heavy shadows — enterprise SaaS relies on borders + subtle shadow only on elevated surfaces (popovers/modals).

### 1.5 Breakpoints
```
sm: 480px   (large phone)
md: 768px   (tablet)
lg: 1024px  (small laptop)
xl: 1280px  (desktop)
2xl: 1536px (large desktop)
```
Sidebar collapses to icon-only at `<1280px`, becomes a slide-over drawer at `<768px`.

---

## PHASE 2 — Layout Architecture

### 2.1 App Shell
```
┌─────────────┬────────────────────────────────────┐
│  Sidebar     │  Topbar (breadcrumb, search, avatar)│
│  (240px,     ├────────────────────────────────────┤
│  collapsible │  Page header (title + primary CTA)  │
│  to 72px)    ├────────────────────────────────────┤
│              │  Content (cards / table / form)     │
└─────────────┴────────────────────────────────────┘
```
- Sidebar: logo top, nav grouped by section (Dashboard, Products, Materials, Labour, Assignments, Reports, Settings), collapse toggle bottom.
- Topbar: global search (⌘K command palette pattern), notification bell, user menu.
- Content max-width `1280px` centered on ultra-wide screens — never let tables stretch edge-to-edge on a 27" monitor.

### 2.2 Responsive Rules
- **Sidebar**: full (240px) → icon rail (72px) at `lg` → off-canvas drawer at `md` and below.
- **Data tables**: on `<md`, convert rows to stacked cards (label:value pairs) instead of horizontal scroll — horizontal-scroll tables are a template smell.
- **KPI cards**: 4-col grid → 2-col at `md` → 1-col at `sm`.
- **Forms**: 2-column grid → 1-column at `md`.
- Touch targets ≥ 44×44px on any breakpoint below `lg`.

---

## PHASE 3 — Core Components (build once, reuse everywhere)

For each component below: build as a standalone file in `/components/ui/`, fully typed props, no inline magic values.

1. **Button** — variants: `primary, secondary, outline, ghost, danger, link`; sizes `sm/md/lg`; `isLoading` prop swaps label for spinner, disables pointer events, keeps width (no layout shift).
2. **Input / Select / Textarea** — label above field, helper text below, error state turns border `danger.500` + red helper text + shake animation (150ms) on submit-fail.
3. **Badge / Tag** — for status (`In Stock`, `Low Stock`, `Assigned`, `Completed`) — soft background (`success.50`) + solid text (`success.700`), never solid-fill loud colors.
4. **Card** — `neutral.0` bg, `1px solid neutral.200`, `radius-md`, `shadow-xs`; hover state `shadow-sm` + border `neutral.300` transition 150ms.
5. **DataTable** — sticky header, sortable columns (chevron icon), row hover bg `neutral.50`, row click opens detail drawer, checkbox column for bulk actions, sticky "selected N rows" action bar.
6. **Modal / Drawer** — Drawer (slide from right, 480px) for create/edit forms — feels more "product" than centered modals for anything with >4 fields. Modal (centered, max 560px) only for confirmations.
7. **Command Palette (⌘K)** — global product/labour search, keyboard-navigable.
8. **Avatar** — initials fallback with deterministic color from name hash.
9. **Toast** — bottom-right stack, auto-dismiss 4s, colored left-border by type, pause-on-hover.
10. **Tabs, Tooltip, Dropdown Menu, Popover, Stepper (multi-step BOM form), Combobox (searchable material/labour picker).**

---

## PHASE 4 — Icons (SVG system)

- Use **lucide-react** exclusively (consistent 24×24 grid, 1.5–2px stroke) — never mix icon packs (instant "template" tell).
- Standard sizes: `16px` inline-with-text, `20px` buttons/inputs, `24px` nav/empty-states.
- `stroke-width: 1.75` app-wide for a refined, non-clunky look.
- Icons are always paired with a text label in primary nav (never icon-only nav without tooltip).
- Custom icons needed (leather hide, thread spool, sewing needle) → build as inline SVG components in the same stroke style as lucide, not flat-fill clipart.

---

## PHASE 5 — Motion & Micro-interactions (Framer Motion)

Rule: motion should feel **fast and purposeful** (150–250ms), never decorative/bouncy — enterprise ≠ playful.

| Interaction | Duration | Easing | Detail |
|---|---|---|---|
| Page transition | 200ms | `easeOut` | fade + 8px slide-up |
| Modal/Drawer open | 220ms | `cubic-bezier(0.16,1,0.3,1)` | scale 0.98→1 + fade (modal), slide-in (drawer) |
| Dropdown/Popover | 120ms | `easeOut` | fade + 4px slide |
| Button press | 100ms | `easeInOut` | scale 0.97 |
| Row insert/delete (table) | 200ms | `easeInOut` | height collapse + fade |
| Toast enter/exit | 250ms | `easeOut` | slide from right + fade |
| Skeleton shimmer | 1.5s loop | `linear` | gradient sweep |
| Number count-up (KPI cards) | 600ms | `easeOut` | animate value on data load |

Respect `prefers-reduced-motion` — disable transforms, keep opacity fades only.

---

## PHASE 6 — Loading, Skeleton & Empty Patterns

- **Skeleton loaders** mirror the exact shape of the real content (table skeleton = same column widths, card skeleton = same card layout) — never a generic spinner for content that has predictable shape.
- **Spinner** reserved for: button loading state, full-page initial auth check.
- **Progress bar** (top of page, 2px, brand color) for route transitions / long PDF generation.
- **Empty states**: icon (24–32px, `neutral.400`) + short title + one-line description + primary CTA. E.g., Products empty → "No products yet" / "Create your first product to start tracking materials." / [+ Add Product].

---

## PHASE 7 — Data-heavy Patterns (Pagination, Filters, Search)

### Pagination
- Server-side pagination for Products/Labour/Assignments tables (never load all rows client-side once data grows).
- Pattern: `Showing 1–20 of 134` + page-size selector (`10/20/50/100`) + prev/next + jump-to-page for >5 pages.
- URL-synced (`?page=2&pageSize=20`) so state survives refresh/back button.

### Filters
- Filter bar above table: search input (debounced 300ms) + dropdown filters (Category, Material type, Stock status, Labour) + "Clear all" chip row showing active filters as removable pills.
- Filters + pagination + sort all sync to URL query params.

### Sorting
- Click column header → cycles asc/desc/none, shown via chevron icon, one active sort at a time (or multi-sort with shift-click for advanced users).

---

## PHASE 8 — Anti-Template Checklist (self-review before shipping any screen)

- [ ] Not using default shadcn/Tailwind UI colors verbatim — brand palette applied
- [ ] No component uses arbitrary one-off spacing not on the 8pt scale
- [ ] Every data table has: loading skeleton, empty state, error state, pagination, filter bar
- [ ] Every async button has isLoading state (no dead double-click zone)
- [ ] Mobile view tested at 375px — no horizontal scroll except intentional carousels
- [ ] All icons from one icon set, one stroke width
- [ ] Motion durations consistent app-wide (no screen with 500ms transitions next to one with 100ms)
- [ ] Dark mode tokens defined even if not launched first (`neutral` scale flips cleanly)

---

## Suggested folder structure
```
/components/ui/          -> Button, Input, Modal, Table, Badge, Toast...
/components/layout/       -> Sidebar, Topbar, PageHeader
/components/patterns/     -> DataTable, FilterBar, EmptyState, SkeletonX
/lib/design-tokens.ts     -> exported JS tokens (mirrors tailwind.config)
/styles/globals.css       -> font-face, base resets, prefers-reduced-motion
```
