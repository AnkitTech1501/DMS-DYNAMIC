<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'specialization' => ['required', 'string', 'max:255'],
            'medical_registration_number' => ['required', 'string', 'max:100', 'unique:doctors,medical_registration_number'],
            'profile_photo' => ['required', 'image', 'max:2048'],
            'clinic_id' => [
                'required',
                'integer',
                Rule::exists('clinics', 'id')->where('status', 'active'),
            ],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'clinic_id.required' => 'Please select a clinic for this doctor.',
            'clinic_id.exists' => 'The selected clinic was not found or is no longer active.',
            'profile_photo.required' => 'Please upload a profile photo.',
        ];
    }
}