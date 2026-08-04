<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Work Order {{ $assignment->assignment_no }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #262523; font-size: 11px; line-height: 1.4; margin: 0; padding: 24px; background: #ffffff; }
        .brand-bar { background: #d97706; height: 6px; margin-bottom: 20px; border-radius: 2px; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .header-table td { vertical-align: top; }
        .company-name { font-size: 18px; font-weight: bold; color: #171717; letter-spacing: -0.5px; }
        .company-sub { font-size: 10px; color: #736e65; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 2px; }
        .wo-badge { background: #fffbeb; border: 1px solid #fde68a; color: #b45309; padding: 8px 14px; border-radius: 4px; text-align: right; display: inline-block; }
        .wo-title { font-size: 14px; font-weight: bold; color: #92400e; }
        .wo-number { font-size: 16px; font-weight: bold; font-family: monospace; color: #78350f; }
        
        .meta-grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-card { background: #f8f7f4; border: 1px solid #e5e3dc; border-radius: 6px; padding: 12px; vertical-align: top; }
        .meta-label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #736e65; margin-bottom: 6px; border-bottom: 1px solid #e5e3dc; padding-bottom: 4px; }
        .meta-row { margin-bottom: 3px; font-size: 11px; }
        .meta-row strong { color: #171717; }
        
        .target-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; text-align: center; vertical-align: middle; }
        .target-val { font-size: 26px; font-weight: bold; color: #b45309; }

        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; tracking: 0.5px; color: #171717; border-bottom: 2px solid #e5e3dc; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table th { background: #f8f7f4; border: 1px solid #e5e3dc; padding: 8px 10px; font-size: 10px; text-transform: uppercase; text-align: left; color: #524e47; font-weight: bold; }
        .data-table td { border: 1px solid #e5e3dc; padding: 8px 10px; font-size: 11px; }
        .data-table tr:nth-child(even) { background: #faf9f6; }

        .notes-card { background: #f8f7f4; border: 1px solid #e5e3dc; border-radius: 6px; padding: 12px; font-size: 11px; color: #403d39; margin-bottom: 20px; }
        
        .signatures { width: 100%; margin-top: 45px; border-collapse: collapse; }
        .signature-cell { width: 45%; text-align: center; vertical-align: bottom; }
        .signature-line { border-top: 1px solid #a39e93; margin-top: 40px; padding-top: 6px; font-size: 10px; color: #736e65; font-weight: 500; }
        .footer-meta { margin-top: 40px; text-align: center; font-size: 9px; color: #a39e93; border-top: 1px solid #e5e3dc; padding-top: 10px; }
    </style>
</head>
<body>

    <div class="brand-bar"></div>

    <table class="header-table">
        <tr>
            <td>
                <div class="company-name">SALAH INTERNATIONAL</div>
                <div class="company-sub">Leather Goods Manufacturing CRM — Production Job Card</div>
            </td>
            <td style="text-align: right;">
                <div class="wo-badge">
                    <div class="wo-title">WORK ORDER</div>
                    <div class="wo-number">#{{ $assignment->assignment_no }}</div>
                </div>
            </td>
        </tr>
    </table>

    <table class="meta-grid">
        <tr>
            <td className="meta-card" width="48%">
                <div class="meta-label">Work Order Details</div>
                <div class="meta-row"><strong>Assigned Date:</strong> {{ $assignment->assigned_at ? $assignment->assigned_at->format('d M Y, h:i A') : now()->format('d M Y') }}</div>
                <div class="meta-row"><strong>Assigned By:</strong> {{ $assignment->assigner?->name ?? 'Admin Supervisor' }}</div>
                <div class="meta-row"><strong>Status:</strong> {{ $assignment->status }}</div>
            </td>
            <td width="4%"></td>
            <td className="meta-card" width="48%">
                <div class="meta-label">Assigned Artisan Worker</div>
                <div class="meta-row"><strong>Artisan:</strong> {{ $labour->name }}</div>
                <div class="meta-row"><strong>Phone:</strong> {{ $labour->phone }}</div>
                <div class="meta-row"><strong>Skills:</strong> {{ is_array($labour->skill_tags) ? implode(', ', $labour->skill_tags) : 'Craftsman' }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Product & Quantity Specifications</div>
    <table class="meta-grid">
        <tr>
            <td className="meta-card" width="68%">
                <div class="meta-row"><strong>Product Name:</strong> {{ $product->name }}</div>
                <div class="meta-row"><strong>Product Code:</strong> <span style="font-family: monospace;">{{ $product->code }}</span></div>
                <div class="meta-row"><strong>Category:</strong> {{ $product->category ?? 'General Leather Goods' }}</div>
                <div class="meta-row"><strong>Craft Notes:</strong> {{ $product->description ?? 'Follow master craftsman guidelines' }}</div>
            </td>
            <td width="4%"></td>
            <td class="target-box" width="28%">
                <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #92400e; margin-bottom: 4px;">TARGET QUANTITY</div>
                <div class="target-val">{{ $assignment->quantity }} Pcs</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Allocated Raw Materials & Inventory Deduction Ledger</div>
    <table class="data-table">
        <thead>
            <tr>
                <th width="8%">#</th>
                <th width="47%">Material / Component Description</th>
                <th width="25%">Allocated Qty (Total)</th>
                <th width="20%">Unit of Measure</th>
            </tr>
        </thead>
        <tbody>
            @foreach($materials as $idx => $mat)
            <tr>
                <td>{{ $idx + 1 }}</td>
                <td><strong>{{ $mat->label }}</strong></td>
                <td><strong style="color: #b45309;">{{ number_format($mat->quantity_used, 2) }}</strong></td>
                <td>{{ $mat->unit }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($bomNotes->count() > 0)
    <div class="section-title">Process & Stitching Specifications</div>
    <div class="notes-card">
        <ul style="margin: 0; padding-left: 18px;">
            @foreach($bomNotes as $note)
            <li style="margin-bottom: 4px;">
                <strong>{{ $note->label }}:</strong> {{ $note->dimension_note ?? 'Follow master craftsman guidelines' }}
            </li>
            @endforeach
        </ul>
    </div>
    @endif

    @if($assignment->notes)
    <div class="section-title">Special Supervisor Instructions</div>
    <div class="notes-card">
        {{ $assignment->notes }}
    </div>
    @endif

    <table class="signatures">
        <tr>
            <td class="signature-cell">
                <div class="signature-line">Production Supervisor Signature</div>
            </td>
            <td width="10%"></td>
            <td class="signature-cell">
                <div class="signature-line">Assigned Artisan Worker Signature</div>
            </td>
        </tr>
    </table>

    <div class="footer-meta">
        Generated by Salah Intl. Leather CRM &bull; Order ID: {{ $assignment->assignment_no }} &bull; Timestamp: {{ now()->format('Y-m-d H:i:s T') }}
    </div>

</body>
</html>
