<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Work Order {{ $assignment->assignment_no }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2430; font-size: 12px; margin: 0; padding: 20px; }
        .header { border-bottom: 2px solid #3b63f5; padding-bottom: 12px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #141f57; margin: 0; }
        .subtitle { font-size: 11px; color: #6b7280; margin-top: 4px; }
        .meta-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .meta-table td { padding: 6px; vertical-align: top; }
        .label { font-weight: bold; color: #4b5563; font-size: 11px; }
        .value { color: #1f2430; font-size: 12px; }
        .section-header { font-size: 14px; font-weight: bold; color: #141f57; border-bottom: 1px solid #e4e6eb; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table th { background: #f8f9fb; border: 1px solid #d1d5db; padding: 8px; font-size: 11px; text-align: left; color: #374151; }
        .data-table td { border: 1px solid #e4e6eb; padding: 8px; font-size: 11px; }
        .notes-box { background: #f8f9fb; border: 1px border #d1d5db; padding: 10px; border-radius: 4px; font-size: 11px; }
        .signatures { margin-top: 40px; width: 100%; }
        .signature-line { border-top: 1px solid #9aa0ac; width: 80%; margin-top: 40px; text-align: center; font-size: 10px; color: #6b7280; padding-top: 4px; }
    </style>
</head>
<body>

    <div class="header">
        <h1 class="title">WORK ORDER / PRODUCTION JOB CARD</h1>
        <div class="subtitle">Leather Goods Manufacturing CRM &bull; Order #{{ $assignment->assignment_no }}</div>
    </div>

    <table class="meta-table">
        <tr>
            <td width="50%">
                <div class="label">ASSIGNMENT DETAILS</div>
                <div class="value"><strong>Work Order No:</strong> {{ $assignment->assignment_no }}</div>
                <div class="value"><strong>Assigned Date:</strong> {{ $assignment->assigned_at ? $assignment->assigned_at->format('d M Y, h:i A') : now()->format('d M Y') }}</div>
                <div class="value"><strong>Assigned By:</strong> {{ $assignment->assigner?->name ?? 'Admin' }}</div>
                <div class="value"><strong>Status:</strong> {{ $assignment->status }}</div>
            </td>
            <td width="50%">
                <div class="label">ASSIGNED ARTISAN / LABOUR</div>
                <div class="value"><strong>Worker Name:</strong> {{ $labour->name }}</div>
                <div class="value"><strong>Phone:</strong> {{ $labour->phone }}</div>
                <div class="value"><strong>Address:</strong> {{ $labour->address ?? 'N/A' }}</div>
            </td>
        </tr>
    </table>

    <div class="section-header">PRODUCT SPECIFICATION</div>
    <table class="meta-table">
        <tr>
            <td width="70%">
                <div class="value"><strong>Product Code:</strong> {{ $product->code }}</div>
                <div class="value"><strong>Product Name:</strong> {{ $product->name }}</div>
                <div class="value"><strong>Category:</strong> {{ $product->category ?? 'General Leather Goods' }}</div>
                <div class="value"><strong>Description:</strong> {{ $product->description ?? 'Standard production specifications' }}</div>
            </td>
            <td width="30%" style="text-align: right; background: #ecfdf3; padding: 12px; border: 1px solid #12b76a;">
                <div class="label" style="color: #027a48;">TARGET QUANTITY</div>
                <div style="font-size: 24px; font-weight: bold; color: #027a48;">{{ $assignment->quantity }} Pcs</div>
            </td>
        </tr>
    </table>

    <div class="section-header">ALLOCATED RAW MATERIALS & BOM DEDUCTION</div>
    <table class="data-table">
        <thead>
            <tr>
                <th width="8%">#</th>
                <th width="45%">Material Description</th>
                <th width="22%">Allocated Qty (Total)</th>
                <th width="25%">Unit of Measure</th>
            </tr>
        </thead>
        <tbody>
            @foreach($materials as $idx => $mat)
            <tr>
                <td>{{ $idx + 1 }}</td>
                <td><strong>{{ $mat->label }}</strong></td>
                <td><strong>{{ number_format($mat->quantity_used, 2) }}</strong></td>
                <td>{{ $mat->unit }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($bomNotes->count() > 0)
    <div class="section-header">PROCESS & CRAFTING NOTES</div>
    <div class="notes-box">
        <ul style="margin: 0; padding-left: 20px;">
            @foreach($bomNotes as $note)
            <li style="margin-bottom: 4px;">
                <strong>{{ $note->label }}:</strong> {{ $note->dimension_note ?? 'Follow master craftsman guidelines' }}
            </li>
            @endforeach
        </ul>
    </div>
    @endif

    @if($assignment->notes)
    <div class="section-header">SPECIAL INSTRUCTIONS</div>
    <div class="notes-box">
        {{ $assignment->notes }}
    </div>
    @endif

    <table class="signatures">
        <tr>
            <td width="50%" text-align="center">
                <div class="signature-line">Supervisor / Admin Signature</div>
            </td>
            <td width="50%" text-align="center">
                <div class="signature-line">Artisan / Labour Signature</div>
            </td>
        </tr>
    </table>

</body>
</html>
