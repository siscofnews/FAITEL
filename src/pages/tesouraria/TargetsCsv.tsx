import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function TargetsCsv() {
  const [entity, setEntity] = useState<'IGREJA'|'CONVENCAO'|'FACULDADE'>('IGREJA');
  const [entityId, setEntityId] = useState<string>("");
  const [entities, setEntities] = useState<any[]>([]);
  const [nature, setNature] = useState<'RECEITA'|'DESPESA'>('RECEITA');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  useEffect(()=>{ (async()=>{ if (entity==='IGREJA'){ const { data } = await supabase.from('churches').select('id,nome_fantasia'); setEntities(data||[]);} if(entity==='CONVENCAO'){ const { data } = await supabase.from('conventions').select('id,name'); setEntities(data||[]);} if(entity==='FACULDADE'){ const { data } = await supabase.from('faculties').select('id,name'); setEntities(data||[]);} })(); },[entity]);
  const exportCsv = async () => {
    if (!entityId) return;
    const { data } = await supabase.from('monthly_targets').select('*').eq('entity', entity).eq('entity_id', entityId).eq('nature', nature).eq('year', year);
    const lines: string[] = ['cost_center_id,month,target_amount'];
    (data||[]).forEach((t:any)=>lines.push(`${t.cost_center_id||''},${t.month},${Number(t.target_amount||0).toFixed(2)}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `metas_${entityId}_${nature}_${year}.csv`; a.click();
  };
  const importCsv = async (file: File | null) => {
    if (!file || !entityId) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    for (const line of lines.slice(1)) {
      const [cost_center_id, monthStr, targetStr] = line.split(',');
      const month = Number(monthStr);
      const target_amount = Number(targetStr);
      const { data: exists } = await supabase.from('monthly_targets').select('id').eq('entity', entity).eq('entity_id', entityId).eq('cost_center_id', cost_center_id||null).eq('nature', nature).eq('year', year).eq('month', month).limit(1);
      if (exists && exists[0]) await supabase.from('monthly_targets').update({ target_amount }).eq('id', exists[0].id);
      else await supabase.from('monthly_targets').insert({ entity, entity_id: entityId, cost_center_id: cost_center_id||null, nature, year, month, target_amount });
    }
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Importar/Exportar Metas Mensais</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={entity} onValueChange={(v:any)=>setEntity(v)}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IGREJA">Igreja</SelectItem><SelectItem value="CONVENCAO">Convenção</SelectItem><SelectItem value="FACULDADE">Faculdade</SelectItem></SelectContent></Select>
            <Select value={entityId} onValueChange={setEntityId}><SelectTrigger className="w-64"><SelectValue placeholder="Entidade" /></SelectTrigger><SelectContent>{entities.map((e:any)=>(<SelectItem key={e.id} value={e.id}>{e.nome_fantasia||e.name}</SelectItem>))}</SelectContent></Select>
            <Select value={nature} onValueChange={(v:any)=>setNature(v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RECEITA">Receita</SelectItem><SelectItem value="DESPESA">Despesa</SelectItem></SelectContent></Select>
            <Select value={String(year)} onValueChange={(v:any)=>setYear(Number(v))}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{[year-1,year,year+1].map(y=>(<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent></Select>
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

