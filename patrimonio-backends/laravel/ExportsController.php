<?php
namespace App\Http\Controllers;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class ExportsController extends Controller {
    public function protocol(Request $r) {
        $movement = $r->all();
        $pdf = Pdf::loadView('protocol', ['movement' => $movement]);
        return $pdf->download('protocolo.pdf');
    }
    public function assetsExcel(Request $r) {
        $assets = $r->all();
        return Excel::download(new \App\Exports\AssetsExport($assets), 'patrimonio.xlsx');
    }
}

