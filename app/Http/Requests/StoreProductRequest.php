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

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:30', 'alpha_dash', 'unique:products,code'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:40'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'materials' => ['required', 'array', 'min:1'],
            'materials.*.material_id' => ['nullable', 'exists:materials,id'],
            'materials.*.material_type' => ['required', 'string', Rule::in(['CONSUMABLE', 'HARDWARE', 'PROCESS_NOTE'])],
            'materials.*.label' => ['required', 'string', 'max:150'],
            'materials.*.quantity_min' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.quantity_max' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'materials.*.unit' => ['nullable', 'string', 'max:10'],
            'materials.*.dimension_note' => ['nullable', 'string', 'max:150'],
        ];
    }
}
