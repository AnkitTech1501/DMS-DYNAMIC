<?php

namespace App\Http\Controllers\Api\ClinicAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Http\Resources\ClinicResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(AdminLoginRequest $request)
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])
            ->where('role', 'clinic_admin')
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->error('The provided credentials are incorrect.', 401);
        }

        if (! $user->isActive()) {
            return $this->error('This clinic admin account has been deactivated.', 403);
        }

        $user->load('clinic');

        if (! $user->clinic || $user->clinic->status !== 'active') {
            return $this->error('Your clinic is currently inactive. Please contact the administrator.', 403);
        }

        $token = $user->createToken('clinic-admin-token', ['clinic_admin'])->plainTextToken;

        return $this->success('Login successful.', [
            'user' => new UserResource($user),
            'clinic' => new ClinicResource($user->clinic),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success('Logged out successfully.');
    }

    public function profile(Request $request)
    {
        $user = $request->user()->load('clinic');

        return $this->success('Profile fetched.', [
            'user' => new UserResource($user),
            'clinic' => new ClinicResource($user->clinic),
        ]);
    }
}