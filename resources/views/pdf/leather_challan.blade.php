<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Leather Cutting Challan {{ $challan->challan_no }}</title>
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
            height: 24px;
            vertical-align: middle;
            text-align: center;
            color: #ffffff;
            font-size: 10.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            line-height: 1;
            padding: 0;
        }

        /* Page Content Wrapper with Calibrated A4 Margins */
        .page-content {
            padding: 9mm 11mm 27mm 11mm;
        }

        /* Bottom-Aligned Footer: Signatures & Jurisdiction */
        .footer-bottom-wrap {
            position: fixed;
            bottom: 6mm;
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

        /* Brand Left */
        .brand-logo-img {
            height: 50px;
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
            font-size: 11px;
            font-weight: bold;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
            line-height: 1.15;
        }
        .brand-address {
            font-size: 11px;
            color: #374151;
            line-height: 1.25;
            margin-bottom: 3px;
        }
        .brand-gstin-pill {
            display: inline-block;
            font-size: 11px;
            margin-top: 2px;
            line-height: 1.15;
        }
        .gstin-label {
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            margin-right: 4px;
        }
        .gstin-code {
            font-weight: bold;
            color: #0f172a;
            font-size: 11.5px;
            letter-spacing: 0.4px;
        }

        /* Header Right Passport Card */
        .passport-card {
            width: 100%;
            background: #fafaf9;
            border: 1px solid #e2e8f0;
            border-collapse: collapse;
        }
        .passport-card td {
            padding: 6px 10px;
            vertical-align: top;
            border-bottom: 1px solid #e2e8f0;
        }
        .passport-card tr:last-child td {
            border-bottom: none;
        }
        .passport-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .passport-meta-table td {
            padding: 0;
            border: none;
        }
        .meta-label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            color: #b45309;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .meta-val-bold {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
        }
        .meta-val-date {
            font-size: 12px;
            font-weight: bold;
            color: #1e293b;
        }
        .cutter-name {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 1px;
            text-transform: uppercase;
        }
        .cutter-phone {
            font-size: 11px;
            font-weight: bold;
            color: #334155;
            letter-spacing: 0.3px;
            margin-bottom: 1px;
        }
        .cutter-address {
            font-size: 10.5px;
            color: #64748b;
            text-transform: uppercase;
        }

        /* Section Title Bar */
        .section-bar {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #b45309;
            padding: 5px 10px;
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
        }

        /* Leather Hide Specs Minimal Strip (No Background Color) */
        .specs-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border: 1px solid #e2e8f0;
            background: transparent;
        }
        .specs-table td {
            padding: 7px 12px;
            vertical-align: middle;
        }
        .spec-label {
            font-size: 9.5px;
            font-weight: bold;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .spec-val {
            font-size: 13.5px;
            font-weight: bold;
            color: #0f172a;
        }

        /* Products Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .items-table th {
            background: #1e293b;
            color: #ffffff;
            font-size: 10.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 7px 8px;
            text-align: left;
            border: 1px solid #1e293b;
        }
        .items-table td {
            padding: 7px 8px;
            font-size: 11.5px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .items-table tr:nth-child(even) td {
            background: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }

        /* Grand Total Banner (Clean Executive Voucher Layout) */
        .total-banner {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            background: #ffffff;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
        }
        .total-banner td {
            padding: 9px 10px;
            vertical-align: middle;
        }
        .total-banner-left {
            width: 55%;
        }
        .total-banner-label {
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 3px;
        }
        .total-banner-meta {
            font-size: 10px;
            color: #475569;
            font-weight: normal;
        }
        .total-banner-meta strong {
            font-weight: bold;
            color: #1e293b;
        }
        .total-banner-right {
            width: 45%;
            text-align: right;
        }
        .total-banner-val-badge {
            display: inline-block;
            font-size: 21px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
        }
        .total-unit-sub {
            font-size: 11.5px;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
            margin-left: 4px;
        }

        /* Notes Box */
        .notes-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 10px;
            margin-bottom: 12px;
            font-size: 10px;
            color: #475569;
        }

        /* Signatures */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .signatures-table td {
            width: 33.33%;
            vertical-align: bottom;
            text-align: center;
            padding: 0 10px;
        }
        .sig-line {
            border-top: 1px dashed #64748b;
            padding-top: 5px;
            font-size: 10px;
            font-weight: bold;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .sig-sub {
            font-size: 8.5px;
            color: #94a3b8;
            margin-top: 1px;
        }

        /* Legal Jurisdiction Notice */
        .footer-legal {
            border-top: 1px solid #e2e8f0;
            margin-top: 6px;
            padding-top: 3px;
            text-align: center;
            page-break-inside: avoid;
        }
        .legal-notice {
            font-size: 11px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }
    </style>
</head>
<body>

    <!-- Full-Bleed Top Bar -->
    <table class="header-top-bar">
        <tr>
            <td>LEATHER CUTTING CHALLAN &bull; ISSUE VOUCHER &bull; PRODUCTION WORK ORDER</td>
        </tr>
    </table>

    <div class="page-content">

        <!-- Header: Brand Left & Cutter Passport Card Right -->
        <table class="header-table">
            <tr>
                <td class="header-left">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" alt="Salah International" class="brand-logo-img" />
                    @else
                        <div class="brand-logo-fallback">SALAH INTERNATIONAL</div>
                    @endif
                    <div class="brand-tagline">EXPORTER &amp; MANUFACTURER OF LEATHER GOODS</div>
                    <div class="brand-address">
                        31/18 Topsia Road (South), 3rd Floor,<br>
                        Kolkata &ndash; 700046, West Bengal, India
                    </div>
                    <div class="brand-gstin-pill">
                        <span class="gstin-label">GST NO.</span>
                        <span class="gstin-code">19AEQFS1716K1ZH</span>
                    </div>
                </td>

                <td class="header-right">
                    <table class="passport-card">
                        <tr>
                            <td>
                                <table class="passport-meta-table">
                                    <tr>
                                        <td style="width: 55%;">
                                             <div class="meta-label">CHALLAN NO.</div>
                                             <div class="meta-val-bold">#{{ $challan->challan_no }}</div>
                                        </td>
                                        <td style="width: 45%;">
                                             <div class="meta-label">ISSUE DATE</div>
                                             <div class="meta-val-date">{{ $challan->created_at ? $challan->created_at->format('d M Y') : date('d M Y') }}</div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="meta-label">ASSIGNED CUTTER / WORKSHOP</div>
                                <div class="cutter-name">{{ $challan->cutter->name ?? 'N/A' }}</div>
                                <div class="cutter-phone">{{ $challan->cutter->phone ?? '-' }}</div>
                                <div class="cutter-address">{{ $challan->cutter->address ?? 'KOLKATA' }}</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Leather Specifications Minimal Strip (No Background Color) -->
        <table class="specs-table">
            <tr>
                <td style="width: 100%;">
                    <div class="spec-label">LEATHER HIDE &amp; VARIATION</div>
                    <div class="spec-val">
                        {{ $challan->material->name ?? 'N/A' }}
                        <span style="color: #94a3b8; font-weight: normal; margin: 0 6px;">|</span>
                        {{ $challan->variant ? $challan->variant->name : 'Standard' }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Products to Cut Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 4%;" class="text-center">#</th>
                    <th style="width: 8%;" class="text-center">Part No.</th>
                    <th style="width: 14%;">Code / SKU</th>
                    <th style="width: 38%;">Product Description</th>
                    <th style="width: 11%;" class="text-right">Sq.Ft / Pc</th>
                    <th style="width: 11%;" class="text-right">Qty (Pcs)</th>
                    <th style="width: 14%;" class="text-right">Total Sq.Ft</th>
                </tr>
            </thead>
            <tbody>
                @foreach($challan->items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center font-bold">{{ $item->product->part_no ?? '-' }}</td>
                    <td class="font-bold">{{ $item->product->code ?? '-' }}</td>
                    <td class="font-bold">{{ $item->product->name ?? 'N/A' }}</td>
                    <td class="text-right">{{ number_format($item->leather_sqft_per_pc, 2) }}</td>
                    <td class="text-right font-bold">{{ number_format($item->quantity) }}</td>
                    <td class="text-right font-bold" style="color: #b45309;">{{ number_format($item->total_sqft, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Grand Total Banner (Executive Voucher Layout) -->
        <table class="total-banner">
            <tr>
                <td class="total-banner-left">
                    <div class="total-banner-label">GRAND TOTAL LEATHER TO DEDUCT &amp; ISSUE</div>
                    <div class="total-banner-meta">
                        Total Products: <strong>{{ $challan->items->count() }}</strong> &bull; Total Quantity: <strong>{{ number_format($challan->items->sum('quantity')) }} Pcs</strong>
                    </div>
                </td>
                <td class="total-banner-right">
                    <div class="total-banner-val-badge">{{ number_format($challan->total_sqft, 2) }} <span class="total-unit-sub">SQ. FT</span></div>
                </td>
            </tr>
        </table>

        @if(!empty($challan->notes))
        <div class="notes-box">
            <strong>Notes / Instructions:</strong> {{ $challan->notes }}
        </div>
        @endif

        <!-- Bottom Signatures -->
        <div class="footer-bottom-wrap">
            <table class="signatures-table">
                <tr>
                    <td>
                        <div class="sig-line">Prepared By</div>
                        <div class="sig-sub">Store / Inventory Manager</div>
                    </td>
                    <td>
                        <div class="sig-line">Received By (Cutter)</div>
                        <div class="sig-sub">{{ $challan->cutter->name ?? 'Artisan' }}</div>
                    </td>
                    <td>
                        <div class="sig-line">Authorized Signatory</div>
                        <div class="sig-sub">Salah International</div>
                    </td>
                </tr>
            </table>

            <!-- Jurisdiction Legal Notice -->
            <div class="footer-legal">
                <div class="legal-notice">ALL DISPUTES ARE SUBJECT TO KOLKATA JURISDICTION.</div>
            </div>
        </div>

    </div>

</body>
</html>
