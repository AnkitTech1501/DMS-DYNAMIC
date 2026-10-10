<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClinicResource;
use App\Http\Resources\DoctorResource;
use App\Models\Clinic;
use App\Models\Doctor;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_clinics' => Clinic::count(),
            'active_clinics' => Clinic::where('status', 'active')->count(),
            'inactive_clinics' => Clinic::where('status', 'inactive')->count(),
            'total_doctors' => Doctor::count(),
            'active_doctors' => Doctor::whereHas('user', fn ($q) => $q->where('status', 'active'))->count(),
            'inactive_doctors' => Doctor::whereHas('user', fn ($q) => $q->where('status', 'inactive'))->count(),
        ];

        $recentClinics = Clinic::withCount('doctors')->latest()->take(5)->get();
        $recentDoctors = Doctor::with(['user', 'clinic'])->latest()->take(5)->get();

        return $this->success('Dashboard data fetched.', [
            'stats' => $stats,
            'recent_clinics' => ClinicResource::collection($recentClinics),
            'recent_doctors' => DoctorResource::collection($recentDoctors),
        ]);
    }
}