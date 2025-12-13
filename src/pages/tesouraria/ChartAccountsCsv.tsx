import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function ChartAccountsCsv() {
  const [entity, setEntity] = useState<'IGREJA'|'CONVENCAO'|'FACULDADE'>('IGREJA');
  const [entityId, setEntityId] = useState<string>("");
  const [entities, setEntities] = useState<any[]>([]);
  const [text, setText] = useState<string>("");
  useEffect(()=>{ (async()=>{ if (entity==='IGREJA'){ const { data } = await supabase.from('churches').select('id,nome_fantasia'); setEntities(data||[]);} if(entity==='CONVENCAO'){ const { data } = await supabase.from('conventions').select('id,name'); setEntities(data||[]);} if(entity==='FACULDADE'){ const { data } = await supabase.from('faculties').select('id,name'); setEntities(data||[]);} })(); },[entity]);
  const exportCsv = async () => {
    if (!entityId) return;
    const { data: accounts } = await supabase.from('chart_accounts').select('*').eq('entity', entity).eq('entity_id', entityId).order('code');
    const { data: maps } = await supabase.from('finance_type_account_map').select('*').eq('entity', entity).eq('entity_id', entityId);
    const lines: string[] = [];
    lines.push('type,code,name,nature');
    (accounts||[]).forEach((a:any)=>lines.push(`account,${a.code},${a.name},${a.nature}`));
    lines.push('type,finance_type_id,nature,account_code');
    (maps||[]).forEach((m:any)=>lines.push(`map,${m.finance_type_id},${m.nature},${m.account_code}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `plano_contas_${entityId}.csv`; a.click();
  };
  const importCsv = async (file: File | null) => {
    if (!file || !entityId) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      if (cols[0]==='account') {
        const [_, code, name, nature] = cols;
        const { data: exists } = await supabase.from('chart_accounts').select('id').eq('entity', entity).eq('entity_id', entityId).eq('code', code).limit(1);
        if (exists && exists[0]) await supabase.from('chart_accounts').update({ name, nature }).eq('id', exists[0].id);
        else await supabase.from('chart_accounts').insert({ entity, entity_id: entityId, code, name, nature });
      }
      if (cols[0]==='map') {
        const [_, finance_type_id, nature, account_code] = cols;
        const { data: exists } = await supabase.from('finance_type_account_map').select('id').eq('entity', entity).eq('entity_id', entityId).eq('finance_type_id', finance_type_id).eq('nature', nature).limit(1);
        if (exists && exists[0]) await supabase.from('finance_type_account_map').update({ account_code }).eq('id', exists[0].id);
        else await supabase.from('finance_type_account_map').insert({ finance_type_id, entity, entity_id: entityId, nature, account_code });
      }
    }
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Importar/Exportar Plano de Contas e Mapeamentos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={entity} onValueChange={(v:any)=>setEntity(v)}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IGREJA">Igreja</SelectItem><SelectItem value="CONVENCAO">Convenção</SelectItem><SelectItem value="FACULDADE">Faculdade</SelectItem></SelectContent></Select>
            <Select value={entityId} onValueChange={setEntityId}><SelectTrigger className="w-64"><SelectValue placeholder="Entidade" /></SelectTrigger><SelectContent>{entities.map((e:any)=>(<SelectItem key={e.id} value={e.id}>{e.nome_fantasia||e.name}</SelectItem>))}</SelectContent></Select>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportCsv} disabled={!entityId}>Exportar CSV</Button>
            <input type="file" accept=".csv" onChange={(e)=>importCsv(e.target.files?.[0]||null)} />
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

