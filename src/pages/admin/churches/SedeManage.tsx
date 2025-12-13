import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function SedeManage() {
  const [matrizes, setMatrizes] = useState<any[]>([]);
  const [matrizId, setMatrizId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [financeChurches, setFinanceChurches] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const loadMatrizes = async () => { const { data } = await supabase.from('church_matriz').select('id,name').order('name'); setMatrizes(data||[]); };
  const load = async () => { if (!matrizId) return; const { data } = await supabase.from('church_sede').select('*').eq('matriz_id', matrizId).order('name'); setRows(data||[]); const { data: subs } = await supabase.from('church_subsede').select('id,sede_id'); const c: Record<string, number> = {}; (subs||[]).forEach((s:any)=>{ c[s.sede_id] = (c[s.sede_id]||0)+1 }); setCounts(c); };
  useEffect(()=>{ loadMatrizes(); },[]);
  useEffect(()=>{ load(); },[matrizId]);
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const mid = p.get('matrizId'); if (mid) setMatrizId(mid); },[]);
  useEffect(()=>{ const name = matrizes.find(m=>m.id===matrizId)?.name||''; setBreadcrumb(name ? `Matriz: ${name} > Sedes` : ''); }, [matrizId, matrizes]);
  useEffect(()=>{ (async()=>{ const { data: chs } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setFinanceChurches(chs||[]); })(); },[]);
  const add = async () => { if (!matrizId || !name) return; await supabase.from('church_sede').insert({ matriz_id: matrizId, name }); setName(''); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('church_sede').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('church_sede').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Sedes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {breadcrumb && (
            <div className="text-xs">
              <a className="underline" href="/admin/igrejas/matriz">Matriz</a>
              <span> &gt; </span>
              <span>{breadcrumb.replace('Matriz: ','')}</span>
            </div>
          )}
          {matrizId && (
            <div className="grid grid-cols-3 gap-2">
              <div className="border p-2 rounded"><div className="text-xs">Total Sedes</div><div className="text-lg font-semibold">{rows.length}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Total Subsedes</div><div className="text-lg font-semibold">{Object.values(counts).reduce((s,n)=>s+n,0)}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Saldo Consolidado</div><div className="text-sm"><a className="underline" href={`/tesouraria/consolidacao?entity=IGREJA&rootId=${matrizId}`}>ver gráfico</a></div></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Select value={matrizId} onValueChange={setMatrizId}><SelectTrigger className="w-64"><SelectValue placeholder="Matriz" /></SelectTrigger><SelectContent>{matrizes.map(m=>(<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Nome da Sede" value={name} onChange={(e)=>setName(e.target.value)} />
            <Button onClick={add}>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {breadcrumb && <div className="text-xs text-muted-foreground">{breadcrumb}</div>}
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                <span className="text-xs text-muted-foreground">Matriz: {matrizes.find(m=>m.id===r.matriz_id)?.name||''}</span>
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_church_id||''} onChange={(e)=>update(r.id,{ finance_church_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Igreja)</option>
                  {financeChurches.map((c:any)=>(<option key={c.id} value={c.id}>{c.nome_fantasia||c.id}</option>))}
                </select>
                <span className="text-xs">Subsedes: {counts[r.id]||0}</span>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=IGREJA&rootId=${matrizId}`}>Consolidar Matriz</Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/relatorios?churchId=${matrizId}`}>Relatórios Mensais</Button>
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/export?churchId=${matrizId}`}>Exportar Contábil</Button>
                  <Button variant="outline" onClick={()=>{ if ((counts[r.id]||0)>0) return alert('Exclua as subsedes antes.'); remove(r.id); }}>Excluir</Button>
                </div>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const { data: subs } = await supabase.from('church_subsede').select('id,sede_id');
                  const { data: congs } = await supabase.from('church_congregation').select('id,subsede_id');
                  const congBySede: Record<string, number> = {};
                  (congs||[]).forEach((c:any)=>{ const sede = (subs||[]).find((s:any)=>s.id===c.subsede_id)?.sede_id; if (sede) congBySede[sede] = (congBySede[sede]||0)+1 });
                  const lines = ['level,id,name,subsede_count,congregacao_count'];
                  rows.forEach((r:any)=>lines.push(`SEDE,${r.id},${r.name},${counts[r.id]||0},${congBySede[r.id]||0}`));
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hierarquia_sedes_${matrizId}.csv`; a.click();
                }}>Exportar Hierarquia (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

