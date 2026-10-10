<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $doctor = $this->route('doctor');
        $userId = $doctor?->user_id;

        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'mobile_number' => ['sometimes', 'required', 'string', 'max:20'],
            'specialization' => ['sometimes', 'required', 'string', 'max:255'],
            'medical_registration_number' => [
                'sometimes', 'required', 'string', 'max:100',
                Rule::unique('doctors', 'medical_registration_number')->ignore($doctor?->id),
            ],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'clinic_id' => [
                'sometimes', 'required', 'integer',
                Rule::exists('clinics', 'id')->where('status', 'active'),
            ],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'clinic_id.exists' => 'The selected clinic was not found or is no longer active.',
        ];
    }
}