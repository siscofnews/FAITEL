import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function StateManage() {
  const [nats, setNats] = useState<any[]>([]);
  const [natId, setNatId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [financeConvs, setFinanceConvs] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const loadNats = async () => { const { data } = await supabase.from('convention_national').select('id,name').order('name'); setNats(data||[]); };
  const load = async () => { if (!natId) return; const { data } = await supabase.from('convention_state').select('*').eq('national_id', natId).order('name'); setRows(data||[]); const { data: coords } = await supabase.from('convention_coordination').select('id,state_id'); const c: Record<string, number> = {}; (coords||[]).forEach((s:any)=>{ c[s.state_id] = (c[s.state_id]||0)+1 }); setCounts(c); };
  useEffect(()=>{ loadNats(); },[]);
  useEffect(()=>{ load(); },[natId]);
  useEffect(()=>{ (async()=>{ const { data: convs } = await supabase.from('conventions').select('id,name').order('name'); setFinanceConvs(convs||[]); })(); },[]);
  const add = async () => { if (!natId || !name) return; await supabase.from('convention_state').insert({ national_id: natId, name }); setName(''); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('convention_state').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('convention_state').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Convenções Estaduais</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {natId && (
            <div className="text-xs mb-2"><a className="underline" href="/admin/convencoes/nacionais">Nacional</a> &gt; <span>{nats.find(n=>n.id===natId)?.name||''}</span> &gt; <span>Estaduais</span></div>
          )}
          {natId && (
            <div className="grid grid-cols-3 gap-2">
              <div className="border p-2 rounded"><div className="text-xs">Total Estaduais</div><div className="text-lg font-semibold">{rows.length}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Coord. agregadas</div><div className="text-lg font-semibold">{Object.values(counts).reduce((s,n)=>s+n,0)}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Saldo Consolidado</div><div className="text-sm"><a className="underline" href={`/tesouraria/consolidacao?entity=CONVENCAO&rootId=${natId}`}>ver gráfico</a></div></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Select value={natId} onValueChange={setNatId}><SelectTrigger className="w-64"><SelectValue placeholder="Conv. Nacional" /></SelectTrigger><SelectContent>{nats.map(n=>(<SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Nome da Estadual" value={name} onChange={(e)=>setName(e.target.value)} />
            <Button onClick={add}>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                <span className="text-xs">Nacional: {nats.find(n=>n.id===r.national_id)?.name||''}</span>
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_convention_id||''} onChange={(e)=>update(r.id,{ finance_convention_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Convenção)</option>
                  {financeConvs.map((c:any)=>(<option key={c.id} value={c.id}>{c.name||c.id}</option>))}
                </select>
                <span className="text-xs">Coord.: {counts[r.id]||0}</span>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=CONVENCAO&rootId=${natId}`}>Consolidar Nacional</Button>
                <Button variant="outline" onClick={()=>{ if ((counts[r.id]||0)>0) return alert('Exclua as coordenadorias antes.'); remove(r.id); }}>Excluir</Button>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const lines = ['level,id,name,coordenadorias'];
                  rows.forEach((r:any)=>lines.push(`ESTADUAL,${r.id},${r.name},${counts[r.id]||0}`));
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hierarquia_conv_estaduais_${natId}.csv`; a.click();
                }}>Exportar Hierarquia (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

