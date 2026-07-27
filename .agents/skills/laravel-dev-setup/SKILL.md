---
name: laravel-dev-setup
description: Laravel 11 local development setup, package stack, folder structure, background queue setup, and deployment guide for Hostinger Premium.
---

# Laravel Development Setup Skill — CRM Dashboard

Final stack: **Laravel 11 + Inertia.js + React + Tailwind CSS + MySQL**, deploying to **Hostinger Premium**.

---

## Directory Architecture
```
app/
  Http/Controllers/       -> ProductController, MaterialController, LabourController, AssignmentController
  Http/Requests/           -> StoreProductRequest, StoreAssignmentRequest
  Models/                  -> Product, Material, ProductMaterial, Inventory, StockTransaction, Labour, Assignment, AssignmentMaterial, WorkOrderPdf
  Services/                -> AssignmentService.php (stock deduction logic)
  Policies/                -> ProductPolicy, AssignmentPolicy
database/
  migrations/
  seeders/                 -> ProductSeeder
resources/
  js/
    Pages/                 -> Products/Index.jsx, Products/Show.jsx, etc.
    Components/ui/          -> Button, Input, Modal, DataTable, Badge, Toast...
    Components/layout/      -> Sidebar, Topbar, PageHeader
    Layouts/AppLayout.jsx   -> Main authenticated layout
routes/
  web.php                  -> Inertia routes with auth/role middleware
```

---

## Hostinger Queue & Background Jobs
Shared hosting cannot run `php artisan queue:work` continuously.
1. Set `QUEUE_CONNECTION=database` in `.env`.
2. Add cron job in Hostinger hPanel:
   `* * * * * cd /home/USERNAME/domains/yourdomain.com/leather-crm && php artisan schedule:run >> /dev/null 2>&1`
3. In `routes/console.php`:
   `Schedule::command('queue:work --stop-when-empty')->everyMinute();`
