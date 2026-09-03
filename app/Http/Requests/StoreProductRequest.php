<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('colors') && is_array($this->colors)) {
            $sanitizedColors = array_map(function ($color) {
                if (is_array($color) && isset($color['materials']) && is_array($color['materials'])) {
                    $color['materials'] = array_map(function ($item) {
                        if (is_array($item) && empty($item['material_type'])) {
                            $item['material_type'] = 'CONSUMABLE';
                        }
                        return $item;
                    }, $color['materials']);
                }
                return $color;
            }, $this->colors);

            $this->merge(['colors' => $sanitizedColors]);
        }

        if ($this->has('materials') && is_array($this->materials)) {
            $sanitized = array_map(function ($item) {
                if (is_array($item) && empty($item['material_type'])) {
                    $item['material_type'] = 'CONSUMABLE';
                }
                return $item;
            }, $this->materials);

            $this->merge(['materials' => $sanitized]);
        }
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:30', 'alpha_dash', 'unique:products,code'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:40'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string'],
            'has_colors' => ['nullable', 'boolean'],

            // Single-color BOM (required unless has_colors is true)
            'materials' => ['required_unless:has_colors,true', 'nullable', 'array', 'min:1'],
            'materials.*.material_id' => ['nullable', 'exists:materials,id'],
            'materials.*.material_variant_id' => ['nullable', 'exists:material_variants,id'],
            'materials.*.material_type' => ['nullable', 'string', Rule::in(['LEATHER', 'CONSUMABLE', 'HARDWARE', 'PROCESS_NOTE'])],
            'materials.*.label' => ['required', 'string', 'max:150'],
            'materials.*.quantity_min' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.quantity_max' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.unit' => ['nullable', 'string', 'max:10'],
            'materials.*.dimension_note' => ['nullable', 'string', 'max:150'],

            // Multi-color variations (required if has_colors is true)
            'colors' => ['required_if:has_colors,true', 'nullable', 'array', 'min:1'],
            'colors.*.color_name' => ['required_with:colors', 'string', 'max:60'],
            'colors.*.image_url' => ['nullable', 'string'],
            'colors.*.materials' => ['required_with:colors', 'array', 'min:1'],
            'colors.*.materials.*.material_id' => ['nullable', 'exists:materials,id'],
            'colors.*.materials.*.material_variant_id' => ['nullable', 'exists:material_variants,id'],
            'colors.*.materials.*.material_type' => ['nullable', 'string', Rule::in(['LEATHER', 'CONSUMABLE', 'HARDWARE', 'PROCESS_NOTE'])],
            'colors.*.materials.*.label' => ['required', 'string', 'max:150'],
            'colors.*.materials.*.quantity_min' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'colors.*.materials.*.quantity_max' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'colors.*.materials.*.unit' => ['nullable', 'string', 'max:10'],
            'colors.*.materials.*.dimension_note' => ['nullable', 'string', 'max:150'],
        ];
    }
}
