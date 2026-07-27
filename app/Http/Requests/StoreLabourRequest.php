<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLabourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:20', 'unique:labour,phone'],
            'address' => ['nullable', 'string', 'max:500'],
            'skill_tags' => ['nullable', 'array'],
            'skill_tags.*' => ['string', 'max:50'],
        ];
    }
}
