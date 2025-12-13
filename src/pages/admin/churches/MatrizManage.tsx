import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function MatrizManage() {
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [deep, setDeep] = useState<Record<string, { subs:number, congs:number }>>({});
  const [fin, setFin] = useState<Record<string, { entries:number, expenses:number, balance:number }>>({});
  const [financeChurches, setFinanceChurches] = useState<any[]>([]);
  const [form, setForm] = useState({ name:'', pastor:'', address:'', phone:'' });
  const load = async () => {
    const { data } = await supabase.from('church_matriz').select('*').order('name');
    setRows(data||[]);
    const { data: sedes } = await supabase.from('church_sede').select('id,matriz_id');
    const { data: subs } = await supabase.from('church_subsede').select('id,sede_id');
    const { data: congs } = await supabase.from('church_congregation').select('id,subsede_id');
    const c: Record<string, number> = {};
    (sedes||[]).forEach((s:any)=>{ c[s.matriz_id] = (c[s.matriz_id]||0)+1 });
    setCounts(c);
    const sdById = new Map((sedes||[]).map((s:any)=>[s.id, s]));
    const aggSubs: Record<string, number> = {};
    (subs||[]).forEach((sb:any)=>{ const sd = sdById.get(sb.sede_id); if (sd) aggSubs[sd.matriz_id] = (aggSubs[sd.matriz_id]||0)+1 });
    const sbById = new Map((subs||[]).map((sb:any)=>[sb.id, sb]));
    const aggCong: Record<string, number> = {};
    (congs||[]).forEach((cg:any)=>{ const sb = sbById.get(cg.subsede_id); const sd = sb ? sdById.get(sb.sede_id) : null; if (sd) aggCong[sd.matriz_id] = (aggCong[sd.matriz_id]||0)+1 });
    const d: Record<string, { subs:number, congs:number }> = {};
    Object.keys(c).forEach(k=>{ d[k] = { subs: aggSubs[k]||0, congs: aggCong[k]||0 } });
    setDeep(d);
    const mappedIds = (data||[]).map((m:any)=>m.finance_church_id).filter(Boolean);
    if (mappedIds.length) {
      const { data: e } = await supabase.from('church_entries').select('amount,church_id');
      const { data: x } = await supabase.from('church_expenses').select('total_value,church_id');
      const dfin: Record<string, { entries:number, expenses:number, balance:number }> = {};
      (data||[]).forEach((m:any)=>{
        const cid = m.finance_church_id; if (!cid) return; const ent = (e||[]).filter((r:any)=>r.church_id===cid).reduce((s:number,r:any)=>s+Number(r.amount||0),0); const exp = (x||[]).filter((r:any)=>r.church_id===cid).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); dfin[m.id] = { entries: ent, expenses: exp, balance: ent-exp };
      });
      setFin(dfin);
    } else setFin({});
    const { data: chs } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia');
    setFinanceChurches(chs||[]);
  };
  useEffect(()=>{ load(); },[]);
  const add = async () => { if (!form.name) return; await supabase.from('church_matriz').insert(form); setForm({ name:'', pastor:'', address:'', phone:'' }); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('church_matriz').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('church_matriz').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Igrejas Matriz</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-4 gap-2">
            <Input placeholder="Nome" value={form.name} onChange={(e)=>setForm({ ...form, name:e.target.value })} />
            <Input placeholder="Pastor" value={form.pastor} onChange={(e)=>setForm({ ...form, pastor:e.target.value })} />
            <Input placeholder="Endereço" value={form.address} onChange={(e)=>setForm({ ...form, address:e.target.value })} />
            <Input placeholder="Telefone" value={form.phone} onChange={(e)=>setForm({ ...form, phone:e.target.value })} />
          </div>
          <Button onClick={add}>Adicionar</Button>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid md:grid-cols-5 gap-2">
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <Input value={r.pastor||''} onChange={(e)=>update(r.id,{ pastor:e.target.value })} />
                <Input value={r.address||''} onChange={(e)=>update(r.id,{ address:e.target.value })} />
                <Input value={r.phone||''} onChange={(e)=>update(r.id,{ phone:e.target.value })} />
                <div className="flex items-center gap-2">
                  <select className="border rounded px-2 py-1 text-xs" value={r.finance_church_id||''} onChange={(e)=>update(r.id,{ finance_church_id: e.target.value })}>
                    <option value="">Vínculo Financeiro (Igreja)</option>
                    {financeChurches.map((c:any)=>(<option key={c.id} value={c.id}>{c.nome_fantasia||c.id}</option>))}
                  </select>
                  <span className="text-xs text-muted-foreground">Sedes: {counts[r.id]||0} • Subsedes: {deep[r.id]?.subs||0} • Congregações: {deep[r.id]?.congs||0}</span>
                  <span className="text-xs">{fin[r.id]?`Entradas ${fin[r.id].entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • Despesas ${fin[r.id].expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • Saldo ${fin[r.id].balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`:'Sem vínculo financeiro'}</span>
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/tendencias?churchId=${r.id}`}>Tesouraria</Button>
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/relatorios?churchId=${r.id}`}>Relatórios Mensais</Button>
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/export?churchId=${r.id}`}>Exportar Contábil</Button>
                  <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=IGREJA&rootId=${r.id}`}>Consolidação</Button>
                  <Button variant="outline" onClick={()=>{ if ((counts[r.id]||0)>0) return alert('Exclua as sedes antes.'); remove(r.id); }}>Excluir</Button>
                </div>
          <div>
            <Button variant="outline" onClick={async()=>{
              const { data: sedes } = await supabase.from('church_sede').select('id,name,matriz_id');
              const { data: subs } = await supabase.from('church_subsede').select('id,name,sede_id');
              const { data: congs } = await supabase.from('church_congregation').select('id,name,subsede_id');
              const lines = ['system,level,id,name,parent_level,parent_id,parent_name'];
              (data||[]).forEach((m:any)=>lines.push(`IGREJA,MATRIZ,${m.id},${m.name},,,`));
              (sedes||[]).forEach((s:any)=>{ const parent = (data||[]).find((m:any)=>m.id===s.matriz_id); lines.push(`IGREJA,SEDE,${s.id},${s.name},MATRIZ,${parent?.id||''},${parent?.name||''}`) });
              (subs||[]).forEach((sb:any)=>{ const parent = (sedes||[]).find((s:any)=>s.id===sb.sede_id); lines.push(`IGREJA,SUBSEDE,${sb.id},${sb.name},SEDE,${parent?.id||''},${parent?.name||''}`) });
              (congs||[]).forEach((cg:any)=>{ const parent = (subs||[]).find((sb:any)=>sb.id===cg.subsede_id); lines.push(`IGREJA,CONGREGACAO,${cg.id},${cg.name},SUBSEDE,${parent?.id||''},${parent?.name||''}`) });
              const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `arvore_igrejas.csv`; a.click();
            }}>Exportar Árvore Completa (CSV)</Button>
          </div>
              </div>
            ))}
            {rows.length>0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={async()=>{
                  const { data: sedes } = await supabase.from('church_sede').select('id,name,matriz_id,finance_church_id');
                  const { data: subs } = await supabase.from('church_subsede').select('id,name,sede_id,finance_church_id');
                  const { data: congs } = await supabase.from('church_congregation').select('id,name,subsede_id,finance_church_id');
                  const { data: e } = await supabase.from('church_entries').select('amount,church_id');
                  const { data: x } = await supabase.from('church_expenses').select('total_value,church_id');
                  const calc = (fid:any) => { const ent = (e||[]).filter((r:any)=>r.church_id===fid).reduce((s:number,r:any)=>s+Number(r.amount||0),0); const exp = (x||[]).filter((r:any)=>r.church_id===fid).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); return { ent, exp, bal: ent-exp } };
                  const lines = ['system,level,id,name,parent_level,parent_id,parent_name,finance_id,entries,expenses,balance'];
                  (rows||[]).forEach((m:any)=>{ const f = m.finance_church_id ? calc(m.finance_church_id) : { ent:0,exp:0,bal:0 }; lines.push(`IGREJA,MATRIZ,${m.id},${m.name},,,${m.finance_church_id||''},${f.ent},${f.exp},${f.bal}`) });
                  (sedes||[]).forEach((s:any)=>{ const parent = (rows||[]).find((m:any)=>m.id===s.matriz_id); const f = s.finance_church_id ? calc(s.finance_church_id) : { ent:0,exp:0,bal:0 }; lines.push(`IGREJA,SEDE,${s.id},${s.name},MATRIZ,${parent?.id||''},${parent?.name||''},${s.finance_church_id||''},${f.ent},${f.exp},${f.bal}`) });
                  (subs||[]).forEach((sb:any)=>{ const parent = (sedes||[]).find((s:any)=>s.id===sb.sede_id); const f = sb.finance_church_id ? calc(sb.finance_church_id) : { ent:0,exp:0,bal:0 }; lines.push(`IGREJA,SUBSEDE,${sb.id},${sb.name},SEDE,${parent?.id||''},${parent?.name||''},${sb.finance_church_id||''},${f.ent},${f.exp},${f.bal}`) });
                  (congs||[]).forEach((cg:any)=>{ const parent = (subs||[]).find((sb:any)=>sb.id===cg.subsede_id); const f = cg.finance_church_id ? calc(cg.finance_church_id) : { ent:0,exp:0,bal:0 }; lines.push(`IGREJA,CONGREGACAO,${cg.id},${cg.name},SUBSEDE,${parent?.id||''},${parent?.name||''},${cg.finance_church_id||''},${f.ent},${f.exp},${f.bal}`) });
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `arvore_igrejas_financeiro.csv`; a.click();
                }}>Export Financeiro por Árvore (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

