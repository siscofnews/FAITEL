import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function CongregationManage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [subId, setSubId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [financeChurches, setFinanceChurches] = useState<any[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [name, setName] = useState<string>("");
  const loadSubs = async () => { const { data } = await supabase.from('church_subsede').select('id,name').order('name'); setSubs(data||[]); };
  const load = async () => { if (!subId) return; const { data } = await supabase.from('church_congregation').select('*').eq('subsede_id', subId).order('name'); setRows(data||[]); };
  useEffect(()=>{ loadSubs(); },[]);
  useEffect(()=>{ load(); },[subId]);
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const bid = p.get('subId'); if (bid) setSubId(bid); },[]);
  useEffect(()=>{ (async()=>{ if (!subId) { setBreadcrumb(''); return; } const { data: sb } = await supabase.from('church_subsede').select('id,name,sede_id').eq('id', subId).maybeSingle(); if (!sb) { setBreadcrumb(''); return; } const { data: sd } = await supabase.from('church_sede').select('id,name,matriz_id').eq('id', sb.sede_id).maybeSingle(); const { data: mz } = await supabase.from('church_matriz').select('id,name').eq('id', sd?.matriz_id).maybeSingle(); const mName = mz?.name||''; const sName = sd?.name||''; const bName = sb?.name||''; setBreadcrumb(`Matriz: ${mName} > Sede: ${sName} > Subsede: ${bName} > Congregações`); })(); }, [subId]);
  useEffect(()=>{ (async()=>{ const { data: chs } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setFinanceChurches(chs||[]); })(); },[]);
  const add = async () => { if (!subId || !name) return; await supabase.from('church_congregation').insert({ subsede_id: subId, name }); setName(''); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('church_congregation').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('church_congregation').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Congregações</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={subId} onValueChange={setSubId}><SelectTrigger className="w-64"><SelectValue placeholder="Subsede" /></SelectTrigger><SelectContent>{subs.map(s=>(<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Nome da Congregação" value={name} onChange={(e)=>setName(e.target.value)} />
            <Button onClick={add}>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {breadcrumb && <div className="text-xs text-muted-foreground">{breadcrumb}</div>}
            {subId && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="border p-2 rounded"><div className="text-xs">Total Congregações</div><div className="text-lg font-semibold">{rows.length}</div></div>
                <div className="border p-2 rounded"><div className="text-xs">Saldo Consolidado</div><div className="text-sm"><a className="underline" href={`/tesouraria/consolidacao?entity=IGREJA&rootId=${subId}`}>ver gráfico</a></div></div>
                <div className="border p-2 rounded"><div className="text-xs">Relatórios</div><div className="text-sm"><a className="underline" href={`/tesouraria/relatorios?churchId=${subId}`}>mensais</a></div></div>
              </div>
            )}
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                <span className="text-xs text-muted-foreground">Subsede: {subs.find(s=>s.id===r.subsede_id)?.name||''}</span>
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_church_id||''} onChange={(e)=>update(r.id,{ finance_church_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Igreja)</option>
                  {financeChurches.map((c:any)=>(<option key={c.id} value={c.id}>{c.nome_fantasia||c.id}</option>))}
                </select>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/tendencias?churchId=${r.id}`}>Tesouraria</Button>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=IGREJA&rootId=${subId}`}>Consolidar Subsede</Button>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/relatorios?churchId=${subs.find(s=>s.id===r.subsede_id)?.matriz_id||''}`}>Relatórios Mensais</Button>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/export?churchId=${subs.find(s=>s.id===r.subsede_id)?.matriz_id||''}`}>Exportar Contábil</Button>
                <Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
