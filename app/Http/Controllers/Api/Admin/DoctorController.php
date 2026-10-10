<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $doctors = Doctor::with(['user', 'clinic'])
            ->latest()
            ->paginate(15);

        return $this->success('Doctors fetched.', DoctorResource::collection($doctors)->response()->getData(true));
    }

    public function store(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'specialization' => ['required', 'string', 'max:255'],
            'medical_registration_number' => ['required', 'string', 'max:100', 'unique:doctors,medical_registration_number'],
            'profile_photo' => ['required', 'image', 'max:2048'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        try {
            $doctor = DB::transaction(function () use ($data, $request, $clinicId) {
                $user = User::create([
                    'name' => $data['full_name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'role' => 'doctor',
                    'status' => $data['status'] ?? 'active',
                ]);

                $photoPath = null;
                if ($request->hasFile('profile_photo')) {
                    $photoPath = $request->file('profile_photo')->store('doctors/photos', 'public');
                }

                return Doctor::create([
                    'user_id' => $user->id,
                    'clinic_id' => $clinicId, // always the clinic admin's own clinic — never user-supplied
                    'mobile_number' => $data['mobile_number'],
                    'specialization' => $data['specialization'],
                    'medical_registration_number' => $data['medical_registration_number'],
                    'profile_photo' => $photoPath,
                ]);
            });
        } catch (Throwable $e) {
            return $this->error('Failed to create doctor account. Please try again.', 500, $e->getMessage());
        }

        $doctor->load(['user', 'clinic']);

        return $this->success('Doctor created successfully.', new DoctorResource($doctor), 201);
    }

    public function show(Request $request, Doctor $doctor)
    {
        $this->authorizeClinicOwnership($request, $doctor);

        $doctor->load(['user', 'clinic']);

        return $this->success('Doctor fetched.', new DoctorResource($doctor));
    }

    public function update(Request $request, Doctor $doctor)
    {
        $this->authorizeClinicOwnership($request, $doctor);

        $data = $request->validate([
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($doctor->user_id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'mobile_number' => ['sometimes', 'required', 'string', 'max:20'],
            'specialization' => ['sometimes', 'required', 'string', 'max:255'],
            'medical_registration_number' => [
                'sometimes', 'required', 'string', 'max:100',
                Rule::unique('doctors', 'medical_registration_number')->ignore($doctor->id),
            ],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        try {
            DB::transaction(function () use ($data, $request, $doctor) {
                $userUpdate = array_filter([
                    'name' => $data['full_name'] ?? null,
                    'email' => $data['email'] ?? null,
                ], fn ($v) => $v !== null);

                if (isset($data['status'])) {
                    $userUpdate['is_active'] = $data['status'] === 'active';
                }

                if (! empty($data['password'])) {
                    $userUpdate['password'] = Hash::make($data['password']);
                }

                if (! empty($userUpdate)) {
                    $doctor->user()->update($userUpdate);
                }

                if ($request->hasFile('profile_photo')) {
                    if ($doctor->profile_photo) {
                        Storage::disk('public')->delete($doctor->profile_photo);
                    }
                    $data['profile_photo'] = $request->file('profile_photo')->store('doctors/photos', 'public');
                }

                $doctor->update(array_filter([
                    'mobile_number' => $data['mobile_number'] ?? null,
                    'specialization' => $data['specialization'] ?? null,
                    'medical_registration_number' => $data['medical_registration_number'] ?? null,
                    'profile_photo' => $data['profile_photo'] ?? null,
                ], fn ($v) => $v !== null));
                // Note: clinic_id is intentionally never updatable here — a
                // clinic admin can never move a doctor to another clinic.
            });
        } catch (Throwable $e) {
            return $this->error('Failed to update doctor account. Please try again.', 500, $e->getMessage());
        }

        $doctor->load(['user', 'clinic']);

        return $this->success('Doctor updated successfully.', new DoctorResource($doctor));
    }

    public function destroy(Request $request, Doctor $doctor)
    {
        $this->authorizeClinicOwnership($request, $doctor);

        try {
            DB::transaction(function () use ($doctor) {
                if ($doctor->profile_photo) {
                    Storage::disk('public')->delete($doctor->profile_photo);
                }
                $user = $doctor->user;
                $doctor->delete();
                $user?->delete();
            });
        } catch (Throwable $e) {
            return $this->error('Failed to delete doctor account. Please try again.', 500, $e->getMessage());
        }

        return $this->success('Doctor deleted successfully.');
    }

    private function authorizeClinicOwnership(Request $request, Doctor $doctor): void
    {
        if ($doctor->clinic_id !== $request->user()->clinic_id) {
            abort(403, 'You do not have permission to manage this doctor.');
        }
    }
}
