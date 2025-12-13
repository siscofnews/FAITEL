import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function AccountingSpecManager() {
  const [entity, setEntity] = useState<'IGREJA'|'CONVENCAO'|'FACULDADE'>('IGREJA');
  const [entityId, setEntityId] = useState<string>("");
  const [entities, setEntities] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [section, setSection] = useState<'header'|'body'|'footer'>('body');
  const [errors, setErrors] = useState<string[]>([]);
  const knownFormats = ['TEXT','DECIMAL','NUM','HEX','DATE_DDMMYYYY'];
  useEffect(()=>{ (async()=>{ if (entity==='IGREJA'){ const { data } = await supabase.from('churches').select('id,nome_fantasia'); setEntities(data||[]);} if(entity==='CONVENCAO'){ const { data } = await supabase.from('conventions').select('id,name'); setEntities(data||[]);} if(entity==='FACULDADE'){ const { data } = await supabase.from('faculties').select('id,name'); setEntities(data||[]);} })(); },[entity]);
  const load = async () => { if (!entityId) return; const { data } = await supabase.from('accounting_specs').select('*').eq('entity', entity).eq('entity_id', entityId).eq('section', section).order('row_ord').order('ord'); setRows(data||[]); };
  useEffect(()=>{ load(); },[entityId]);
  useEffect(()=>{ validate(); },[rows, section]);
  const validate = () => {
    const errs: string[] = [];
    rows.forEach((r:any)=>{ if (!r.width || r.width <= 0) errs.push(`Largura inválida: ${r.column_name}`); });
    const key = (r:any)=>`${r.row_ord}:${r.ord}`;
    const seen = new Set<string>();
    rows.forEach((r:any)=>{ const k = key(r); if (seen.has(k)) errs.push(`Ordem duplicada em ${k}`); seen.add(k); });
    if (section==='body') {
      const names = rows.map((r:any)=>String(r.column_name).toUpperCase());
      ['CONTA','HISTORICO','DATA'].forEach(req=>{ if (!names.includes(req)) errs.push(`Campo obrigatório ausente: ${req}`); });
      if (!names.includes('DEBITO') && !names.includes('CREDITO') && !names.includes('VALOR')) errs.push('Defina DEBITO/CREDITO ou VALOR');
    }
    setErrors(errs);
  };
  const exportCsv = async () => {
    if (!entityId) return;
    const lines = ['section,row_ord,label,column_name,width,ord,format,description'];
    (rows||[]).forEach((r:any)=>lines.push(`${section},${r.row_ord||1},${r.label||''},${r.column_name},${r.width},${r.ord},${r.format||''},`));
    const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `especificacao_${entityId}.csv`; a.click();
  };
  const importCsv = async (file: File | null) => {
    if (!file || !entityId) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const pending: any[] = [];
    const errs: string[] = [];
    const pairSeen = new Set<string>();
    for (const line of lines.slice(1)) {
      const [sec, rowOrdStr, label, column_name, widthStr, ordStr, format] = line.split(',');
      const row_ord = Number(rowOrdStr||'1');
      const secVal = (sec as any)||section;
      if (!['header','body','footer'].includes(secVal)) { errs.push(`Seção inválida: ${sec}`); continue; }
      const width = Number(widthStr); const ord = Number(ordStr);
      if (!width || width<=0) errs.push(`Largura inválida: ${column_name}`);
      if (!ord || ord<=0) errs.push(`Ordem inválida: ${column_name}`);
      const fmtOk = (format||'').startsWith('CONST:') || knownFormats.includes(String(format||'').toUpperCase());
      if (!fmtOk) errs.push(`Formato desconhecido: ${format}`);
      const key = `${secVal}:${row_ord}:${ord}`;
      if (pairSeen.has(key)) errs.push(`Ordem duplicada: ${key}`);
      pairSeen.add(key);
      pending.push({ secVal, row_ord, label, column_name, width, ord, format });
    }
    const namesBody = pending.filter(p=>p.secVal==='body').map(p=>String(p.column_name).toUpperCase());
    ['CONTA','HISTORICO','DATA'].forEach(req=>{ if (!namesBody.includes(req)) errs.push(`Campo obrigatório ausente: ${req}`); });
    if (!namesBody.includes('DEBITO') && !namesBody.includes('CREDITO') && !namesBody.includes('VALOR')) errs.push('Defina DEBITO/CREDITO ou VALOR no body');
    setErrors(errs);
    if (errs.length) return;
    for (const p of pending) {
      const { data: ex } = await supabase.from('accounting_specs').select('id').eq('entity', entity).eq('entity_id', entityId).eq('section', p.secVal).eq('column_name', p.column_name).eq('row_ord', p.row_ord).limit(1);
      if (ex && ex[0]) await supabase.from('accounting_specs').update({ width: p.width, ord: p.ord, format: p.format, label: p.label, row_ord: p.row_ord }).eq('id', ex[0].id);
      else await supabase.from('accounting_specs').insert({ entity, entity_id: entityId, section: p.secVal, column_name: p.column_name, width: p.width, ord: p.ord, format: p.format, label: p.label, row_ord: p.row_ord });
    }
    load();
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Especificação Contábil (CSV)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={entity} onValueChange={(v:any)=>setEntity(v)}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IGREJA">Igreja</SelectItem><SelectItem value="CONVENCAO">Convenção</SelectItem><SelectItem value="FACULDADE">Faculdade</SelectItem></SelectContent></Select>
            <Select value={entityId} onValueChange={setEntityId}><SelectTrigger className="w-64"><SelectValue placeholder="Entidade" /></SelectTrigger><SelectContent>{entities.map((e:any)=>(<SelectItem key={e.id} value={e.id}>{e.nome_fantasia||e.name}</SelectItem>))}</SelectContent></Select>
            <Select value={section} onValueChange={(v:any)=>{ setSection(v); load(); }}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="header">Header</SelectItem><SelectItem value="body">Body</SelectItem><SelectItem value="footer">Footer</SelectItem></SelectContent></Select>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportCsv} disabled={!entityId}>Exportar CSV</Button>
            <input type="file" accept=".csv" onChange={(e)=>importCsv(e.target.files?.[0]||null)} />
            <a href="/docs/especificacao_contabil.csv" target="_blank" rel="noreferrer" className="underline text-sm">Baixar modelo</a>
          </div>
          <div className="space-y-2">
            {rows.map(r=>(<div key={r.id} className="border p-2 rounded grid grid-cols-6 gap-2"><span className="col-span-2">{r.row_ord}.{r.ord} {r.column_name}</span><span>{r.width}</span><span>{r.format}</span><span className="col-span-2 text-xs text-muted-foreground">{r.label||''}</span></div>))}
            <div className="text-sm">{errors.length ? `${errors.length} problemas: ${errors.join('; ')}` : 'Especificação válida'}</div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

