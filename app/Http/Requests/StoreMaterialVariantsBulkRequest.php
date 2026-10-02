<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialVariantsBulkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.name' => ['required', 'string', 'max:120'],
            'variants.*.sku' => ['nullable', 'string', 'max:50'],
            'variants.*.reorder_level' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'variants.*.initial_stock' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
        ];
    }
}
