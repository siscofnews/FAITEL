import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ExamsManage() {
  const [moduleId, setModuleId] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ num_questoes:10, peso_por_questao:1, tempo_minutos:30, tentativas_permitidas:1, nota_maxima:10, nota_aprovacao:7 });
  const loadModules = async()=>{ const { data } = await supabase.from('ead_modules').select('id,title').order('title'); setModules(data||[]); };
  const load = async()=>{ if (!moduleId) { setRows([]); return; } const { data } = await supabase.from('ead_exams').select('*').eq('module_id', moduleId).order('created_at'); setRows(data||[]); };
  useEffect(()=>{ loadModules(); },[]);
  useEffect(()=>{ load(); },[moduleId]);
  const add = async()=>{ if (!moduleId) return; await supabase.from('ead_exams').insert({ ...form, module_id: moduleId }); setForm({ num_questoes:10, peso_por_questao:1, tempo_minutos:30, tentativas_permitidas:1, nota_maxima:10, nota_aprovacao:7 }); load(); };
  const update = async(id:string, patch:any)=>{ await supabase.from('ead_exams').update(patch).eq('id', id); load(); };
  const remove = async(id:string)=>{ await supabase.from('ead_exams').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Gerenciar Provas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={moduleId} onChange={(e)=>setModuleId(e.target.value)}>
              <option value="">Selecione o Módulo</option>
              {modules.map((m:any)=>(<option key={m.id} value={m.id}>{m.title}</option>))}
            </select>
          </div>
          {!!moduleId && (
            <div className="grid grid-cols-6 gap-2 items-center">
              <Input type="number" placeholder="Questões" value={form.num_questoes} onChange={(e)=>setForm(prev=>({ ...prev, num_questoes:Number(e.target.value||10) }))} />
              <Input type="number" placeholder="Peso" value={form.peso_por_questao} onChange={(e)=>setForm(prev=>({ ...prev, peso_por_questao:Number(e.target.value||1) }))} />
              <Input type="number" placeholder="Tempo" value={form.tempo_minutos} onChange={(e)=>setForm(prev=>({ ...prev, tempo_minutos:Number(e.target.value||30) }))} />
              <Input type="number" placeholder="Tentativas" value={form.tentativas_permitidas} onChange={(e)=>setForm(prev=>({ ...prev, tentativas_permitidas:Number(e.target.value||1) }))} />
              <Input type="number" placeholder="Aprovação" value={form.nota_aprovacao} onChange={(e)=>setForm(prev=>({ ...prev, nota_aprovacao:Number(e.target.value||7) }))} />
              <Button onClick={add}>Adicionar Prova</Button>
            </div>
          )}
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-6 gap-2">
                <Input type="number" value={r.num_questoes||10} onChange={(e)=>update(r.id,{ num_questoes:Number(e.target.value||10) })} />
                <Input type="number" value={r.peso_por_questao||1} onChange={(e)=>update(r.id,{ peso_por_questao:Number(e.target.value||1) })} />
                <Input type="number" value={r.tempo_minutos||30} onChange={(e)=>update(r.id,{ tempo_minutos:Number(e.target.value||30) })} />
                <Input type="number" value={r.tentativas_permitidas||1} onChange={(e)=>update(r.id,{ tentativas_permitidas:Number(e.target.value||1) })} />
                <Input type="number" value={r.nota_aprovacao||7} onChange={(e)=>update(r.id,{ nota_aprovacao:Number(e.target.value||7) })} />
                <div className="flex items-center gap-2"><Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

