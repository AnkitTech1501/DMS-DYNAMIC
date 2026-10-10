<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clinic extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'address',
        'contact_number',
        'email',
        'status',
        'operating_hours',
    ];

    protected $casts = [
        'operating_hours' => 'array',
    ];

    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }

    public function clinicAdmin()
    {
        return $this->hasOne(User::class, 'clinic_id')
            ->where('role', 'clinic_admin');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}