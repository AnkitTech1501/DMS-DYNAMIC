<?php

namespace App\Http\Controllers\Api\ClinicAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $stats = [
            'total_doctors' => Doctor::where('clinic_id', $clinicId)->count(),
            'active_doctors' => Doctor::where('clinic_id', $clinicId)
                ->whereHas('user', fn ($q) => $q->where('status', 'active'))->count(),
            'inactive_doctors' => Doctor::where('clinic_id', $clinicId)
                ->whereHas('user', fn ($q) => $q->where('status', 'inactive'))->count(),
        ];

        $recentDoctors = Doctor::with(['user', 'clinic'])
            ->where('clinic_id', $clinicId)
            ->latest()
            ->take(5)
            ->get();

        return $this->success('Dashboard data fetched.', [
            'stats' => $stats,
            'recent_doctors' => DoctorResource::collection($recentDoctors),
        ]);
    }
}