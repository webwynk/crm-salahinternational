<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('materials') && is_array($this->materials)) {
            $sanitized = array_map(function ($item) {
                if (is_array($item)) {
                    if (empty($item['material_type'])) {
                        $item['material_type'] = 'CONSUMABLE';
                    }
                }
                return $item;
            }, $this->materials);

            $this->merge(['materials' => $sanitized]);
        }
    }

    public function rules(): array
    {
        $productId = $this->route('product') ? $this->route('product')->id : null;

        return [
            'code' => ['required', 'string', 'max:30', 'alpha_dash', Rule::unique('products', 'code')->ignore($productId)],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:40'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string'],
            'materials' => ['required', 'array', 'min:1'],
            'materials.*.material_id' => ['nullable', 'exists:materials,id'],
            'materials.*.material_variant_id' => ['nullable', 'exists:material_variants,id'],
            'materials.*.material_type' => ['nullable', 'string', Rule::in(['LEATHER', 'CONSUMABLE', 'HARDWARE', 'PROCESS_NOTE'])],
            'materials.*.label' => ['required', 'string', 'max:150'],
            'materials.*.quantity_min' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.quantity_max' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.unit' => ['nullable', 'string', 'max:10'],
            'materials.*.dimension_note' => ['nullable', 'string', 'max:150'],
        ];
    }
}
