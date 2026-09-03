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
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
        .header-top-bar {
            width: 100%;
            background: #b45309;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            text-align: center;
            line-height: 22px;
            height: 22px;
            margin: 0;
        }

        /* Page Content Wrapper with Calibrated A4 Margins */
        .page-content {
            padding: 10mm 11mm 8mm 11mm;
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
        .product-notes {
            font-size: 11px;
            color: #334155;
            line-height: 1.35;
            margin-top: 3px;
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
@php
    $pinIcon = 'data:image/png;base64,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';
    $phoneIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFF0lEQVR4nO1aTWhcVRT+zn3vzbyZ/sS01Qoq1BZBTBZCqEUQWxWpjbVY24lbN63gwrXoIs1CwZ0bhVh37jKG0kYjIih1o9AEXTQudNEiRemPJGPbmZeZ++6R82YCQ8jMvPl/k7wPHpnMO9+9737v3J9zzgAxYsSIESNGjBgxtiaoWcJMBtaDt+rzbj8EnsjCx2YDNyFYM7b9hN2MMQH8bcZ9loAXNauAy8zBQImIgwbJaAZ+oKz3MwYAFMaIJ6Hk7/xV97O0Q28TUUBcT+a1ixn5Ek+Pj3rvBJ1MwWBQBeAMLMrCnzuVfn+Piw/veKzDNLzHJfuOhw9em81/tNYGBk0AlvsMZCceddPm36sJhX2rvrh72SNq8hgmaQFFg+t5tXs0M3PDk55kCiFiUI0MiMA7c/+lGLxbMxTK3t+ABBJb4QhX2kBEocIYaSdY4PxmlvWKrV/hYqAFEJQ9uDm0womsAJsVClscClscqtsd2KXySXFLCsAMNsoOdXDaVAIQQIbBjoUUu/celu/ORXRHUGGMSra8zPIVtmED+GlbpdhSJ+T/I4ejud6oejfl6Crx/+sXczkwLWx3IKeaYkWIRmKoVZ9FtbdmMkgcuRzNWEA1Msg8VR6oRfSep7E8lKCkRXJCru/SBChPwyRtGkmVUk+viYmBiwWmYM5NgsZn87/mDb1U1Jhj5tsMaFGhPhkmIT0onJHAqlEmqR+gsIaTk1BTlbj++wyGSn76Tdfh6XwJPmjjNytTxSGQz3xz73XvsbFFaFkMp4IlIhpQYQ1l8JIYkdj+5Sxy9/7e9WVe801bwaq1OMo0KRkJjWnvrcdTn8o0GMkE60hkPEE1YyzTQRIbPx6GPfHLjQKD5txyUq3mAie5A0/D35GgM/OnU59LsjSbkVA5GiKoVkiS9Q0++DhfNGBInqAeCNbKKusoikCtEplBSxNwrpnUb67Ck56BnHnrZ4oA/UCS7LtFPj/+VeGs7AqZLEw/M0WqZeYE1GgWRYA+dh0iSYM1ohBgR80TqB0uT4KWfod9zXd/2ubQofsl+FRjR2jGE3pZfKF2yLIryML49RvJ/Y5FCwQa9nwY1SBpWk+EykOFmhLiOe1OH2qHXC3CpZOpg66N7xgYXm1RhLXvwxZfjnWg+ELoAOTtiTvOnkwd3NGiCCsef1GwCu+mjfvJdofOokfFF0KHIGeDFy5DtyICGCZhQxV9/Jmw8ETRDyJPvxfFF0IH0RERNAzCeE6Hii8KHYQMXkQ4daFw5a7GUQKWkxaUCbFFyqDDDr6TxReFDqNdEdDj4otCF9CWCD0uvih0Cb0UoR2objZeSwTm6KTHVLc72EiEtAOLGaVmkqzdgupFJ9UieBpHfYM/hpLkOCpIjsier9Enr1C96khEkBPjiQuFKysoPLOqeQrAXyLCzgTZKac/CVPqdYfVucWF40gvp1MjvuHnDehVw3gOgBOmHfEcu5xvXIaXPHD8m9xyK8ERoQ8I4v8MVPXRdXpszHlk39I/imiXX04QNPr5DlsEiABaJw+cvJhbaUUAhT5AHlIGLw8s02L+FSSH9y8aZlqsLr40uIpiKwUbKdxIO62Exgp9hDywRJHHDqEkuYD1xRe7xiX3xEZshVNdwGkWChHA+uJLycclKb6Ie290yT2xEVvhCLfv4XAnsL74YheHgue7r8vPuc0uv2WdyLHUJtZzNgVYii+VX6Z2wm6gPKAajTLFUfzRZYwYMWLEiIHBwv8thONVK1UOrAAAAABJRU5ErkJggg==';
    $userIcon = 'data:image/png;base64,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';
@endphp
<body>

    <!-- TOP BAR: FULL-BLEED FABRICATOR COPY -->
    <div class="header-top-bar">Fabricator Copy</div>

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
                        <img src="{{ $pinIcon }}" width="10" height="10" alt="Pin" style="vertical-align: -1px; margin-right: 3px;">
                        31/18 Topsia Road (South), 3rd Floor,<br>
                        <span style="padding-left: 13px;">Kolkata - 700046, West Bengal, India</span>
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
                                <span class="kicker">
                                    <img src="{{ $userIcon }}" width="10" height="10" alt="Artisan" style="vertical-align: -1px; margin-right: 2px;">
                                    Assigned Fabricator
                                </span>
                                <div class="artisan-name">{{ $labour->name }}</div>
                                <div class="artisan-info">
                                    <img src="{{ $phoneIcon }}" width="9" height="9" alt="Phone" style="vertical-align: -1px; margin-right: 2px;">
                                    {{ $labour->phone }}
                                </div>
                                <div class="artisan-info">
                                    <img src="{{ $pinIcon }}" width="9" height="9" alt="Location" style="vertical-align: -1px; margin-right: 2px;">
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
                    <div>
                        <span class="product-code-lead">{{ $product->code }}</span>
                        <span class="product-title-sep">|</span>
                        <span class="product-title-text">{{ $product->name }}</span>
                    </div>
                    <div class="product-notes">
                        <strong>Craft Notes:</strong> {{ $product->description ?? 'Follow master craftsman guidelines revision 2.' }}
                    </div>
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
