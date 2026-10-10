<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','doctor','patient','clinic_admin') DEFAULT 'patient'");

        Schema::table('users', function (Blueprint $table) {
            // Only set for clinic_admin users — which clinic they manage.
            $table->foreignId('clinic_id')->nullable()->after('role')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('clinic_id');
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','doctor','patient') DEFAULT 'patient'");
    }
    
};
