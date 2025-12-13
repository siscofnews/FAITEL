<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TreasuryController extends Controller {
    public function addChurchEntry($churchId, Request $r) {
        $entry = DB::table('church_entries')->insertGetId([
            'id' => DB::raw('uuid_generate_v4()'),
            'church_id' => $churchId,
            'account_id' => $r->input('account_id'),
            'finance_type_id' => $r->input('finance_type_id'),
            'amount' => $r->input('amount'),
            'payment_method' => $r->input('payment_method'),
            'description' => $r->input('description')
        ]);
        return response()->json(['id' => $entry], 201);
    }
    public function closeChurchAccount($id) {
        DB::select('select calculate_repass_and_close(?)', [$id]);
        return response()->json(['ok' => true]);
    }
}

