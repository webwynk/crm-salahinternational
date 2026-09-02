<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Leather Issue Slip — {{ $assignment->assignment_no }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #262523; font-size: 11px; line-height: 1.4; margin: 0; padding: 24px; background: #ffffff; }
        .brand-bar { background: #b45309; height: 6px; margin-bottom: 20px; border-radius: 2px; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .header-table td { vertical-align: top; }
        .company-name { font-size: 18px; font-weight: bold; color: #171717; letter-spacing: -0.5px; }
        .company-sub { font-size: 10px; color: #78350f; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 2px; }
        .wo-badge { background: #fffbeb; border: 1.5px solid #fde68a; color: #92400e; padding: 8px 14px; border-radius: 4px; text-align: right; display: inline-block; }
        .wo-title { font-size: 12px; font-weight: bold; color: #92400e; letter-spacing: 0.5px; }
        .wo-number { font-size: 16px; font-weight: bold; font-family: monospace; color: #78350f; }
        
        .meta-grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-card { background: #fdfbf7; border: 1px solid #e7e2d7; border-radius: 6px; padding: 12px; vertical-align: top; }
        .meta-label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #92400e; margin-bottom: 6px; border-bottom: 1px solid #e7e2d7; padding-bottom: 4px; }
        .meta-row { margin-bottom: 3px; font-size: 11px; }
        .meta-row strong { color: #171717; }
        
        .target-box { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 6px; padding: 12px; text-align: center; vertical-align: middle; }
        .target-val { font-size: 26px; font-weight: bold; color: #b45309; }

        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #78350f; border-bottom: 2px solid #b45309; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table th { background: #fef3c7; border: 1px solid #fde68a; padding: 8px 10px; font-size: 10px; text-transform: uppercase; text-align: left; color: #78350f; font-weight: bold; }
        .data-table td { border: 1px solid #e7e2d7; padding: 8px 10px; font-size: 11px; }
        .data-table tr:nth-child(even) { background: #faf8f5; }

        .notes-card { background: #fdfbf7; border: 1px solid #e7e2d7; border-radius: 6px; padding: 12px; font-size: 11px; color: #403d39; margin-bottom: 20px; }
        
        .summary-box { background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; display: table; width: 100%; box-sizing: border-box; }
        .summary-left { font-size: 12px; font-weight: bold; color: #78350f; vertical-align: middle; }
        .summary-right { text-align: right; font-size: 16px; font-weight: bold; color: #92400e; vertical-align: middle; }

        .scrap-return-box { border: 1.5px dashed #d97706; background: #fffdfa; border-radius: 6px; padding: 10px; margin-bottom: 20px; }
        .scrap-title { font-size: 10px; font-weight: bold; color: #92400e; text-transform: uppercase; margin-bottom: 4px; }
        
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
                <div class="company-sub">Leather Warehouse & Cutting Department — Leather Issue Voucher</div>
            </td>
            <td style="text-align: right;">
                <div class="wo-badge">
                    <div class="wo-title">LEATHER ISSUE SLIP</div>
                    <div class="wo-number">#{{ $assignment->assignment_no }}</div>
                </div>
            </td>
        </tr>
    </table>

    <table class="meta-grid">
        <tr>
            <td class="meta-card" width="48%">
                <div class="meta-label">Work Order Reference</div>
                <div class="meta-row"><strong>Issue Date:</strong> {{ $assignment->assigned_at ? $assignment->assigned_at->format('d M Y, h:i A') : now()->format('d M Y') }}</div>
                <div class="meta-row"><strong>Authorized By:</strong> {{ $assignment->assigner?->name ?? 'Leather Store Manager' }}</div>
                <div class="meta-row"><strong>Work Order Status:</strong> {{ $assignment->status }}</div>
            </td>
            <td width="4%"></td>
            <td class="meta-card" width="48%">
                <div class="meta-label">Artisan Craftsman Assigned</div>
                <div class="meta-row"><strong>Artisan Name:</strong> {{ $labour->name }}</div>
                <div class="meta-row"><strong>Phone Contact:</strong> {{ $labour->phone }}</div>
                <div class="meta-row"><strong>Specialization:</strong> {{ is_array($labour->skill_tags) ? implode(', ', $labour->skill_tags) : 'Leather Craftsman' }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Product Production Target</div>
    <table class="meta-grid">
        <tr>
            <td class="meta-card" width="68%">
                <div class="meta-row"><strong>Product Code / SKU:</strong> <span style="font-family: monospace; font-weight: bold;">{{ $product->code }}</span></div>
                <div class="meta-row"><strong>Product Name:</strong> {{ $product->name }}</div>
                <div class="meta-row"><strong>Category:</strong> {{ $product->category ?? 'Leather Goods' }}</div>
                <div class="meta-row"><strong>Cutting Specifications:</strong> {{ $product->description ?? 'Follow precision cutting templates' }}</div>
            </td>
            <td width="4%"></td>
            <td class="target-box" width="28%">
                <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #92400e; margin-bottom: 4px;">TARGET QUANTITY</div>
                <div class="target-val">{{ $assignment->quantity }} Pcs</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Allocated Leather Hides & Cutting Specifications</div>
    <table class="data-table">
        <thead>
            <tr>
                <th width="6%">#</th>
                <th width="34%">Leather Hide & Tannage</th>
                <th width="24%">Color Shade / Thickness</th>
                <th width="22%">Component Cut Part</th>
                <th width="14%">Issued Qty</th>
            </tr>
        </thead>
        <tbody>
            @php $totalLeatherQty = 0; $leatherUnit = 'sq_ft'; @endphp
            @forelse($leatherMaterials as $idx => $mat)
            @php 
                $totalLeatherQty += (float) $mat->quantity_used; 
                $leatherUnit = $mat->unit ?? 'sq_ft';
            @endphp
            <tr>
                <td>{{ $idx + 1 }}</td>
                <td><strong>{{ $mat->material?->name ?? $mat->label }}</strong></td>
                <td>{{ $mat->variant?->name ?? 'Standard Shade' }}</td>
                <td>{{ $mat->label }}</td>
                <td><strong style="color: #92400e; font-size: 12px;">{{ number_format($mat->quantity_used, 2) }}</strong> {{ $mat->unit }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center; color: #736e65; padding: 12px;">
                    No specific leather materials recorded for this work order.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    @if($totalLeatherQty > 0)
    <div class="summary-box">
        <span class="summary-left">TOTAL RAW LEATHER ISSUED FROM WAREHOUSE:</span>
        <span class="summary-right">{{ number_format($totalLeatherQty, 2) }} {{ strtoupper($leatherUnit) }}</span>
    </div>
    @endif

    <div class="scrap-return-box">
        <div class="scrap-title">Offcut & Scrap Return Reconciliation (To be filled by Storekeeper after cutting)</div>
        <table width="100%" style="font-size: 10px; color: #524e47; margin-top: 6px;">
            <tr>
                <td width="33%">Usable Scrap Returned: ________________ Sq. Ft</td>
                <td width="33%">Cutting Waste / Dust: ________________ %</td>
                <td width="33%">Verified By: _________________________</td>
            </tr>
        </table>
    </div>

    @if($assignment->notes)
    <div class="section-title">Warehouse Supervisor Cutting Notes</div>
    <div class="notes-card">
        {{ $assignment->notes }}
    </div>
    @endif

    <table class="signatures">
        <tr>
            <td class="signature-cell">
                <div class="signature-line">Leather Storekeeper Signature & Date</div>
            </td>
            <td width="10%"></td>
            <td class="signature-cell">
                <div class="signature-line">Artisan Worker Signature & Receipt Acknowledgement</div>
            </td>
        </tr>
    </table>

    <div class="footer-meta">
        Generated by Salah Intl. Leather CRM &bull; Document: Leather Issue Slip #{{ $assignment->assignment_no }} &bull; Timestamp: {{ now()->format('Y-m-d H:i:s T') }}
    </div>

</body>
</html>
