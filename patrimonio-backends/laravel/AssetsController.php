<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Asset;

class AssetsController extends Controller {
    public function store(Request $r) {
        $data = $r->all();
        $code = DB::select('select generate_asset_code_by_church(?) as code', [$data['church_id']])[0]->code;
        $data['code'] = $code;
        $asset = Asset::create($data);
        return response()->json($asset, 201);
    }
}

