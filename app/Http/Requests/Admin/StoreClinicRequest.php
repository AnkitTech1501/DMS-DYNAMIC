<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'logo' => ['required', 'image', 'max:2048'],
            'address' => ['required', 'string', 'max:500'],
            'contact_number' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', 'unique:clinics,email'],
            'status' => ['nullable', 'in:active,inactive'],
            'operating_hours' => ['nullable', 'json'],

            // Login credentials for this clinic's admin account.
            'clinic_admin_name' => ['required', 'string', 'max:255'],
            'clinic_admin_email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'clinic_admin_password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'logo.required' => 'Please upload a clinic logo.',
            'operating_hours.json' => 'Operating hours format is invalid.',
            'clinic_admin_email.unique' => 'This email is already used by another account.',
        ];
    }
}