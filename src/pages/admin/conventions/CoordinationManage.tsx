import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function CoordinationManage() {
  const [states, setStates] = useState<any[]>([]);
  const [stateId, setStateId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [financeConvs, setFinanceConvs] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const loadStates = async () => { const { data } = await supabase.from('convention_state').select('id,name').order('name'); setStates(data||[]); };
  const load = async () => { if (!stateId) return; const { data } = await supabase.from('convention_coordination').select('*').eq('state_id', stateId).order('name'); setRows(data||[]); };
  useEffect(()=>{ loadStates(); },[]);
  useEffect(()=>{ load(); },[stateId]);
  useEffect(()=>{ (async()=>{ const { data: convs } = await supabase.from('conventions').select('id,name').order('name'); setFinanceConvs(convs||[]); })(); },[]);
  const add = async () => { if (!stateId || !name) return; await supabase.from('convention_coordination').insert({ state_id: stateId, name }); setName(''); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('convention_coordination').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('convention_coordination').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Coordenadorias</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {stateId && (
            <div className="text-xs mb-2"><a className="underline" href="/admin/convencoes/nacionais">Nacional</a> &gt; <a className="underline" href={`/admin/convencoes/estaduais?stateId=${stateId}`}>Estadual</a> &gt; <span>Coordenadorias</span></div>
          )}
          {stateId && (
            <div className="grid grid-cols-3 gap-2">
              <div className="border p-2 rounded"><div className="text-xs">Total Coordenadorias</div><div className="text-lg font-semibold">{rows.length}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Tesouraria</div><div className="text-sm"><a className="underline" href="/tesouraria">acessar</a></div></div>
              <div className="border p-2 rounded"><div className="text-xs">Consolidação</div><div className="text-sm"><a className="underline" href={`/tesouraria/consolidacao?entity=CONVENCAO&rootId=${stateId}`}>ver gráfico</a></div></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Select value={stateId} onValueChange={setStateId}><SelectTrigger className="w-64"><SelectValue placeholder="Estadual" /></SelectTrigger><SelectContent>{states.map(s=>(<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Nome da Coordenadoria" value={name} onChange={(e)=>setName(e.target.value)} />
            <Button onClick={add}>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                <span className="text-xs">Estadual: {states.find(s=>s.id===r.state_id)?.name||''}</span>
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_convention_id||''} onChange={(e)=>update(r.id,{ finance_convention_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Convenção)</option>
                  {financeConvs.map((c:any)=>(<option key={c.id} value={c.id}>{c.name||c.id}</option>))}
                </select>
                <Button variant="secondary" onClick={()=>window.location.href='/tesouraria'}>Tesouraria</Button>
                <Button variant="secondary" onClick={()=>{ window.location.href = `/tesouraria/consolidacao?entity=CONVENCAO&rootId=${stateId}`; }}>Consolidar Estadual</Button>
                <Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const lines = ['level,id,name'];
                  rows.forEach((r:any)=>lines.push(`COORDENADORIA,${r.id},${r.name}`));
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hierarquia_conv_coord_${stateId}.csv`; a.click();
                }}>Exportar Hierarquia (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

