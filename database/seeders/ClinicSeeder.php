<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClinicSeeder extends Seeder
{
    public function run(): void
    {
        $clinic = Clinic::create([
            'name' => 'Mumbai Care Clinic',
            'logo' => null,
            'address' => 'Lower Parel, Mumbai',
            'contact_number' => '9876543210',
            'email' => 'mumbaicare@example.com',
            'status' => 'active',

            'operating_hours' => [
                [
                    'day' => 'Monday',
                    'closed' => false,
                    'open_time' => '09:00',
                    'close_time' => '18:00',
                ],
                [
                    'day' => 'Tuesday',
                    'closed' => false,
                    'open_time' => '09:00',
                    'close_time' => '18:00',
                ],
                [
                    'day' => 'Wednesday',
                    'closed' => false,
                    'open_time' => '09:00',
                    'close_time' => '18:00',
                ],
                [
                    'day' => 'Thursday',
                    'closed' => false,
                    'open_time' => '09:00',
                    'close_time' => '18:00',
                ],
                [
                    'day' => 'Friday',
                    'closed' => false,
                    'open_time' => '09:00',
                    'close_time' => '18:00',
                ],
                [
                    'day' => 'Saturday',
                    'closed' => false,
                    'open_time' => '09:00',
                    'close_time' => '14:00',
                ],
                [
                    'day' => 'Sunday',
                    'closed' => true,
                    'open_time' => '',
                    'close_time' => '',
                ],
            ],
        ]);

        User::create([
            'name' => 'Mumbai Clinic Admin',
            'email' => 'clinicadmin@example.com',
            'password' => Hash::make('password'),
            'role' => 'clinic_admin',
            'clinic_id' => $clinic->id,
            'is_active' => true,
        ]);
    }
}