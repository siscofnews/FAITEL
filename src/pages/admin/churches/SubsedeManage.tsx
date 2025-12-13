import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function SubsedeManage() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [sedeId, setSedeId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [financeChurches, setFinanceChurches] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const loadSedes = async () => { const { data } = await supabase.from('church_sede').select('id,name').order('name'); setSedes(data||[]); };
  const load = async () => { if (!sedeId) return; const { data } = await supabase.from('church_subsede').select('*').eq('sede_id', sedeId).order('name'); setRows(data||[]); const { data: congs } = await supabase.from('church_congregation').select('id,subsede_id'); const c: Record<string, number> = {}; (congs||[]).forEach((s:any)=>{ c[s.subsede_id] = (c[s.subsede_id]||0)+1 }); setCounts(c); };
  useEffect(()=>{ loadSedes(); },[]);
  useEffect(()=>{ load(); },[sedeId]);
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const sid = p.get('sedeId'); if (sid) setSedeId(sid); },[]);
  useEffect(()=>{ (async()=>{ if (!sedeId) { setBreadcrumb(''); return; } const { data: sd } = await supabase.from('church_sede').select('id,name,matriz_id').eq('id', sedeId).maybeSingle(); if (!sd) { setBreadcrumb(''); return; } const { data: mz } = await supabase.from('church_matriz').select('id,name').eq('id', sd.matriz_id).maybeSingle(); const mName = mz?.name||''; const sName = sd?.name||''; setBreadcrumb(`Matriz: ${mName} > Sede: ${sName} > Subsedes`); })(); }, [sedeId]);
  useEffect(()=>{ (async()=>{ const { data: chs } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setFinanceChurches(chs||[]); })(); },[]);
  const add = async () => { if (!sedeId || !name) return; await supabase.from('church_subsede').insert({ sede_id: sedeId, name }); setName(''); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('church_subsede').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('church_subsede').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Subsedes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={sedeId} onValueChange={setSedeId}><SelectTrigger className="w-64"><SelectValue placeholder="Sede" /></SelectTrigger><SelectContent>{sedes.map(s=>(<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Nome da Subsede" value={name} onChange={(e)=>setName(e.target.value)} />
            <Button onClick={add}>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {breadcrumb && <div className="text-xs text-muted-foreground">{breadcrumb}</div>}
            {sedeId && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="border p-2 rounded"><div className="text-xs">Total Subsedes</div><div className="text-lg font-semibold">{rows.length}</div></div>
                <div className="border p-2 rounded"><div className="text-xs">Total Congregações</div><div className="text-lg font-semibold">{Object.values(counts).reduce((s,n)=>s+n,0)}</div></div>
                <div className="border p-2 rounded"><div className="text-xs">Saldo Consolidado</div><div className="text-sm"><a className="underline" href={`/tesouraria/consolidacao?entity=IGREJA&rootId=${sedeId}`}>ver gráfico</a></div></div>
              </div>
            )}
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                <span className="text-xs text-muted-foreground">Sede: {sedes.find(s=>s.id===r.sede_id)?.name||''}</span>
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_church_id||''} onChange={(e)=>update(r.id,{ finance_church_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Igreja)</option>
                  {financeChurches.map((c:any)=>(<option key={c.id} value={c.id}>{c.nome_fantasia||c.id}</option>))}
                </select>
                <span className="text-xs">Congregações: {counts[r.id]||0}</span>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=IGREJA&rootId=${sedeId}`}>Consolidar Sede</Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/relatorios?churchId=${sedes.find(s=>s.id===r.sede_id)?.matriz_id||''}`}>Relatórios Mensais</Button>
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/export?churchId=${sedes.find(s=>s.id===r.sede_id)?.matriz_id||''}`}>Exportar Contábil</Button>
                  <Button variant="outline" onClick={()=>{ if ((counts[r.id]||0)>0) return alert('Exclua as congregações antes.'); remove(r.id); }}>Excluir</Button>
                </div>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const lines = ['level,id,name,congregacao_count'];
                  rows.forEach((r:any)=>lines.push(`SUBSEDE,${r.id},${r.name},${counts[r.id]||0}`));
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hierarquia_subsedes_${sedeId}.csv`; a.click();
                }}>Exportar Hierarquia (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

