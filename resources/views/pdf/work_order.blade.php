<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Work Order {{ $assignment->assignment_no }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }
        @font-face {
            font-family: 'DM Sans';
            src: url('{{ str_replace('\\', '/', storage_path('fonts/dm-sans/DMSans-Regular.ttf')) }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: 'DM Sans';
            src: url('{{ str_replace('\\', '/', storage_path('fonts/dm-sans/DMSans-SemiBold.ttf')) }}') format('truetype');
            font-weight: bold;
            font-style: normal;
        }
        @font-face {
            font-family: 'DM Sans';
            src: url('{{ str_replace('\\', '/', storage_path('fonts/dm-sans/DMSans-Italic.ttf')) }}') format('truetype');
            font-weight: normal;
            font-style: italic;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'DM Sans', 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            font-size: 11px;
            line-height: 1.35;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Top Bar: Full-Bleed Fabricator Copy */
        table.header-top-bar {
            width: 100%;
            border-collapse: collapse;
            background: #b45309;
            margin: 0;
            padding: 0;
        }
        table.header-top-bar td {
            height: 22px;
            vertical-align: middle;
            text-align: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            line-height: 1;
            padding: 0;
        }

        /* Page Content Wrapper with Calibrated A4 Margins (26mm bottom reserved for pinned footer) */
        .page-content {
            padding: 10mm 11mm 26mm 11mm;
        }

        /* Bottom-Aligned Footer: Signatures & Legal Jurisdiction */
        .footer-bottom-wrap {
            position: fixed;
            bottom: 8mm;
            left: 11mm;
            right: 11mm;
        }

        /* ================= HEADER ================= */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
        }
        .header-left {
            width: 50%;
            vertical-align: top;
            padding-right: 12px;
        }
        .header-right {
            width: 50%;
            vertical-align: top;
            padding-left: 12px;
        }

        /* Brand Left */
        .brand-logo-img {
            height: 52px;
            width: auto;
            display: block;
            margin-bottom: 5px;
        }
        .brand-tagline {
            font-size: 11.5px;
            font-weight: bold;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 4px;
        }
        .brand-address {
            font-size: 11.5px;
            color: #374151;
            line-height: 1.38;
            margin-bottom: 6px;
        }
        .brand-gstin-pill {
            display: inline-block;
            background: #fafaf9;
            border: 1px solid #e4e4e7;
            padding: 2px 7px;
            font-size: 10px;
        }
        .gstin-label {
            font-size: 8.5px;
            font-weight: bold;
            color: #6b7280;
            text-transform: uppercase;
            margin-right: 4px;
        }
        .gstin-code {
            font-weight: bold;
            color: #111827;
            font-size: 10px;
        }

        /* Right Passport Card (Height-Synchronized with Left Box) */
        .passport-card {
            width: 100%;
            background: #fafaf9;
            border: 1px solid #e2e8f0;
            border-collapse: collapse;
        }
        .passport-cell {
            padding: 4px 8px;
            vertical-align: top;
            border-bottom: 1px solid #e2e8f0;
        }
        .passport-cell-left {
            width: 55%;
            border-right: 1px solid #e2e8f0;
        }
        .passport-cell-right {
            width: 45%;
        }
        .kicker {
            font-size: 8.5px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: block;
            margin-bottom: 1px;
        }
        .val-large {
            font-size: 13.5px;
            font-weight: bold;
            color: #0f172a;
            display: block;
        }
        .val-date {
            font-size: 11.5px;
            font-weight: bold;
            color: #0f172a;
            display: block;
        }
        .manual-space {
            min-height: 16px;
            height: 16px;
            border-bottom: 1px dashed #cbd5e1;
            margin-top: 1px;
            font-size: 11px;
            color: #64748b;
            font-weight: bold;
        }
        .artisan-box {
            background: #ffffff;
            padding: 4px 8px;
        }
        .artisan-name {
            font-size: 12.5px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 1px;
        }
        .artisan-info {
            font-size: 11px;
            line-height: 1.25;
            color: #1e293b;
        }

        /* ================= SECTION 1: PRODUCT HERO ================= */
        .product-card {
            width: 100%;
            border: 1px solid #e2e8f0;
            background: #fafaf9;
            margin: 8px 0;
            border-collapse: collapse;
        }
        .product-main {
            padding: 7px 10px;
            vertical-align: middle;
            width: 78%;
            border-right: 1px solid #e2e8f0;
        }
        .product-code-lead {
            font-size: 13.5px;
            font-weight: bold;
            color: #b45309;
        }
        .product-title-sep {
            color: #cbd5e1;
            margin: 0 5px;
            font-weight: normal;
        }
        .product-title-text {
            font-size: 13.5px;
            font-weight: bold;
            color: #0f172a;
        }
        .product-qty-box {
            width: 22%;
            padding: 5px 10px;
            text-align: center;
            vertical-align: middle;
            background: #ffffff;
        }
        .qty-label {
            font-size: 9px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: block;
            margin-bottom: 1px;
        }
        .qty-num {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            line-height: 1;
        }
        .qty-unit {
            font-size: 11px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
        }

        /* ================= SECTION 2: RAW MATERIALS TABLE ================= */
        .table-wrap {
            border: 1px solid #e4e4e7;
            margin-bottom: 8px;
        }
        .bom-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        .bom-table th {
            background: #b45309;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 6px 12px;
            text-align: left;
            border-bottom: 1px solid #92400e;
            border-right: 1px solid rgba(255, 255, 255, 0.25);
        }
        .bom-table th:last-child {
            border-right: none;
        }
        .bom-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .bom-table td:last-child {
            border-right: none;
        }
        .bom-table tr:last-child td {
            border-bottom: none;
        }
        .bom-table tr:nth-child(even) {
            background: #fafaf9;
        }
        .td-sl {
            width: 50px;
            font-size: 11.5px;
            color: #b45309;
            font-weight: bold;
            text-align: center;
        }
        .mat-name-lead {
            font-weight: bold;
            color: #0f172a;
            font-size: 11.5px;
        }
        .mat-sep {
            color: #cbd5e1;
            margin: 0 4px;
            font-weight: normal;
        }
        .mat-variation-text {
            font-weight: bold;
            color: #b45309;
            font-size: 11.5px;
        }
        .td-qty {
            text-align: right;
            width: 85px;
            font-size: 11.5px;
            font-weight: bold;
            color: #09090b;
        }
        .td-unit {
            text-align: left;
            width: 65px;
            padding-left: 12px;
        }
        .unit-code {
            font-size: 11px;
            font-weight: bold;
            color: #b45309;
        }

        /* ================= SECTION 3: SIGNATURES ================= */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 6px;
            page-break-inside: avoid;
        }
        .sig-cell {
            width: 46%;
            vertical-align: top;
            text-align: center;
        }
        .sig-spacer {
            width: 8%;
        }
        .sig-stamp {
            height: 18px;
        }
        .sig-line {
            border-top: 1.5px solid #18181b;
            padding-top: 4px;
            font-size: 10px;
            font-weight: bold;
            color: #18181b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            text-align: center;
        }

        /* ================= SECTION 4: JURISDICTION ================= */
        .footer-legal {
            border-top: 1px solid #e4e4e7;
            padding-top: 5px;
            text-align: center;
            page-break-inside: avoid;
        }
        .legal-notice {
            font-size: 10px;
            font-weight: bold;
            color: #18181b;
            text-transform: uppercase;
        }
    </style>
