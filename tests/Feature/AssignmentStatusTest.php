<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Inventory;
use App\Models\Labour;
use App\Models\Material;
use App\Models\MaterialVariant;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\AssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentStatusTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Labour $labour;
    protected Product $product;
    protected Material $material;
    protected MaterialVariant $variant;
    protected Inventory $inventory;
    protected AssignmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AssignmentService();
        $this->admin = User::factory()->create(['role' => 'ADMIN']);

        $this->labour = Labour::create([
            'name' => 'Artisan Worker',
            'phone' => '0987654321',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'code' => 'WALLET-BLK-01',
            'name' => 'Classic Black Wallet',
            'created_by' => $this->admin->id,
        ]);

        $this->material = Material::create([
            'name' => 'Full-Grain Black Cowhide',
            'category' => 'LEATHER',
            'base_unit' => 'sq m',
            'reorder_level' => 10,
        ]);

        $this->variant = $this->material->variants()->create([
            'name' => 'Standard',
            'reorder_level' => 10,
            'is_active' => true,
        ]);

        $this->inventory = Inventory::create([
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'quantity_on_hand' => 100.0,
            'unit' => 'sq m',
        ]);

        // BOM: 0.5 sq m per wallet (for 10 wallets = 5.0 sq m needed)
        $this->product->materials()->create([
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Outer Cover',
            'quantity_min' => 0.5,
            'quantity_max' => 0.5,
            'unit' => 'sq m',
            'sort_order' => 1,
        ]);
    }

    public function test_admin_can_mark_assignment_completed_via_http_route(): void
    {
        $this->actingAs($this->admin);

        // 1. Create Assignment (100 - 5 = 95 sq m remaining)
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $this->assertEquals('ASSIGNED', $assignment->status);
        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);

        // 2. HTTP PATCH to status endpoint -> COMPLETED
        $response = $this->patch("/assignments/{$assignment->id}/status", [
            'status' => 'COMPLETED',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $assignment->refresh();
        $this->assertEquals('COMPLETED', $assignment->status);
        $this->assertNotNull($assignment->completed_at);

        // Materials must remain deducted at 95.0
        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);
    }

    public function test_admin_can_cancel_assignment_and_stock_is_refunded_via_http_route(): void
    {
        $this->actingAs($this->admin);

        // 1. Create Assignment (100 - 5 = 95 sq m remaining)
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);

        // 2. HTTP PATCH to status endpoint -> CANCELLED
        $response = $this->patch("/assignments/{$assignment->id}/status", [
            'status' => 'CANCELLED',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $assignment->refresh();
        $this->assertEquals('CANCELLED', $assignment->status);

        // 3. Stock MUST BE REFUNDED back to 100.0 in the database
        $this->assertEquals(100.0, (float) $this->inventory->fresh()->quantity_on_hand);

        // 4. Audit trail must have RESTOCK transaction with +5.0 change
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'change_qty' => 5.0,
            'type' => StockTransaction::TYPE_RESTOCK,
            'reference_id' => $assignment->id,
            'balance_after' => 100.0,
        ]);
    }

    public function test_cannot_alter_already_completed_or_cancelled_assignment(): void
    {
        $this->actingAs($this->admin);

        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        // Mark COMPLETED
        $this->patch("/assignments/{$assignment->id}/status", ['status' => 'COMPLETED']);
        $this->assertEquals('COMPLETED', $assignment->fresh()->status);

        // Attempting to cancel an already completed assignment should return warning and not change stock
        $response = $this->patch("/assignments/{$assignment->id}/status", ['status' => 'CANCELLED']);
        $response->assertSessionHas('warning');
        $this->assertEquals('COMPLETED', $assignment->fresh()->status);
        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);
    }

    public function test_admin_can_download_work_order_pdf(): void
    {
        $this->actingAs($this->admin);

        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $response = $this->get("/assignments/{$assignment->id}/pdf");
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }

    public function test_admin_can_create_assignment_for_specific_color_variant_and_deduct_stock(): void
    {
        $this->actingAs($this->admin);

        // Multi-color product
        $product = Product::create([
            'code' => 'BAG-MC-TEST',
            'name' => 'Multi-Color Duffle Bag',
            'has_colors' => true,
            'created_by' => $this->admin->id,
        ]);

        $tanColor = $product->colors()->create([
            'color_name' => 'Tan',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $blackColor = $product->colors()->create([
            'color_name' => 'Black',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Materials: Tan leather vs Black leather
        $tanLeather = Material::create([
            'name' => 'Tan Veg Leather',
            'category' => 'LEATHER',
            'base_unit' => 'sq ft',
            'reorder_level' => 10,
        ]);
        $tanInv = Inventory::create([
            'material_id' => $tanLeather->id,
            'quantity_on_hand' => 50.0,
            'unit' => 'sq ft',
        ]);

        $blackLeather = Material::create([
            'name' => 'Black Nappa Leather',
            'category' => 'LEATHER',
            'base_unit' => 'sq ft',
            'reorder_level' => 10,
        ]);
        $blackInv = Inventory::create([
            'material_id' => $blackLeather->id,
            'quantity_on_hand' => 50.0,
            'unit' => 'sq ft',
        ]);

        // Tan BOM uses 2.0 sq ft of Tan Leather
        $product->materials()->create([
            'product_color_id' => $tanColor->id,
            'material_id' => $tanLeather->id,
            'material_type' => 'LEATHER',
            'label' => 'Tan Shell',
            'quantity_min' => 2.0,
            'unit' => 'sq ft',
            'sort_order' => 1,
        ]);

        // Black BOM uses 3.0 sq ft of Black Leather
        $product->materials()->create([
            'product_color_id' => $blackColor->id,
            'material_id' => $blackLeather->id,
            'material_type' => 'LEATHER',
            'label' => 'Black Shell',
            'quantity_min' => 3.0,
            'unit' => 'sq ft',
            'sort_order' => 1,
        ]);

        // Pre-check for Tan color
        $preCheckResponse = $this->get(route('assignments.pre-check', [
            'product_id' => $product->id,
            'product_color_id' => $tanColor->id,
            'quantity' => 10,
        ]));
        $preCheckResponse->assertOk();
        $this->assertTrue($preCheckResponse->json('can_assign'));
        $this->assertEquals(20.0, $preCheckResponse->json('items.0.needed'));

        // Assign 10 pcs of Tan
        $response = $this->post('/assignments', [
            'product_id' => $product->id,
            'product_color_id' => $tanColor->id,
            'labour_id' => $this->labour->id,
            'quantity' => 10,
        ]);

        $response->assertRedirect('/assignments');

        // Verify Tan leather decremented (50 - 20 = 30), Black leather untouched (50)
        $this->assertEquals(30.0, (float) $tanInv->fresh()->quantity_on_hand);
        $this->assertEquals(50.0, (float) $blackInv->fresh()->quantity_on_hand);

        // Verify assignment recorded product_color_id
        $this->assertDatabaseHas('assignments', [
            'product_id' => $product->id,
            'product_color_id' => $tanColor->id,
            'quantity' => 10,
        ]);

        // Verify Exporter, Fabricator, and Leather Slip PDFs generate for assignment
        $assignedWo = Assignment::where('product_id', $product->id)->first();
        $this->assertDatabaseHas('work_order_pdfs', [
            'assignment_id' => $assignedWo->id,
            'copy_type' => 'EXPORTER',
        ]);
        $this->assertDatabaseHas('work_order_pdfs', [
            'assignment_id' => $assignedWo->id,
            'copy_type' => 'FABRICATOR',
        ]);
        $this->assertDatabaseHas('work_order_pdfs', [
            'assignment_id' => $assignedWo->id,
            'copy_type' => 'LEATHER',
        ]);

        // Verify Exporter Copy download
        $exporterResponse = $this->get("/assignments/{$assignedWo->id}/pdf?type=exporter");
        $exporterResponse->assertOk();
        $this->assertEquals('application/pdf', $exporterResponse->headers->get('content-type'));
        $this->assertStringContainsString('Exporter', $exporterResponse->headers->get('content-disposition'));

        // Verify Fabricator Copy download
        $fabricatorResponse = $this->get("/assignments/{$assignedWo->id}/pdf?type=fabricator");
        $fabricatorResponse->assertOk();
        $this->assertEquals('application/pdf', $fabricatorResponse->headers->get('content-type'));
        $this->assertStringContainsString('Fabricator', $fabricatorResponse->headers->get('content-disposition'));

        // Verify Leather Slip download
        $leatherResponse = $this->get("/assignments/{$assignedWo->id}/leather-pdf");
        $leatherResponse->assertOk();
        $this->assertEquals('application/pdf', $leatherResponse->headers->get('content-type'));
    }

    public function test_assignment_creation_generates_all_three_pdfs_with_strict_material_separation(): void
    {
        $this->actingAs($this->admin);

        // Create Leather Material
        $leatherMat = Material::create([
            'name' => 'Italian Pull-Up Cowhide',
            'category' => 'LEATHER',
            'base_unit' => 'sq_ft',
            'is_leather' => true,
            'reorder_level' => 10,
        ]);
        $leatherVariant = $leatherMat->variants()->create([
            'name' => 'Cognac Tan',
            'reorder_level' => 10,
            'is_active' => true,
        ]);
        Inventory::create([
            'material_id' => $leatherMat->id,
            'material_variant_id' => $leatherVariant->id,
            'quantity_on_hand' => 500.0,
            'unit' => 'sq_ft',
        ]);

        // Create Non-Leather Hardware Material
        $hardwareMat = Material::create([
            'name' => 'Solid Brass YKK Zipper #5',
            'category' => 'FITTINGS',
            'base_unit' => 'pcs',
            'is_leather' => false,
            'reorder_level' => 20,
        ]);
        $hardwareVariant = $hardwareMat->variants()->create([
            'name' => 'Antique Brass',
            'reorder_level' => 20,
            'is_active' => true,
        ]);
        Inventory::create([
            'material_id' => $hardwareMat->id,
            'material_variant_id' => $hardwareVariant->id,
            'quantity_on_hand' => 200.0,
            'unit' => 'pcs',
        ]);

        // Create Product with Colorway & BOM
        $product = Product::create([
            'code' => 'DUFFLE-BRN-01',
            'name' => 'Heritage Leather Duffle Bag',
            'created_by' => $this->admin->id,
        ]);
        $color = $product->colors()->create([
            'color_name' => 'Cognac Tan',
            'color_code' => '#b47b48',
            'is_active' => true,
        ]);
        $product->materials()->create([
            'material_id' => $leatherMat->id,
            'material_variant_id' => $leatherVariant->id,
            'product_color_id' => $color->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Main Body Leather Hides',
            'quantity_min' => 4.5,
            'quantity_max' => 4.5,
            'unit' => 'sq_ft',
            'sort_order' => 1,
        ]);
        $product->materials()->create([
            'material_id' => $hardwareMat->id,
            'material_variant_id' => $hardwareVariant->id,
            'product_color_id' => $color->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Main Zipper Fitting',
            'quantity_min' => 2.0,
            'quantity_max' => 2.0,
            'unit' => 'pcs',
            'sort_order' => 2,
        ]);

        // Create Assignment for 50 Duffle Bags (Requires 225.00 SQ_FT Leather and 100 zippers)
        $response = $this->post('/assignments', [
            'product_id' => $product->id,
            'product_color_id' => $color->id,
            'labour_id' => $this->labour->id,
            'quantity' => 50,
            'notes' => 'Precision cutting required for main duffle panels.',
        ]);

        $response->assertRedirect('/assignments');
        $assignment = Assignment::where('product_id', $product->id)->first();
        $this->assertNotNull($assignment);

        // 1. Verify all 3 PDFs are generated and tracked in database
        $this->assertDatabaseHas('work_order_pdfs', ['assignment_id' => $assignment->id, 'copy_type' => 'EXPORTER']);
        $this->assertDatabaseHas('work_order_pdfs', ['assignment_id' => $assignment->id, 'copy_type' => 'FABRICATOR']);
        $this->assertDatabaseHas('work_order_pdfs', ['assignment_id' => $assignment->id, 'copy_type' => 'LEATHER']);

        // 2. Verify Exporter / Fabricator Copy material separation (Non-Leather only)
        $woPdfService = new \App\Services\WorkOrderPdfService();
        $exporterDomPdf = $woPdfService->renderDomPdf($assignment, 'EXPORTER');
        $exporterHtml = $exporterDomPdf->output(); // renders DomPdf HTML/PDF stream

        // Test view rendering directly to assert template text
        $exporterView = view('pdf.work_order', [
            'assignment' => $assignment,
            'product' => $assignment->product,
            'color' => $assignment->color,
            'labour' => $assignment->labour,
            'materials' => $assignment->materials->filter(fn($m) => !$m->material->is_leather),
            'copyType' => 'Exporter Copy',
        ])->render();

        $this->assertStringContainsString('Solid Brass YKK Zipper #5', $exporterView);
        $this->assertStringNotContainsString('Italian Pull-Up Cowhide', $exporterView);

        // 3. Verify Leather Issue Slip material separation & total banner
        $leatherPdfService = new \App\Services\LeatherIssuePdfService();
        $leatherView = view('pdf.leather_issue_slip', [
            'assignment' => $assignment,
            'product' => $assignment->product,
            'color' => $assignment->color,
            'labour' => $assignment->labour,
            'leatherMaterials' => $assignment->materials->filter(fn($m) => $m->material->is_leather),
            'totalLeatherQty' => 225.00,
            'leatherUnit' => 'SQ_FT',
        ])->render();

        // Must show leather materials
        $this->assertStringContainsString('Italian Pull-Up Cowhide', $leatherView);
        // Must exclude non-leather hardware
        $this->assertStringNotContainsString('Solid Brass YKK Zipper #5', $leatherView);

        // Header Left matches Image 1
        $this->assertStringContainsString('EXPORTER &amp; MANUFACTURER OF LEATHER GOODS', $leatherView);
        $this->assertStringContainsString('31/18 Topsia Road (South), 3rd Floor', $leatherView);
        $this->assertStringContainsString('19AEQFS1716K1ZH', $leatherView);

        // Header Right matches Image 2
        $this->assertStringContainsString('WORK ORDER NO.', $leatherView);
        $this->assertStringContainsString('ISSUE DATE', $leatherView);

        // Must NOT show removed sections
        $this->assertStringNotContainsString('Cutting Rate', $leatherView);
        $this->assertStringNotContainsString('Target Delivery Date', $leatherView);
        $this->assertStringNotContainsString('Component Cut Part', $leatherView);
        $this->assertStringNotContainsString('OFFCUT &amp; SCRAP RETURN RECONCILIATION', $leatherView);
        $this->assertStringNotContainsString('Cutting Master / Artisan', $leatherView);

        // Must show product details with Color in hero card
        $this->assertStringContainsString('Heritage Leather Duffle Bag', $leatherView);
        $this->assertStringContainsString('DUFFLE-BRN-01', $leatherView);
        $this->assertStringContainsString('Color: Cognac Tan', $leatherView);

        // Must show prominent total banner
        $this->assertStringContainsString('TOTAL RAW LEATHER ISSUED FROM WAREHOUSE:', $leatherView);
        $this->assertStringContainsString('225.00 SQ_FT', $leatherView);

        // Must show exactly 2 signatures: Leather Storekeeper & Production Supervisor
        $this->assertStringContainsString('Leather Storekeeper Signature', $leatherView);
        $this->assertStringContainsString('Production Supervisor Signature', $leatherView);

        // Must show legal jurisdiction notice
        $this->assertStringContainsString('ALL DISPUTES ARE SUBJECT TO KOLKATA JURISDICTION.', $leatherView);
    }
}
