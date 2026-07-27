<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLabourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $labourId = $this->route('labour') ? $this->route('labour')->id : null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:20', Rule::unique('labour', 'phone')->ignore($labourId)],
            'address' => ['nullable', 'string', 'max:500'],
            'skill_tags' => ['nullable', 'array'],
            'skill_tags.*' => ['string', 'max:50'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
