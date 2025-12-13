import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function NationalManage() {
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [deep, setDeep] = useState<Record<string, number>>({});
  const [fin, setFin] = useState<Record<string, { entries:number, expenses:number, balance:number }>>({});
  const [financeConvs, setFinanceConvs] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const load = async () => {
    const { data } = await supabase.from('convention_national').select('*').order('name');
    setRows(data||[]);
    const { data: states } = await supabase.from('convention_state').select('id,national_id');
    const { data: coords } = await supabase.from('convention_coordination').select('id,state_id');
    const c: Record<string, number> = {};
    (states||[]).forEach((s:any)=>{ c[s.national_id] = (c[s.national_id]||0)+1 });
    setCounts(c);
    const stById = new Map((states||[]).map((s:any)=>[s.id, s]));
    const aggCoord: Record<string, number> = {};
    (coords||[]).forEach((co:any)=>{ const st = stById.get(co.state_id); if (st) aggCoord[st.national_id] = (aggCoord[st.national_id]||0)+1 });
    setDeep(aggCoord);
    const mappedIds = (data||[]).map((n:any)=>n.finance_convention_id).filter(Boolean);
    if (mappedIds.length) {
      const { data: e } = await supabase.from('convention_entries').select('amount,convention_id');
      const { data: x } = await supabase.from('convention_expenses').select('total_value,convention_id');
      const dfin: Record<string, { entries:number, expenses:number, balance:number }> = {};
      (data||[]).forEach((n:any)=>{
        const cid = n.finance_convention_id; if (!cid) return; const ent = (e||[]).filter((r:any)=>r.convention_id===cid).reduce((s:number,r:any)=>s+Number(r.amount||0),0); const exp = (x||[]).filter((r:any)=>r.convention_id===cid).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); dfin[n.id] = { entries: ent, expenses: exp, balance: ent-exp };
      });
      setFin(dfin);
    } else setFin({});
    const { data: convs } = await supabase.from('conventions').select('id,name').order('name');
    setFinanceConvs(convs||[]);
  };
  useEffect(()=>{ load(); },[]);
  const add = async () => { if (!name) return; await supabase.from('convention_national').insert({ name }); setName(''); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('convention_national').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('convention_national').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Convenções Nacionais</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="border p-2 rounded"><div className="text-xs">Total Nacionais</div><div className="text-lg font-semibold">{rows.length}</div></div>
            <div className="border p-2 rounded"><div className="text-xs">Total Estaduais</div><div className="text-lg font-semibold">{Object.values(counts).reduce((s,n)=>s+n,0)}</div></div>
            <div className="border p-2 rounded"><div className="text-xs">Coord. agregadas</div><div className="text-lg font-semibold">{Object.values(deep).reduce((s,n)=>s+n,0)}</div></div>
          </div>
          <div className="flex items-center gap-2"><Input placeholder="Nome" value={name} onChange={(e)=>setName(e.target.value)} /><Button onClick={add}>Adicionar</Button></div>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_convention_id||''} onChange={(e)=>update(r.id,{ finance_convention_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Convenção)</option>
                  {financeConvs.map((c:any)=>(<option key={c.id} value={c.id}>{c.name||c.id}</option>))}
                </select>
                <span className="text-xs">Estaduais: {counts[r.id]||0} • Coordenadorias: {deep[r.id]||0}</span>
                <span className="text-xs">{fin[r.id]?`Entradas ${fin[r.id].entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • Despesas ${fin[r.id].expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • Saldo ${fin[r.id].balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`:'Sem vínculo financeiro'}</span>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=CONVENCAO&rootId=${r.id}`}>Consolidação</Button>
                <Button variant="secondary" onClick={()=>window.location.href='/tesouraria'}>Tesouraria</Button>
                <Button variant="outline" onClick={()=>{ if ((counts[r.id]||0)>0) return alert('Exclua as estaduais antes.'); remove(r.id); }}>Excluir</Button>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const { data: states } = await supabase.from('convention_state').select('id,name,national_id');
                  const { data: coords } = await supabase.from('convention_coordination').select('id,name,state_id');
                  const lines = ['system,level,id,name,parent_level,parent_id,parent_name'];
                  (rows||[]).forEach((n:any)=>lines.push(`CONVENCAO,NACIONAL,${n.id},${n.name},,,`));
                  (states||[]).forEach((s:any)=>{ const parent = (rows||[]).find((n:any)=>n.id===s.national_id); lines.push(`CONVENCAO,ESTADUAL,${s.id},${s.name},NACIONAL,${parent?.id||''},${parent?.name||''}`) });
                  (coords||[]).forEach((c:any)=>{ const parent = (states||[]).find((s:any)=>s.id===c.state_id); lines.push(`CONVENCAO,COORDENACAO,${c.id},${c.name},ESTADUAL,${parent?.id||''},${parent?.name||''}`) });
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hierarquia_conv_nacionais.csv`; a.click();
                }}>Exportar Hierarquia (CSV)</Button>
                <Button variant="outline" onClick={async()=>{
                  const { data: states } = await supabase.from('convention_state').select('id,name,national_id,finance_convention_id');
                  const { data: coords } = await supabase.from('convention_coordination').select('id,name,state_id,finance_convention_id');
                  const { data: e } = await supabase.from('convention_entries').select('amount,convention_id');
                  const { data: x } = await supabase.from('convention_expenses').select('total_value,convention_id');
                  const calc = (fid:any) => { const ent = (e||[]).filter((r:any)=>r.convention_id===fid).reduce((s:number,r:any)=>s+Number(r.amount||0),0); const exp = (x||[]).filter((r:any)=>r.convention_id===fid).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); return { ent, exp, bal: ent-exp } };
                  const lines = ['system,level,id,name,parent_level,parent_id,parent_name,finance_id,entries,expenses,balance'];
                  (rows||[]).forEach((n:any)=>{ const f = n.finance_convention_id ? calc(n.finance_convention_id) : { ent:0,exp:0,bal:0 }; lines.push(`CONVENCAO,NACIONAL,${n.id},${n.name},,,${n.finance_convention_id||''},${f.ent},${f.exp},${f.bal}`) });
                  (states||[]).forEach((s:any)=>{ const parent = (rows||[]).find((n:any)=>n.id===s.national_id); const f = s.finance_convention_id ? calc(s.finance_convention_id) : { ent:0,exp:0,bal:0 }; lines.push(`CONVENCAO,ESTADUAL,${s.id},${s.name},NACIONAL,${parent?.id||''},${parent?.name||''},${s.finance_convention_id||''},${f.ent},${f.exp},${f.bal}`) });
                  (coords||[]).forEach((c:any)=>{ const parent = (states||[]).find((s:any)=>s.id===c.state_id); const f = c.finance_convention_id ? calc(c.finance_convention_id) : { ent:0,exp:0,bal:0 }; lines.push(`CONVENCAO,COORDENACAO,${c.id},${c.name},ESTADUAL,${parent?.id||''},${parent?.name||''},${c.finance_convention_id||''},${f.ent},${f.exp},${f.bal}`) });
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `arvore_conv_financeiro.csv`; a.click();
                }}>Export Financeiro por Árvore (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

