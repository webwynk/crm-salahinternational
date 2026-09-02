<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('category') && is_string($this->category)) {
            $this->merge([
                'category' => trim(strtoupper($this->category)),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'unique:materials,name'],
            'category' => ['required', 'string', 'max:40'],
            'base_unit' => ['required', 'string', Rule::in(['pcs', 'm', 'cm', 'in', 'yard', 'feet', 'sq m', 'sq_ft', 'sq ft', 'sq_dm', 'sq_m', 'hides', 'cm2', 'g'])],
            'reorder_level' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'initial_stock' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'variants' => ['nullable', 'array'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:120'],
            'variants.*.sku' => ['nullable', 'string', 'max:50'],
            'variants.*.reorder_level' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'variants.*.initial_stock' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
        ];
    }
}
