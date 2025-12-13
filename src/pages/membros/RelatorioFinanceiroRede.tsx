import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function RelatorioFinanceiroRede() {
  const [root, setRoot] = useState<string>("");
  const [churches, setChurches] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const loadChurches = async () => {
    const { data } = await supabase.from('churches').select('id,nome_fantasia').eq('is_active', true).order('nome_fantasia');
    setChurches(data||[]);
  };
  const loadTotals = async () => {
    if (!root) return;
    const { data: t } = await supabase.rpc('network_tithes_totals', { _root: root });
    const { data: o } = await supabase.rpc('network_offerings_totals', { _root: root });
    const map: Record<string, any> = {};
    (t||[]).forEach((r:any)=>{ map[r.church_id]={ church_id:r.church_id, tithes:Number(r.total||0), offerings:0 }; });
    (o||[]).forEach((r:any)=>{ if(!map[r.church_id]) map[r.church_id]={ church_id:r.church_id, tithes:0, offerings:0 }; map[r.church_id].offerings=Number(r.total||0); });
    const withNames = Object.values(map).map((x:any)=>({ ...x, name: churches.find(c=>c.id===x.church_id)?.nome_fantasia || 'Igreja' }));
    setRows(withNames);
  };
  useEffect(()=>{ loadChurches(); },[]);
  useEffect(()=>{ loadTotals(); },[root]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Financeiro por Rede</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Select value={root} onValueChange={setRoot}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja raiz" /></SelectTrigger><SelectContent>{churches.map(c=>(<SelectItem key={c.id} value={c.id}>{c.nome_fantasia}</SelectItem>))}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            {rows.map((r:any)=>(<div key={r.church_id} className="border p-2 rounded flex justify-between"><span>{r.name}</span><span>{r.tithes.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • {r.offerings.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

