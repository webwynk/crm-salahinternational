<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'sku' => ['nullable', 'string', 'max:50'],
            'reorder_level' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'initial_stock' => ['required', 'numeric', 'min:0', 'max:9999999'],
        ];
    }
}
