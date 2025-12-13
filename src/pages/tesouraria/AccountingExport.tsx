import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV } from "@/lib/export-utils";

export default function AccountingExport() {
  const [churchId, setChurchId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const id = p.get('churchId'); if (id) setChurchId(id); },[]);
  const load = async () => {
    if (!churchId) return;
    const { data: e } = await supabase.from('church_entries').select('*').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('*').eq('church_id', churchId);
    const es = (e||[]).map((r:any)=>({ date:r.date, account:r.account_code||'1.1.1', cost_center:r.cost_center_id||'', dc:'D', value:Number(r.amount||0), memo:r.description||'' }));
    const xs = (x||[]).map((r:any)=>({ date:r.date, account:r.account_code||'3.1.1', cost_center:r.cost_center_id||'', dc:'C', value:Number(r.total_value||0), memo:r.description||'' }));
    setRows([...es, ...xs]);
  };
  useEffect(()=>{ load(); },[churchId]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Export Contábil</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{/* options */}</SelectContent></Select>
          <button onClick={()=>exportToCSV(rows, `ledger-${churchId}`, [
            { key:'date', label:'Data' }, { key:'account', label:'Conta' }, { key:'cost_center', label:'Centro de Custo' }, { key:'dc', label:'D/C' }, { key:'value', label:'Valor' }, { key:'memo', label:'Histórico' }
          ])}>Exportar CSV</button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

