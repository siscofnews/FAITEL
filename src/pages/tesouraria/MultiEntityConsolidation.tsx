import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function MultiEntityConsolidation() {
  const [entity, setEntity] = useState<'IGREJA'|'CONVENCAO'|'FACULDADE'>('IGREJA');
  const [roots, setRoots] = useState<any[]>([]);
  const [rootId, setRootId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const e = params.get('entity');
    const r = params.get('rootId');
    if (e && (e==='IGREJA' || e==='CONVENCAO' || e==='FACULDADE')) setEntity(e as any);
    if (r) setRootId(r);
  },[]);
  const loadRoots = async () => {
    if (entity === 'IGREJA') { const { data } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setRoots(data||[]); }
    if (entity === 'CONVENCAO') { const { data } = await supabase.from('conventions').select('id,name').order('name'); setRoots(data||[]); }
    if (entity === 'FACULDADE') { const { data } = await supabase.from('faculties').select('id,name').order('name'); setRoots(data||[]); }
  };
  const loadRows = async () => {
    if (!rootId) return;
    if (entity === 'IGREJA') {
      const { data: ids } = await supabase.rpc('get_church_tree', { _root: rootId });
      const list: string[] = (ids as any) || [];
      const { data: accts } = await supabase.from('church_accounts').select('id,church_id');
      const { data: e } = await supabase.from('church_entries').select('amount,account_id');
      const { data: x } = await supabase.from('church_expenses').select('total_value,account_id');
      const accounts = (accts||[]).filter((a:any)=>list.includes(a.church_id));
      const agg: Record<string,{ name:string, entries:number, expenses:number }> = {};
      accounts.forEach((a:any)=>{ const name = roots.find(r=>r.id===a.church_id)?.nome_fantasia || 'Igreja'; agg[a.church_id] ||= { name, entries:0, expenses:0 }; agg[a.church_id].entries += (e||[]).filter((r:any)=>r.account_id===a.id).reduce((s:number,r:any)=>s+Number(r.amount||0),0); agg[a.church_id].expenses += (x||[]).filter((r:any)=>r.account_id===a.id).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); });
      setRows(Object.values(agg).map(r=>({ ...r, balance: r.entries - r.expenses })));
    }
    if (entity === 'CONVENCAO') {
      const { data: ids } = await supabase.rpc('get_convention_tree', { _root: rootId });
      const list: string[] = (ids as any) || [];
      const { data: e } = await supabase.from('convention_entries').select('amount,convention_id');
      const { data: x } = await supabase.from('convention_expenses').select('total_value,convention_id');
      const agg: Record<string,{ name:string, entries:number, expenses:number }> = {};
      list.forEach((cid:string)=>{ const name = roots.find(r=>r.id===cid)?.name || 'Convenção'; agg[cid] ||= { name, entries:0, expenses:0 }; agg[cid].entries += (e||[]).filter((r:any)=>r.convention_id===cid).reduce((s:number,r:any)=>s+Number(r.amount||0),0); agg[cid].expenses += (x||[]).filter((r:any)=>r.convention_id===cid).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); });
      setRows(Object.values(agg).map(r=>({ ...r, balance: r.entries - r.expenses })));
    }
    if (entity === 'FACULDADE') {
      const { data: poles } = await supabase.from('faculty_poles').select('id,name,faculty_id').eq('faculty_id', rootId);
      const { data: pays } = await supabase.from('payments').select('amount,pole_id');
      const agg: Record<string,{ name:string, entries:number }> = {};
      (poles||[]).forEach((p:any)=>{ const name = p.name; agg[p.id] ||= { name, entries:0 }; agg[p.id].entries += (pays||[]).filter((r:any)=>r.pole_id===p.id).reduce((s:number,r:any)=>s+Number(r.amount||0),0); });
      setRows(Object.values(agg).map(r=>({ ...r, expenses:0, balance: r.entries })));
    }
  };
  useEffect(()=>{ loadRoots(); }, [entity]);
  useEffect(()=>{ loadRows(); }, [rootId]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Consolidação Multi‑Entidade</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Select value={entity} onValueChange={(v:any)=>{ setEntity(v); setRootId(''); }}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IGREJA">Igreja</SelectItem><SelectItem value="CONVENCAO">Convenção</SelectItem><SelectItem value="FACULDADE">Faculdade</SelectItem></SelectContent></Select>
            <Select value={rootId} onValueChange={setRootId}><SelectTrigger className="w-64"><SelectValue placeholder="Raiz" /></SelectTrigger><SelectContent>{roots.map((r:any)=>(<SelectItem key={r.id} value={r.id}>{r.nome_fantasia||r.name}</SelectItem>))}</SelectContent></Select>
          </div>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entries" name="Entradas" fill="#16a34a" />
                <Bar dataKey="expenses" name="Despesas" fill="#ef4444" />
                <Bar dataKey="balance" name="Saldo" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

