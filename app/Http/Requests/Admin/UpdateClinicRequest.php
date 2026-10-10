<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clinic = $this->route('clinic');
        $clinicId = $clinic?->id;
        $clinicAdminUserId = $clinic?->clinicAdmin?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'address' => ['sometimes', 'required', 'string', 'max:500'],
            'contact_number' => ['sometimes', 'required', 'string', 'max:20'],
            'email' => [
                'sometimes', 'required', 'email', 'max:255',
                Rule::unique('clinics', 'email')->ignore($clinicId),
            ],
            'status' => ['nullable', 'in:active,inactive'],
            'operating_hours' => ['nullable', 'json'],

            'clinic_admin_name' => ['sometimes', 'required', 'string', 'max:255'],
            'clinic_admin_email' => [
                'sometimes', 'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($clinicAdminUserId),
            ],
            'clinic_admin_password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
        ];
    }
}