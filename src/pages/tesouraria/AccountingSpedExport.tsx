import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function AccountingSpedExport() {
  const [churchId, setChurchId] = useState<string>("");
  const [text, setText] = useState<string>("");
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const id = p.get('churchId'); if (id) setChurchId(id); },[]);
  const load = async () => {
    if (!churchId) return;
    const { data: e } = await supabase.from('church_entries').select('*').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('*').eq('church_id', churchId);
    const rows: any[] = [];
    (e||[]).forEach((r:any)=>rows.push({ date:r.date, account:r.account_code||'1.1.1', cc:r.cost_center_id||'', dc:'D', val:Number(r.amount||0), hist:r.description||'', nat:'RECEITA' }));
    (x||[]).forEach((r:any)=>rows.push({ date:r.date, account:r.account_code||'3.1.1', cc:r.cost_center_id||'', dc:'C', val:Number(r.total_value||0), hist:r.description||'', nat:'DESPESA' }));
    const lines = rows.map(r=>[new Date(r.date).toISOString().split('T')[0], r.account, r.cc, r.dc, r.val.toFixed(2), r.nat, r.hist.replace(/\r?\n/g,' ')].join(';')).join('\n');
    setText(lines);
  };
  useEffect(()=>{ load(); },[churchId]);
  const download = () => { const blob = new Blob([text], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sped_${churchId}.txt`; a.click(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Export TXT SPED</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{/* options */}</SelectContent></Select>
          <textarea readOnly className="w-full h-64 border rounded p-2" value={text} />
          <button onClick={download}>Baixar TXT</button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

