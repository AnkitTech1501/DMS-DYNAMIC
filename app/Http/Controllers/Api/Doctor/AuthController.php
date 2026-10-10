<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Doctor login. Doctors can only log in with credentials created by the Admin.
     */
    public function login(AdminLoginRequest $request)
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])
            ->where('role', 'doctor')
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->error('The provided credentials are incorrect.', 401);
        }

        if (! $user->isActive()) {
            return $this->error('Your account has been deactivated. Please contact the clinic administrator.', 403);
        }

        $token = $user->createToken('doctor-token', ['doctor'])->plainTextToken;

        return $this->success('Login successful.', [
            'user' => new UserResource($user),
            'doctor' => $user->doctor()->with('clinic')->first(),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success('Logged out successfully.');
    }
}