import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function FinanceTypeMapping() {
  const [entity, setEntity] = useState<'IGREJA'|'CONVENCAO'|'FACULDADE'>('IGREJA');
  const [entityId, setEntityId] = useState<string>("");
  const [entities, setEntities] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [maps, setMaps] = useState<Record<string, any>>({});
  const loadEntities = async () => {
    if (entity === 'IGREJA') { const { data } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setEntities(data||[]); }
    if (entity === 'CONVENCAO') { const { data } = await supabase.from('conventions').select('id,name').order('name'); setEntities(data||[]); }
    if (entity === 'FACULDADE') { const { data } = await supabase.from('faculties').select('id,name').order('name'); setEntities(data||[]); }
  };
  const loadTypes = async () => {
    const { data } = await supabase.from('finance_types').select('*').eq('entity', entity);
    setTypes(data||[]);
  };
  const loadMaps = async () => {
    if (!entityId) { setMaps({}); return; }
    const { data } = await supabase.from('finance_type_account_map').select('*').eq('entity', entity).eq('entity_id', entityId);
    const m: Record<string, any> = {};
    (data||[]).forEach((r:any)=>{ m[`${r.finance_type_id}:${r.nature}`]=r; });
    setMaps(m);
  };
  useEffect(()=>{ loadEntities(); setEntityId(''); loadTypes(); }, [entity]);
  useEffect(()=>{ loadMaps(); }, [entityId]);
  const setMap = async (finance_type_id: string, nature: 'RECEITA'|'DESPESA', account_code: string) => {
    if (!entityId) return;
    const key = `${finance_type_id}:${nature}`;
    const existing = maps[key];
    if (existing) {
      await supabase.from('finance_type_account_map').update({ account_code }).eq('id', existing.id);
    } else {
      await supabase.from('finance_type_account_map').insert({ finance_type_id, entity, entity_id: entityId, nature, account_code });
    }
    loadMaps();
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Mapeamento Tipo Financeiro → Conta Contábil</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={entity} onValueChange={(v:any)=>setEntity(v)}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IGREJA">Igreja</SelectItem><SelectItem value="CONVENCAO">Convenção</SelectItem><SelectItem value="FACULDADE">Faculdade</SelectItem></SelectContent></Select>
            <Select value={entityId} onValueChange={setEntityId}><SelectTrigger className="w-64"><SelectValue placeholder="Entidade" /></SelectTrigger><SelectContent>{entities.map((e:any)=>(<SelectItem key={e.id} value={e.id}>{e.nome_fantasia||e.name}</SelectItem>))}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            {types.map((t:any)=>{
              const recv = maps[`${t.id}:RECEITA`]?.account_code || '';
              const exp = maps[`${t.id}:DESPESA`]?.account_code || '';
              return (
                <div key={t.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                  <div className="col-span-1 text-sm font-medium">{t.name}</div>
                  <Input placeholder="Conta Receita" value={recv} onChange={(e)=>setMap(t.id, 'RECEITA', e.target.value)} />
                  <span className="text-xs text-muted-foreground">RECEITA</span>
                  <Input placeholder="Conta Despesa" value={exp} onChange={(e)=>setMap(t.id, 'DESPESA', e.target.value)} />
                  <span className="text-xs text-muted-foreground">DESPESA</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

