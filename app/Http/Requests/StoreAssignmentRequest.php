<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'product_color_id' => ['nullable', 'exists:product_colors,id'],
            'labour_id' => ['required', 'exists:labour,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100000'],
            'rate' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
            'delivery_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
