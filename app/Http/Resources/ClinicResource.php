<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClinicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'logo' => $this->logo ? url('/storage/' . $this->logo) : null,
            'address' => $this->address,
            'contact_number' => $this->contact_number,
            'email' => $this->email,
            'status' => $this->status,
            'operating_hours' => $this->operating_hours,
            'doctors_count' => $this->whenCounted('doctors'),
            'clinic_admin' => $this->whenLoaded('clinicAdmin', function () {
                return $this->clinicAdmin ? [
                    'id' => $this->clinicAdmin->id,
                    'name' => $this->clinicAdmin->name,
                    'email' => $this->clinicAdmin->email,
                    'status' => $this->clinicAdmin->status,
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}