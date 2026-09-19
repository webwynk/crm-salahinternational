<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCutterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:100'],
            'phone'    => ['required', 'string', 'max:20'],
            'address'  => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'notes'    => ['nullable', 'string'],
        ];
    }
}
