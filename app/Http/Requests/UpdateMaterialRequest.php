<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMaterialRequest extends FormRequest
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
        $materialId = $this->route('material') ? $this->route('material')->id : null;

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('materials', 'name')->ignore($materialId)],
            'category' => ['required', 'string', 'max:40'],
            'base_unit' => ['required', 'string', Rule::in(['pcs', 'm', 'cm', 'in', 'yard', 'feet', 'sq m', 'sq_ft', 'sq ft', 'sq_dm', 'sq_m', 'hides', 'cm2', 'g'])],
            'reorder_level' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
