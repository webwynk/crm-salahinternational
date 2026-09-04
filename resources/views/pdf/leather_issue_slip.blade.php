<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Leather Issue Slip {{ $assignment->assignment_no }}</title>
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

        /* Top Bar: Full-Bleed Leather Cutting Voucher Banner */
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

        /* Page Content Wrapper with Calibrated A4 Margins */
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
            margin-bottom: 12px;
        }
        .header-left {
            width: 54%;
            vertical-align: top;
            padding-right: 12px;
        }
        .header-right {
            width: 46%;
            vertical-align: top;
            padding-left: 6px;
        }

        /* Brand Left (Exact Image 1) */
        .brand-logo-img {
            height: 52px;
            width: auto;
            display: block;
            margin-bottom: 4px;
        }
        .brand-logo-fallback {
            font-size: 18px;
            font-weight: bold;
            color: #b45309;
            margin-bottom: 4px;
        }
        .brand-tagline {
            font-size: 11.5px;
            font-weight: bold;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
            line-height: 1.15;
        }
        .brand-address {
            font-size: 11.5px;
            color: #374151;
            line-height: 1.25;
            margin-bottom: 3px;
        }
        .brand-gstin-pill {
            display: inline-block;
            font-size: 11px;
            margin-top: 3px;
            line-height: 1.15;
        }
        .gstin-label {
            font-size: 10.5px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            margin-right: 4px;
        }
        .gstin-code {
            font-weight: bold;
            color: #0f172a;
            font-size: 12px;
            letter-spacing: 0.4px;
        }

        /* Header Right Passport Card (Exact Image 2) */
        .passport-card {
            width: 100%;
            background: #fafaf9;
            border: 1px solid #e2e8f0;
            border-collapse: collapse;
        }
        .passport-cell {
            padding: 8px 12px 9px 12px;
            vertical-align: middle;
        }
        .passport-cell-left {
            width: 55%;
            border-right: 1px solid #e2e8f0;
        }
        .passport-cell-right {
            width: 45%;
        }
        .kicker {
            font-size: 9.5px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            display: block;
            line-height: 1.0;
            margin-bottom: 3px;
        }
        .val-large {
            font-size: 14.5px;
            font-weight: bold;
            color: #0f172a;
            display: block;
            line-height: 1.15;
        }
        .val-date {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            display: block;
            line-height: 1.15;
        }

        /* ================= SECTION 1: PRODUCT HERO ================= */
        .product-card {
            width: 100%;
            border: 1px solid #e2e8f0;
            background: #fafaf9;
            margin-top: 14px;
            margin-bottom: 14px;
            border-collapse: collapse;
        }
        .product-main {
            padding: 8px 12px;
            vertical-align: middle;
            width: 78%;
            border-right: 1px solid #e2e8f0;
        }
        .product-code-lead {
            font-size: 13.5px;
            font-weight: bold;
            color: #b45309;
            line-height: 1.1;
        }
        .product-title-sep {
            color: #cbd5e1;
            margin: 0 6px;
            font-weight: normal;
        }
        .product-title-text {
            font-size: 13.5px;
            font-weight: bold;
            color: #0f172a;
            line-height: 1.1;
        }
        .product-color-lead {
            font-size: 12.5px;
            font-weight: bold;
            color: #b45309;
            line-height: 1.1;
        }
        .product-qty-box {
            width: 22%;
            padding: 8px 12px;
            text-align: center;
            vertical-align: middle;
            background: #ffffff;
        }
        .qty-label {
            font-size: 8.5px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: block;
            line-height: 1.0;
            margin-bottom: 2px;
        }
        .qty-num {
            font-size: 19px;
            font-weight: bold;
            color: #0f172a;
            line-height: 1.0;
        }
        .qty-unit {
            font-size: 10.5px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
            line-height: 1.0;
        }

        /* ================= SECTION 2: RAW LEATHER TABLE (4 COLUMNS) ================= */
        .table-wrap {
            border: 1px solid #e4e4e7;
            margin-top: 14px;
            margin-bottom: 14px;
        }
        .bom-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
        }
        .bom-table th {
            background: #b45309;
            color: #ffffff;
            font-size: 10.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 7px 10px;
            text-align: left;
            border-bottom: 1px solid #92400e;
            border-right: 1px solid rgba(255, 255, 255, 0.25);
            line-height: 1.1;
        }
        .bom-table th:last-child {
            border-right: none;
        }
        .bom-table td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            vertical-align: middle;
            line-height: 1.15;
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
            font-size: 12px;
            color: #b45309;
            font-weight: bold;
            text-align: center;
            line-height: 1.15;
        }
        .mat-name-lead {
            font-weight: bold;
            color: #0f172a;
            font-size: 12.5px;
            line-height: 1.15;
        }
        .mat-sep {
            color: #cbd5e1;
            margin: 0 4px;
            font-weight: normal;
        }
        .mat-variation-text {
            font-weight: bold;
            color: #b45309;
            font-size: 12px;
            line-height: 1.15;
        }
        .td-qty {
            text-align: right;
            width: 90px;
            font-size: 13.5px;
            font-weight: bold;
            color: #09090b;
            line-height: 1.15;
        }
        .td-unit {
            text-align: left;
            width: 70px;
            padding-left: 10px;
            line-height: 1.15;
        }
        .unit-code {
            font-size: 12px;
            font-weight: bold;
            color: #b45309;
            line-height: 1.15;
        }

        /* ================= PROMINENT TOTAL RAW LEATHER BANNER ================= */
        .leather-total-banner {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #b45309;
            background: #fffbeb;
            margin-top: 14px;
            margin-bottom: 14px;
        }
        .total-label-cell {
            padding: 9px 14px;
            font-size: 11.5px;
            font-weight: bold;
            color: #78350f;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            vertical-align: middle;
            width: 65%;
        }
        .total-value-cell {
            padding: 9px 14px;
            font-size: 15px;
            font-weight: bold;
            color: #92400e;
            text-align: right;
            vertical-align: middle;
            letter-spacing: 0.5px;
            width: 35%;
        }

        /* Supervisory Notes Box */
        .notes-box {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            padding: 6px 10px;
            margin-top: 10px;
            font-size: 9px;
            color: #334155;
        }
        .notes-kicker {
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.5px;
            margin-bottom: 1px;
        }

        /* ================= SECTION 3: SIGNATURES (2 BLOCKS) ================= */
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
            height: 32px;
        }
        .sig-line {
            border-top: 1px solid #94a3b8;
            padding-top: 4px;
            font-size: 9.5px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        /* ================= SECTION 4: LEGAL JURISDICTION ================= */
        .footer-legal {
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            text-align: center;
            page-break-inside: avoid;
        }
        .legal-notice {
            font-size: 10.5px;
            font-weight: bold;
            color: #b45309;
            letter-spacing: 0.8px;
            margin-bottom: 2px;
        }
        .footer-sub {
            font-size: 8px;
            color: #64748b;
        }
    </style>
</head>
<body>

    <!-- TOP BAR: FULL-BLEED LEATHER CUTTING VOUCHER -->
    <table class="header-top-bar">
        <tr>
            <td>LEATHER CUTTING VOUCHER &mdash; WAREHOUSE ISSUE SLIP</td>
        </tr>
    </table>

    <!-- MAIN PAGE CONTENT -->
    <div class="page-content">

        <!-- HEADER TABLE: 2-COLUMN BRAND & ORDER META -->
        <table class="header-table">
            <tr>
                <!-- LEFT COLUMN: BRAND & STATUTORY META (EXACT IMAGE 1) -->
                <td class="header-left">
                    @if(isset($logoBase64) && $logoBase64)
                        <img src="{{ $logoBase64 }}" alt="Salah Logo" class="brand-logo-img">
                    @else
                        <div class="brand-logo-fallback">SALAH INTERNATIONAL</div>
                    @endif
                    <div class="brand-tagline">EXPORTER &amp; MANUFACTURER OF LEATHER GOODS</div>
                    <div class="brand-address">
                        31/18 Topsia Road (South), 3rd Floor,<br>
                        Kolkata - 700046, West Bengal, India
                    </div>
                    <div class="brand-gstin-pill">
                        <span class="gstin-label">GST NO.</span>
                        <span class="gstin-code">19AEQFS1716K1ZH</span>
                    </div>
                </td>

                <!-- RIGHT COLUMN: ORDER META (EXACT IMAGE 2) -->
                <td class="header-right">
                    <table class="passport-card">
                        <tr>
                            <td class="passport-cell passport-cell-left">
                                <span class="kicker">WORK ORDER NO.</span>
                                <span class="val-large">#{{ $assignment->assignment_no }}</span>
                            </td>
                            <td class="passport-cell passport-cell-right">
                                <span class="kicker">ISSUE DATE</span>
                                <span class="val-date">{{ $assignment->created_at ? $assignment->created_at->format('d M Y') : now()->format('d M Y') }}</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- SECTION 1: PRODUCT HERO WITH ARTICLE COLOR -->
        <table class="product-card">
            <tr>
                <td class="product-main">
                    <span class="product-code-lead">{{ $product?->code ?? 'PROD' }}</span>
                    <span class="product-title-sep">|</span>
                    <span class="product-title-text">{{ $product?->name ?? 'Custom Leather Article' }}</span>
                    @if($assignment->color || (isset($color) && $color))
                        @php $activeColor = $assignment->color ?? $color; @endphp
                        <span class="product-title-sep">|</span>
                        <span class="product-color-lead">Color: {{ $activeColor->color_name }}</span>
                    @endif
                </td>
                <td class="product-qty-box">
                    <span class="qty-label">Target Qty</span>
                    <span class="qty-num">{{ $assignment->quantity ?? 1 }} <span class="qty-unit">Pcs</span></span>
                </td>
            </tr>
        </table>

        <!-- SECTION 2: ALLOCATED LEATHER HIDES (4 COLUMNS, COMPONENT CUT PART REMOVED) -->
        <div class="table-wrap">
            <table class="bom-table">
                <thead>
                    <tr>
                        <th style="width: 50px; text-align: center;">SL No.</th>
                        <th>Leather Hide &amp; Tannage Description</th>
                        <th style="text-align: right; width: 90px;">Issued Qty</th>
                        <th style="text-align: left; width: 70px; padding-left: 10px;">Unit</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($leatherMaterials as $mat)
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
                        <td class="td-unit"><span class="unit-code">{{ strtoupper(str_replace(' ', '_', trim($mat->unit ?? 'sq_ft'))) }}</span></td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 12px; color: #64748b;">
                            No raw leather materials allocated for this work order (Non-leather product batch).
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- PROMINENT TOTAL RAW LEATHER ISSUED FROM WAREHOUSE BANNER -->
        <table class="leather-total-banner">
            <tr>
                <td class="total-label-cell">TOTAL RAW LEATHER ISSUED FROM WAREHOUSE:</td>
                <td class="total-value-cell">{{ number_format($totalLeatherQty ?? 0, 2) }} {{ $leatherUnit ?? 'SQ_FT' }}</td>
            </tr>
        </table>

        @if($assignment->notes)
        <div class="notes-box">
            <div class="notes-kicker">Supervisor Cutting &amp; Pattern Notes:</div>
            <div>{{ $assignment->notes }}</div>
        </div>
        @endif

    </div>

    <!-- BOTTOM-ALIGNED FOOTER: SIGNATURES & JURISDICTION -->
    <div class="footer-bottom-wrap">
        <!-- SECTION 3: SIGNATURES (STOREKEEPER & PRODUCTION SUPERVISOR) -->
        <table class="signatures-table">
            <tr>
                <td class="sig-cell">
                    <div class="sig-stamp"></div>
                    <div class="sig-line">Leather Storekeeper Signature</div>
                </td>
                <td class="sig-spacer"></td>
                <td class="sig-cell">
                    <div class="sig-stamp"></div>
                    <div class="sig-line">Production Supervisor Signature</div>
                </td>
            </tr>
        </table>

        <!-- SECTION 4: JURISDICTION LEGAL NOTICE -->
        <div class="footer-legal">
            <div class="legal-notice">ALL DISPUTES ARE SUBJECT TO KOLKATA JURISDICTION.</div>
            <div class="footer-sub">Salah International Leather CRM &bull; Document #{{ $assignment->assignment_no }} &bull; Generated: {{ now()->format('d/m/Y H:i:s') }}</div>
        </div>
    </div>

</body>
</html>
