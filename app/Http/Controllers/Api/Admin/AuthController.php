<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
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
            ->where('role', 'admin')
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->error('The provided credentials are incorrect.', 401);
        }

        if (! $user->isActive()) {
            return $this->error('This admin account has been deactivated.', 403);
        }

        $token = $user->createToken('admin-token', ['admin'])->plainTextToken;

        return $this->success('Login successful.', [
            'user' => new UserResource($user),
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
        return $this->success('Profile fetched.', new UserResource($request->user()));
    }
}