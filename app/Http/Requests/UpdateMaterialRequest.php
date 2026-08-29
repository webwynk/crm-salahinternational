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

    public function rules(): array
    {
        $materialId = $this->route('material') ? $this->route('material')->id : null;

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('materials', 'name')->ignore($materialId)],
            'category' => ['required', 'string', Rule::in(['LEATHER', 'THREAD', 'GLUE', 'HARDWARE', 'LINING', 'OTHER'])],
            'base_unit' => ['required', 'string', Rule::in(['pcs', 'm', 'cm', 'in', 'yard', 'feet', 'sq m', 'cm2', 'g'])],
            'reorder_level' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
