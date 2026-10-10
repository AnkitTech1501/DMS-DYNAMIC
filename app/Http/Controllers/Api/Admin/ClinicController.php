<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClinicRequest;
use App\Http\Requests\Admin\UpdateClinicRequest;
use App\Http\Resources\ClinicResource;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ClinicController extends Controller
{
    public function index()
    {
        $clinics = Clinic::withCount('doctors')
            ->with('clinicAdmin')
            ->latest()
            ->paginate(15);

        return $this->success('Clinics fetched.', ClinicResource::collection($clinics)->response()->getData(true));
    }

    public function store(StoreClinicRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('clinics/logos', 'public');
        }

        if (isset($data['operating_hours'])) {
            $data['operating_hours'] = json_decode($data['operating_hours'], true);
        }

        $data['status'] = $data['status'] ?? 'active';

        try {
            $clinic = DB::transaction(function () use ($data) {
                $clinic = Clinic::create([
                    'name' => $data['name'],
                    'logo' => $data['logo'] ?? null,
                    'address' => $data['address'],
                    'contact_number' => $data['contact_number'],
                    'email' => $data['email'],
                    'status' => $data['status'],
                    'operating_hours' => $data['operating_hours'] ?? null,
                ]);

                User::create([
                    'name' => $data['clinic_admin_name'],
                    'email' => $data['clinic_admin_email'],
                    'password' => Hash::make($data['clinic_admin_password']),
                    'role' => 'clinic_admin',
                    'status' => 'active',
                    'clinic_id' => $clinic->id,
                ]);

                return $clinic;
            });
        } catch (Throwable $e) {
            return $this->error('Failed to create clinic. Please try again.', 500, $e->getMessage());
        }

        $clinic->load('clinicAdmin');

        return $this->success('Clinic created successfully.', new ClinicResource($clinic), 201);
    }

    public function show(Clinic $clinic)
    {
        $clinic->loadCount('doctors');
        $clinic->load('clinicAdmin');

        return $this->success('Clinic fetched.', new ClinicResource($clinic));
    }

    public function update(UpdateClinicRequest $request, Clinic $clinic)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($clinic->logo) {
                Storage::disk('public')->delete($clinic->logo);
            }
            $data['logo'] = $request->file('logo')->store('clinics/logos', 'public');
        }

        if (isset($data['operating_hours'])) {
            $data['operating_hours'] = json_decode($data['operating_hours'], true);
        }

        try {
            DB::transaction(function () use ($data, $clinic) {
                $clinic->update(array_filter([
                    'name' => $data['name'] ?? null,
                    'logo' => $data['logo'] ?? null,
                    'address' => $data['address'] ?? null,
                    'contact_number' => $data['contact_number'] ?? null,
                    'email' => $data['email'] ?? null,
                    'status' => $data['status'] ?? null,
                    'operating_hours' => $data['operating_hours'] ?? null,
                ], fn ($v) => $v !== null));

                $clinicAdminUpdate = array_filter([
                    'name' => $data['clinic_admin_name'] ?? null,
                    'email' => $data['clinic_admin_email'] ?? null,
                ], fn ($v) => $v !== null);

                if (! empty($data['clinic_admin_password'])) {
                    $clinicAdminUpdate['password'] = Hash::make($data['clinic_admin_password']);
                }

                if (! empty($clinicAdminUpdate) && $clinic->clinicAdmin) {
                    $clinic->clinicAdmin->update($clinicAdminUpdate);
                }
            });
        } catch (Throwable $e) {
            return $this->error('Failed to update clinic. Please try again.', 500, $e->getMessage());
        }

        $clinic->load('clinicAdmin');

        return $this->success('Clinic updated successfully.', new ClinicResource($clinic));
    }

    public function destroy(Clinic $clinic)
    {
        if ($clinic->doctors()->exists()) {
            $clinic->update(['status' => 'inactive']);

            return $this->success('Clinic has assigned doctors, so it was deactivated instead of deleted.', new ClinicResource($clinic));
        }

        DB::transaction(function () use ($clinic) {
            $clinic->clinicAdmin?->delete();
            $clinic->delete();
        });

        return $this->success('Clinic deleted successfully.');
    }
}