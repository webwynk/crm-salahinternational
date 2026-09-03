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
        $hasColors = filter_var($this->has_colors, FILTER_VALIDATE_BOOLEAN);
        $this->merge(['has_colors' => $hasColors]);

        if ($hasColors) {
            $this->request->remove('materials');
            if ($this->has('colors') && is_array($this->colors)) {
                $sanitizedColors = array_map(function ($color) {
                    if (is_array($color) && isset($color['materials']) && is_array($color['materials'])) {
                        $color['materials'] = array_map(function ($item) {
                            if (is_array($item)) {
                                if (empty($item['material_type'])) {
                                    $item['material_type'] = 'CONSUMABLE';
                                }
                                if (isset($item['material_id']) && $item['material_id'] === '') {
                                    $item['material_id'] = null;
                                }
                                if (isset($item['material_variant_id']) && $item['material_variant_id'] === '') {
                                    $item['material_variant_id'] = null;
                                }
                            }
                            return $item;
                        }, $color['materials']);
                    }
                    return $color;
                }, $this->colors);

                $this->merge(['colors' => $sanitizedColors]);
            }
        } else {
            $this->request->remove('colors');
            if ($this->has('materials') && is_array($this->materials)) {
                $sanitized = array_map(function ($item) {
                    if (is_array($item)) {
                        if (empty($item['material_type'])) {
                            $item['material_type'] = 'CONSUMABLE';
                        }
                        if (isset($item['material_id']) && $item['material_id'] === '') {
                            $item['material_id'] = null;
                        }
                        if (isset($item['material_variant_id']) && $item['material_variant_id'] === '') {
                            $item['material_variant_id'] = null;
                        }
                    }
                    return $item;
                }, $this->materials);

                $this->merge(['materials' => $sanitized]);
            }
        }
    }

    public function rules(): array
    {
        $hasColors = filter_var($this->has_colors, FILTER_VALIDATE_BOOLEAN);

        return [
            'code' => ['required', 'string', 'max:30', 'alpha_dash', 'unique:products,code'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:40'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string'],
            'has_colors' => ['nullable', 'boolean'],

            // Single-color BOM (required only when has_colors is false)
            'materials' => [Rule::excludeIf($hasColors), 'required', 'array', 'min:1'],
            'materials.*.material_id' => ['nullable', 'exists:materials,id'],
            'materials.*.material_variant_id' => ['nullable', 'exists:material_variants,id'],
            'materials.*.material_type' => ['nullable', 'string', Rule::in(['LEATHER', 'CONSUMABLE', 'HARDWARE', 'PROCESS_NOTE'])],
            'materials.*.label' => ['required', 'string', 'max:150'],
            'materials.*.quantity_min' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.quantity_max' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.unit' => ['nullable', 'string', 'max:10'],
            'materials.*.dimension_note' => ['nullable', 'string', 'max:150'],

            // Multi-color variations (required only when has_colors is true)
            'colors' => [Rule::excludeIf(!$hasColors), 'required', 'array', 'min:1'],
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
