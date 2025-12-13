import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function ChartAccounts() {
  const [entity, setEntity] = useState<'IGREJA'|'CONVENCAO'|'FACULDADE'>('IGREJA');
  const [entityId, setEntityId] = useState<string>("");
  const [entities, setEntities] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', name: '', nature:'RECEITA' });
  const loadEntities = async () => {
    if (entity === 'IGREJA') { const { data } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setEntities(data||[]); }
    if (entity === 'CONVENCAO') { const { data } = await supabase.from('conventions').select('id,name').order('name'); setEntities(data||[]); }
    if (entity === 'FACULDADE') { const { data } = await supabase.from('faculties').select('id,name').order('name'); setEntities(data||[]); }
  };
  const loadRows = async () => { if (!entityId) return; const { data } = await supabase.from('chart_accounts').select('*').eq('entity', entity).eq('entity_id', entityId).order('code'); setRows(data||[]); };
  useEffect(()=>{ loadEntities(); setEntityId(''); }, [entity]);
  useEffect(()=>{ loadRows(); }, [entityId]);
  const add = async () => { if (!entityId || !form.code || !form.name) return; await supabase.from('chart_accounts').insert({ entity, entity_id: entityId, code: form.code, name: form.name, nature: form.nature }); setForm({ code:'', name:'', nature:'RECEITA' }); loadRows(); };
  const update = async (id: string, patch: any) => { await supabase.from('chart_accounts').update(patch).eq('id', id); loadRows(); };
  const remove = async (id: string) => { await supabase.from('chart_accounts').delete().eq('id', id); loadRows(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Plano de Contas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={entity} onValueChange={(v:any)=>setEntity(v)}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IGREJA">Igreja</SelectItem><SelectItem value="CONVENCAO">Convenção</SelectItem><SelectItem value="FACULDADE">Faculdade</SelectItem></SelectContent></Select>
            <Select value={entityId} onValueChange={setEntityId}><SelectTrigger className="w-64"><SelectValue placeholder="Entidade" /></SelectTrigger><SelectContent>{entities.map((e:any)=>(<SelectItem key={e.id} value={e.id}>{e.nome_fantasia||e.name}</SelectItem>))}</SelectContent></Select>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Código" value={form.code} onChange={(e)=>setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Nome" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
            <Select value={form.nature} onValueChange={(v:any)=>setForm({ ...form, nature:v })}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RECEITA">Receita</SelectItem><SelectItem value="DESPESA">Despesa</SelectItem><SelectItem value="ATIVO">Ativo</SelectItem><SelectItem value="PASSIVO">Passivo</SelectItem></SelectContent></Select>
            <Button onClick={add}>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {rows.map(r=>(
              <div key={r.id} className="border p-2 rounded grid grid-cols-6 gap-2">
                <Input value={r.code} onChange={(e)=>update(r.id, { code: e.target.value })} />
                <Input value={r.name} onChange={(e)=>update(r.id, { name: e.target.value })} />
                <Select value={r.nature} onValueChange={(v:any)=>update(r.id, { nature: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RECEITA">Receita</SelectItem><SelectItem value="DESPESA">Despesa</SelectItem><SelectItem value="ATIVO">Ativo</SelectItem><SelectItem value="PASSIVO">Passivo</SelectItem></SelectContent></Select>
                <span className="col-span-2 text-xs text-muted-foreground">{r.entity}</span>
                <Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

