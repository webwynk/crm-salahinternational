<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeatherChallanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cutter_id'            => ['required', 'exists:cutters,id'],
            'material_id'          => ['required', 'exists:materials,id'],
            'material_variant_id'  => ['nullable', 'exists:material_variants,id'],
            'notes'                => ['nullable', 'string'],
            'items'                => ['required', 'array', 'min:1'],
            'items.*.product_id'   => ['required', 'exists:products,id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'items.*.leather_sqft_per_pc' => ['required', 'numeric', 'min:0.01'],
        ];
    }

    public function messages(): array
    {
        return [
            'cutter_id.required'           => 'Please select a cutter.',
            'cutter_id.exists'             => 'The selected cutter is invalid.',
            'material_id.required'         => 'Please select a leather hide.',
            'material_id.exists'           => 'The selected leather hide is invalid.',
            'items.required'               => 'At least one product must be added to the challan.',
            'items.min'                    => 'At least one product must be added to the challan.',
            'items.*.product_id.required'  => 'Please select a valid product for every row.',
            'items.*.quantity.required'    => 'Quantity is required for each product.',
            'items.*.quantity.min'         => 'Quantity must be at least 1.',
        ];
    }
}
