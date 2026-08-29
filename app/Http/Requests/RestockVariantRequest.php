<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RestockVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'add_quantity' => ['required', 'numeric', 'min:0.001', 'max:9999999'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
