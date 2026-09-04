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
            margin-bottom: 4px;
        }
        .brand-logo-fallback {
            font-size: 17px;
            font-weight: bold;
            color: #b45309;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .company-name {
            font-size: 11.5px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 1px;
            letter-spacing: 0.3px;
        }
        .company-subtitle {
            font-size: 8.5px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
            line-height: 1.2;
        }
        .company-address-block {
            font-size: 8.5px;
            color: #475569;
            line-height: 1.25;
            margin-bottom: 2px;
        }
        .tax-id-line {
            font-size: 8.5px;
            color: #1e293b;
            line-height: 1.25;
            margin-bottom: 2px;
        }
        .tax-id-item {
            display: inline-block;
            white-space: nowrap;
        }
        .tax-id-label {
            font-weight: bold;
            color: #0f172a;
        }
        .tax-id-sep {
            color: #cbd5e1;
            margin: 0 4px;
        }
        .factory-addr-line {
            font-size: 8.5px;
            color: #64748b;
            line-height: 1.25;
            margin-bottom: 2px;
        }
        .contact-line {
            font-size: 8.5px;
            color: #475569;
            line-height: 1.25;
        }
        .contact-label {
            font-weight: bold;
            color: #334155;
        }

        /* Order Meta Box (Right Column Top) */
        .wo-box {
            border: 1px solid #cbd5e1;
            background: #ffffff;
            margin-bottom: 8px;
            width: 100%;
            border-collapse: collapse;
        }
        .wo-box-header {
            background: #1e293b;
            color: #ffffff;
            padding: 5px 8px;
            text-align: center;
        }
        .wo-box-title {
            font-size: 8.5px;
            font-weight: bold;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #f1f5f9;
        }
        .wo-box-body {
            padding: 6px 10px;
        }
        .wo-num-row {
            text-align: center;
            padding-bottom: 4px;
            margin-bottom: 4px;
            border-bottom: 1px dashed #e2e8f0;
        }
        .wo-num-label {
            font-size: 8.5px;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-right: 4px;
        }
        .wo-num-val {
            font-size: 13.5px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
        }
        .wo-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .wo-meta-lbl {
            font-size: 9px;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            width: 48%;
            padding: 1.5px 0;
        }
        .wo-meta-val {
            font-size: 9px;
            color: #0f172a;
            font-weight: bold;
            text-align: right;
            padding: 1.5px 0;
        }

        /* Artisan Craftsman Card (Right Column Bottom) */
        .artisan-box {
            border: 1px solid #cbd5e1;
            border-left: 3.5px solid #b45309;
            background: #ffffff;
            padding: 6px 10px;
            width: 100%;
        }
        .artisan-kicker {
            font-size: 8.5px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            display: block;
            margin-bottom: 1px;
        }
        .artisan-name {
            font-size: 12.5px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 2px;
        }
        .artisan-meta-line {
            font-size: 9.5px;
            color: #1e293b;
            line-height: 1.25;
        }
        .artisan-meta-lbl {
            font-weight: bold;
            color: #475569;
        }
        .artisan-meta-val {
            color: #1e293b;
        }

        /* Production Metadata Strip: Rate, Delivery Date & Colorway */
        .meta-strip-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            margin-top: 10px;
            margin-bottom: 12px;
        }
        .meta-strip-cell {
            padding: 5px 8px;
            vertical-align: middle;
            border-right: 1px solid #e2e8f0;
        }
        .meta-strip-cell:last-child {
            border-right: none;
        }
        .meta-strip-cell-rate {
            width: 32%;
        }
        .meta-strip-cell-delivery {
            width: 34%;
        }
        .meta-strip-cell-color {
            width: 34%;
            background: #fffbeb;
        }
        .meta-kicker {
            font-size: 8.5px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            display: block;
            line-height: 1;
            margin-bottom: 2px;
        }
        .manual-space {
            height: 14px;
            line-height: 14px;
        }
        .meta-val-color {
            font-size: 11.5px;
            font-weight: bold;
            color: #92400e;
            display: block;
            line-height: 1.1;
        }
        .meta-val-standard {
            font-size: 11.5px;
            font-weight: bold;
            color: #64748b;
            display: block;
            line-height: 1.1;
        }

        /* ================= SECTION 1: PRODUCT HERO ================= */
        .product-card {
            width: 100%;
            border: 1px solid #e2e8f0;
            background: #fafaf9;
            margin: 12px 0;
            border-collapse: collapse;
        }
        .product-main {
            padding: 6px 12px;
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
        .product-qty-box {
            width: 22%;
            padding: 6px 12px;
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

        /* ================= SECTION 2: RAW LEATHER TABLE ================= */
        .table-wrap {
            border: 1px solid #e4e4e7;
            margin-top: 12px;
            margin-bottom: 12px;
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
            padding: 6.5px 10px;
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
            width: 45px;
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
        .td-part {
            font-size: 11.5px;
            color: #475569;
            font-weight: 500;
        }
        .td-qty {
            text-align: right;
            width: 85px;
            font-size: 13px;
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
            margin-top: 10px;
            margin-bottom: 12px;
        }
        .total-label-cell {
            padding: 8px 12px;
            font-size: 11.5px;
            font-weight: bold;
            color: #78350f;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            vertical-align: middle;
            width: 65%;
        }
        .total-value-cell {
            padding: 8px 14px;
            font-size: 15px;
            font-weight: bold;
            color: #92400e;
            text-align: right;
            vertical-align: middle;
            letter-spacing: 0.5px;
            width: 35%;
        }

        /* Offcut Scrap Reconciliation Box */
        .scrap-reconcile-box {
            border: 1px dashed #d97706;
            background: #fffdfa;
            padding: 6px 10px;
            margin-top: 8px;
            margin-bottom: 10px;
        }
        .scrap-kicker {
            font-size: 8.5px;
            font-weight: bold;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
        }
        .scrap-meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            color: #475569;
        }
        .scrap-meta-table td {
            padding: 2px 4px;
            vertical-align: middle;
        }

        /* Supervisory Notes Box */
        .notes-box {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            padding: 5px 10px;
            margin-top: 8px;
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

        /* ================= SECTION 3: SIGNATURES ================= */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 6px;
            page-break-inside: avoid;
        }
        .sig-cell {
            width: 30%;
            vertical-align: top;
            text-align: center;
        }
        .sig-spacer {
            width: 5%;
        }
        .sig-stamp {
            height: 28px;
        }
        .sig-line {
            border-top: 1px solid #94a3b8;
            padding-top: 4px;
            font-size: 9px;
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
                <!-- LEFT COLUMN: BRAND & STATUTORY META -->
                <td class="header-left">
                    @if(isset($logoBase64) && $logoBase64)
                        <img src="{{ $logoBase64 }}" alt="Salah Logo" class="brand-logo-img">
                    @else
                        <div class="brand-logo-fallback">SALAH INTERNATIONAL</div>
                    @endif
                    <div class="company-name">SALAH INTERNATIONAL</div>
                    <div class="company-subtitle">Leather Warehouse &amp; Cutting Department</div>
                    
                    <div class="company-address-block">
                        11/1C, Topsia Road (South), Kolkata - 700046, West Bengal, India
                    </div>

                    <div class="tax-id-line">
                        <span class="tax-id-item"><span class="tax-id-label">GSTIN:</span> 19AAYCS2414Q1Z1</span>
                        <span class="tax-id-sep">|</span>
                        <span class="tax-id-item"><span class="tax-id-label">PAN:</span> AAYCS2414Q</span>
                        <span class="tax-id-sep">|</span>
                        <span class="tax-id-item"><span class="tax-id-label">IEC:</span> 0216913506</span>
                    </div>

                    <div class="factory-addr-line">
                        <strong>Factory:</strong> Kolkata Leather Complex (KLC), Zone-9, Plot 1422, Bantala, WB
                    </div>

                    <div class="contact-line">
                        <span class="contact-label">Email:</span> info@salahinternational.com &bull; 
                        <span class="contact-label">Phone:</span> +91 33 2285 1010
                    </div>
                </td>

                <!-- RIGHT COLUMN: DOCUMENT META & ARTISAN DETAILS -->
                <td class="header-right">
                    <!-- ORDER REFERENCE BOX -->
                    <table class="wo-box">
                        <tr>
                            <td class="wo-box-header">
                                <span class="wo-box-title">LEATHER ISSUE SLIP</span>
                            </td>
                        </tr>
                        <tr>
                            <td class="wo-box-body">
                                <div class="wo-num-row">
                                    <span class="wo-num-label">Work Order:</span>
                                    <span class="wo-num-val">#{{ $assignment->assignment_no }}</span>
                                </div>
                                <table class="wo-meta-table">
                                    <tr>
                                        <td class="wo-meta-lbl">Issue Date:</td>
                                        <td class="wo-meta-val">{{ $assignment->created_at ? $assignment->created_at->format('d/m/Y') : now()->format('d/m/Y') }}</td>
                                    </tr>
                                    <tr>
                                        <td class="wo-meta-lbl">Issue Time:</td>
                                        <td class="wo-meta-val">{{ $assignment->created_at ? $assignment->created_at->format('h:i A') : now()->format('h:i A') }}</td>
                                    </tr>
                                    <tr>
                                        <td class="wo-meta-lbl">Authorized By:</td>
                                        <td class="wo-meta-val">{{ $assignment->assigner?->name ?? 'Store Manager' }}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- ARTISAN CRAFTSMAN & CUTTING SECTION CARD -->
                    <div class="artisan-box">
                        <span class="artisan-kicker">Artisan Worker &bull; Cutting Section</span>
                        <div class="artisan-name">{{ $labour?->name ?? 'Unassigned Artisan' }}</div>
                        <div class="artisan-meta-line">
                            <span class="artisan-meta-lbl">Phone:</span>
                            <span class="artisan-meta-val">{{ $labour?->phone ?? 'N/A' }}</span>
                            <span style="color: #cbd5e1; margin: 0 4px;">|</span>
                            <span class="artisan-meta-lbl">Dept:</span>
                            <span class="artisan-meta-val">Leather Cutting</span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- PRODUCTION METADATA STRIP: RATE, DELIVERY DATE & COLORWAY -->
        <table class="meta-strip-table">
            <tr>
                <td class="meta-strip-cell meta-strip-cell-rate">
                    <span class="meta-kicker">Cutting Rate</span>
                    <div class="manual-space">
                        <span style="font-family: 'DejaVu Sans', sans-serif; font-size: 12px; font-weight: bold; color: #64748b;">&#8377;</span>
                    </div>
                </td>
                <td class="meta-strip-cell meta-strip-cell-delivery">
                    <span class="meta-kicker">Target Delivery Date</span>
                    <div class="manual-space"></div>
                </td>
                <td class="meta-strip-cell meta-strip-cell-color">
                    <span class="meta-kicker">Article Color</span>
                    @if($assignment->color || (isset($color) && $color))
                        @php $activeColor = $assignment->color ?? $color; @endphp
                        <span class="meta-val-color">{{ $activeColor->color_name }}</span>
                    @else
                        <span class="meta-val-standard">Standard Color</span>
                    @endif
                </td>
            </tr>
        </table>

        <!-- SECTION 1: PRODUCT HERO -->
        <table class="product-card">
            <tr>
                <td class="product-main">
                    <span class="product-code-lead">{{ $product?->code ?? 'PROD' }}</span>
                    <span class="product-title-sep">|</span>
                    <span class="product-title-text">{{ $product?->name ?? 'Custom Leather Article' }}</span>
                </td>
                <td class="product-qty-box">
                    <span class="qty-label">Target Qty</span>
                    <span class="qty-num">{{ $assignment->quantity ?? 1 }} <span class="qty-unit">Pcs</span></span>
                </td>
            </tr>
        </table>

        <!-- SECTION 2: ALLOCATED LEATHER HIDES & SPECIFICATIONS TABLE -->
        <div class="table-wrap">
            <table class="bom-table">
                <thead>
                    <tr>
                        <th style="width: 45px; text-align: center;">SL No.</th>
                        <th>Leather Hide &amp; Tannage Description</th>
                        <th style="width: 140px;">Component Cut Part</th>
                        <th style="text-align: right; width: 85px;">Issued Qty</th>
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
                        <td class="td-part">{{ $mat->label ?? 'General Component' }}</td>
                        <td class="td-qty">{{ number_format($mat->quantity_used, 2) }}</td>
                        <td class="td-unit"><span class="unit-code">{{ strtoupper(str_replace(' ', '_', trim($mat->unit ?? 'sq_ft'))) }}</span></td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 12px; color: #64748b;">
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

        <!-- OFFCUT & SCRAP RETURN RECONCILIATION BOX -->
        <div class="scrap-reconcile-box">
            <div class="scrap-kicker">Offcut &amp; Scrap Return Reconciliation (To be completed by Storekeeper upon cutting completion)</div>
            <table class="scrap-meta-table">
                <tr>
                    <td style="width: 35%;"><strong>Usable Offcuts Returned:</strong> ________________ {{ $leatherUnit ?? 'SQ_FT' }}</td>
                    <td style="width: 35%;"><strong>Net Cutting Wastage:</strong> ________________ %</td>
                    <td style="width: 30%;"><strong>Verified By:</strong> _________________________</td>
                </tr>
            </table>
        </div>

        @if($assignment->notes)
        <div class="notes-box">
            <div class="notes-kicker">Supervisor Cutting &amp; Pattern Notes:</div>
            <div>{{ $assignment->notes }}</div>
        </div>
        @endif

    </div>

    <!-- BOTTOM-ALIGNED FOOTER: SIGNATURES & JURISDICTION -->
    <div class="footer-bottom-wrap">
        <!-- SECTION 3: SIGNATURES -->
        <table class="signatures-table">
            <tr>
                <td class="sig-cell">
                    <div class="sig-stamp"></div>
                    <div class="sig-line">Leather Storekeeper Signature</div>
                </td>
                <td class="sig-spacer"></td>
                <td class="sig-cell">
                    <div class="sig-stamp"></div>
                    <div class="sig-line">Cutting Master / Artisan</div>
                </td>
                <td class="sig-spacer"></td>
                <td class="sig-cell">
                    <div class="sig-stamp"></div>
                    <div class="sig-line">Production Supervisor</div>
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
