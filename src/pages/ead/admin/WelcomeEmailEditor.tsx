import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WelcomeEmailEditor() {
  const [scope, setScope] = useState<'GLOBAL'|'COURSE'|'POLO'|'NUCLEO'>('GLOBAL');
  const [targetId, setTargetId] = useState<string>('');
  const [subject, setSubject] = useState<string>('Bem-vindo(a) ao curso');
  const [template, setTemplate] = useState<string>('Olá {{student_name}},\n\nSeja bem-vindo(a)!\n\nAssinado,\nChanceler Valdinei da Conceição Santos');
  const load = async () => {
    try {
      const { data } = await supabase.from('welcome_email_templates' as any).select('*').eq('target_type', scope).eq('target_id', scope==='GLOBAL'?null:targetId).maybeSingle();
      if (data) { setSubject(data.subject||subject); setTemplate(data.template||template); }
      else {
        const key = 'welcome_templates';
        try { const local = JSON.parse(localStorage.getItem(key)||'{}'); const k = scope==='GLOBAL'?'GLOBAL':`${scope}:${targetId}`; if (local[k]) { setSubject(local[k].subject||subject); setTemplate(local[k].template||template); } } catch {}
      }
    } catch {}
  };
  useEffect(()=>{ load(); },[scope, targetId]);
  const save = async () => {
    try {
      const payload = { target_type: scope, target_id: scope==='GLOBAL'?null:targetId, subject, template } as any;
      const { error } = await supabase.from('welcome_email_templates' as any).upsert(payload, { onConflict: 'target_type,target_id' });
      if (error) throw error;
    } catch {
      const key = 'welcome_templates';
      try { const local = JSON.parse(localStorage.getItem(key)||'{}'); const k = scope==='GLOBAL'?'GLOBAL':`${scope}:${targetId}`; local[k] = { subject, template }; localStorage.setItem(key, JSON.stringify(local)); } catch {}
    }
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Mensagem de Boas‑Vindas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Escopo</Label>
              <select className="border rounded px-2 py-2" value={scope} onChange={(e)=>setScope(e.target.value as any)}>
                <option value="GLOBAL">Global</option>
                <option value="COURSE">Curso</option>
                <option value="POLO">Polo</option>
                <option value="NUCLEO">Núcleo</option>
              </select>
            </div>
            {scope!=='GLOBAL' && (
              <div className="space-y-2">
                <Label>ID de destino</Label>
                <Input value={targetId} onChange={(e)=>setTargetId(e.target.value)} placeholder="ID" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input value={subject} onChange={(e)=>setSubject(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <textarea className="w-full h-48 border rounded p-2" value={template} onChange={(e)=>setTemplate(e.target.value)} />
            <div className="text-xs text-muted-foreground">Placeholders: {{student_name}}, {{course_name}}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>Salvar</Button>
            <Button variant="outline" onClick={load}>Recarregar</Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

