<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('church_id');
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_value', 14, 2)->default(0);
            $table->decimal('total_value', 16, 2)->storedAs('quantity * unit_value');
            $table->string('status')->default('ATIVO');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('assets');
    }
};

