<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\ClinicController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DoctorController;
use App\Http\Controllers\Api\ClinicAdmin\AuthController as ClinicAdminAuthController;
use App\Http\Controllers\Api\ClinicAdmin\DashboardController as ClinicAdminDashboardController;
use App\Http\Controllers\Api\ClinicAdmin\DoctorController as ClinicAdminDoctorController;
use App\Http\Controllers\Api\Doctor\AuthController as DoctorAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/profile', [AdminAuthController::class, 'profile']);
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::apiResource('clinics', ClinicController::class);
        Route::apiResource('doctors', DoctorController::class);
    });
});

/*
|--------------------------------------------------------------------------
| Clinic Admin routes
|--------------------------------------------------------------------------
*/
Route::prefix('clinic-admin')->group(function () {
    Route::post('/login', [ClinicAdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'role:clinic_admin'])->group(function () {
        Route::post('/logout', [ClinicAdminAuthController::class, 'logout']);
        Route::get('/profile', [ClinicAdminAuthController::class, 'profile']);
        Route::get('/dashboard', [ClinicAdminDashboardController::class, 'index']);
        Route::apiResource('doctors', ClinicAdminDoctorController::class);
    });
});

/*
|--------------------------------------------------------------------------
| Doctor routes
|--------------------------------------------------------------------------
*/
Route::prefix('doctor')->group(function () {
    Route::post('/login', [DoctorAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'role:doctor'])->group(function () {
        Route::post('/logout', [DoctorAuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| Patient routes (placeholder for future tasks)
|--------------------------------------------------------------------------
*/
Route::prefix('patient')->group(function () {
    //
});