</head>
<body>

    <!-- TOP BAR: FULL-BLEED FABRICATOR COPY -->
    <table class="header-top-bar" cellpadding="0" cellspacing="0">
        <tr>
            <td>Fabricator Copy</td>
        </tr>
    </table>

    <div class="page-content">
        <!-- HEADER: COMPANY ON LEFT, JOB PASSPORT ON RIGHT -->
        <table class="header-table">
            <tr>
                <!-- COMPANY DETAILS LEFT -->
                <td class="header-left">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" class="brand-logo-img" alt="Salah International">
                    @else
                        <div style="font-size: 18px; font-weight: bold; color: #b45309; margin-bottom: 4px;">SALAH INTERNATIONAL</div>
                    @endif
                    <div class="brand-tagline">Exporter &amp; Manufacturer of Leather Goods</div>
                    <div class="brand-address">
                        31/18 Topsia Road (South), 3rd Floor,<br>
                        Kolkata - 700046, West Bengal, India
                    </div>
                    <div class="brand-gstin-pill">
                        <span class="gstin-label">GST NO.</span>
                        <span class="gstin-code">19AEQFS1716K1ZH</span>
                    </div>
                </td>

                <!-- PASSPORT CARD RIGHT -->
                <td class="header-right">
                    <table class="passport-card">
                        <!-- ROW 1: WO NO & ISSUE DATE -->
                        <tr>
                            <td class="passport-cell passport-cell-left">
                                <span class="kicker">Work Order No.</span>
                                <span class="val-large">#{{ $assignment->assignment_no }}</span>
                            </td>
                            <td class="passport-cell passport-cell-right">
                                <span class="kicker">Issue Date</span>
                                <span class="val-date">{{ $assignment->assigned_at ? $assignment->assigned_at->format('d M Y') : now()->format('d M Y') }}</span>
                            </td>
                        </tr>
                        <!-- ROW 2: RATE & DELIVERY DATE (MANUAL HANDWRITING AREA) -->
                        <tr>
                            <td class="passport-cell passport-cell-left" style="background: #fafaf9;">
                                <span class="kicker">Rate</span>
                                <div class="manual-space">
                                    <span style="font-family: 'DejaVu Sans', sans-serif; font-size: 11px; font-weight: bold; color: #64748b;">&#8377;</span>
                                </div>
                            </td>
                            <td class="passport-cell passport-cell-right" style="background: #fafaf9;">
                                <span class="kicker">Delivery Date</span>
                                <div class="manual-space"></div>
                            </td>
                        </tr>
                        <!-- ROW 3: ASSIGNED FABRICATOR -->
                        <tr>
                            <td colspan="2" class="artisan-box">
                                <span class="kicker">Assigned Fabricator</span>
                                <div class="artisan-name">{{ $labour->name }}</div>
                                <div class="artisan-info">
                                    {{ $labour->phone }}
                                </div>
                                <div class="artisan-info">
                                    {{ $labour->address ?? 'Topsia Atelier, Kolkata - 700046' }}
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- SECTION 1: PRODUCT HERO -->
        <table class="product-card">
            <tr>
                <td class="product-main">
                    <span class="product-code-lead">{{ $product->code }}</span>
                    <span class="product-title-sep">|</span>
                    <span class="product-title-text">{{ $product->name }}</span>
                </td>
                <td class="product-qty-box">
                    <span class="qty-label">Total Qty</span>
                    <span class="qty-num">{{ $assignment->quantity }} <span class="qty-unit">Pcs</span></span>
                </td>
            </tr>
        </table>

        <!-- SECTION 2: RAW MATERIALS TABLE (BOM LEDGER) -->
        <div class="table-wrap">
            <table class="bom-table">
                <thead>
                    <tr>
                        <th style="width: 50px; text-align: center;">SL No.</th>
                        <th>Description</th>
                        <th style="text-align: right; width: 85px;">Quantity</th>
                        <th style="text-align: left; width: 65px; padding-left: 12px;">Unit</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($materials as $mat)
                    <tr>
                        <td class="td-sl">{{ sprintf('%02d', $loop->iteration) }}</td>
                        <td>
                            <span class="mat-name-lead">{{ $mat->material?->name ?? $mat->label }}</span>
                            @if($mat->variant && $mat->variant->name !== 'Standard')
                                <span class="mat-sep">|</span>
                                <span class="mat-variation-text">{{ $mat->variant->name }}</span>
                            @endif
                        </td>
                        <td class="td-qty">{{ number_format($mat->quantity_used, 2) }}</td>
                        <td class="td-unit"><span class="unit-code">{{ $mat->unit ?? $mat->material?->base_unit ?? 'pcs' }}</span></td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 12px; color: #64748b;">
                            No allocated raw materials recorded for this batch.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- BOTTOM-ALIGNED FOOTER: SIGNATURES & JURISDICTION -->
    <div class="footer-bottom-wrap">
        <!-- SECTION 3: SIGNATURES -->
        <table class="signatures-table">
            <tr>
                <td class="sig-cell">
                    <div class="sig-stamp"></div>
                    <div class="sig-line">Production Supervisor Signature</div>
                </td>
                <td class="sig-spacer"></td>
                <td class="sig-cell">
                    <div class="sig-stamp"></div>
                    <div class="sig-line">Fabricator Signature</div>
                </td>
            </tr>
        </table>

        <!-- SECTION 4: JURISDICTION LEGAL NOTICE -->
        <div class="footer-legal">
            <div class="legal-notice">All Disputes Are Subject to Kolkata Jurisdiction.</div>
        </div>
    </div>

</body>
</html>
