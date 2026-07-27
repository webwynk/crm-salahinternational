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

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'unique:materials,name'],
            'category' => ['required', 'string', Rule::in(['LEATHER', 'THREAD', 'GLUE', 'HARDWARE', 'LINING', 'OTHER'])],
            'base_unit' => ['required', 'string', 'max:10'],
            'reorder_level' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'initial_stock' => ['required', 'numeric', 'min:0', 'max:9999999'],
        ];
    }
}
