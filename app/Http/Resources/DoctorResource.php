<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->user->name,
            'email' => $this->user->email,
            'status' => $this->user->status,
            'mobile_number' => $this->mobile_number,
            'specialization' => $this->specialization,
            'medical_registration_number' => $this->medical_registration_number,
            'profile_photo' => $this->profile_photo ? asset('storage/' . $this->profile_photo) : null,
            'clinic' => [
                'id' => $this->clinic->id,
                'name' => $this->clinic->name,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}