import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function QuestionsBank() {
  const [facultyId, setFacultyId] = useState<string>("");
  const [faculties, setFaculties] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ area:"", disciplina:"", nivel:"basico", tipo:"multipla_escolha", enunciado:"", opcoes:"", resposta:"" });
  const loadFacs = async()=>{ const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setFaculties(data||[]); };
  const load = async()=>{ if (!facultyId) { setRows([]); return; } const { data } = await supabase.from('ead_questions').select('*').eq('faculty_id', facultyId).order('created_at'); setRows(data||[]); };
  useEffect(()=>{ loadFacs(); },[]);
  useEffect(()=>{ load(); },[facultyId]);
  const add = async()=>{ if (!facultyId || !form.enunciado) return; await supabase.from('ead_questions').insert({ faculty_id: facultyId, area: form.area, disciplina: form.disciplina, nivel: form.nivel, tipo: form.tipo, enunciado: form.enunciado, opcoes: form.opcoes? JSON.parse(form.opcoes): null, resposta: form.resposta? JSON.parse(form.resposta): null }); setForm({ area:"", disciplina:"", nivel:"basico", tipo:"multipla_escolha", enunciado:"", opcoes:"", resposta:"" }); load(); };
  const update = async(id:string, patch:any)=>{ await supabase.from('ead_questions').update(patch).eq('id', id); load(); };
  const remove = async(id:string)=>{ await supabase.from('ead_questions').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Banco de Questões</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={facultyId} onChange={(e)=>setFacultyId(e.target.value)}>
              <option value="">Selecione a Matriz EAD</option>
              {faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name}</option>))}
            </select>
          </div>
          {!!facultyId && (
            <div className="grid grid-cols-5 gap-2 items-center">
              <Input placeholder="Área" value={form.area} onChange={(e)=>setForm(prev=>({ ...prev, area:e.target.value }))} />
              <Input placeholder="Disciplina" value={form.disciplina} onChange={(e)=>setForm(prev=>({ ...prev, disciplina:e.target.value }))} />
              <select className="border rounded px-2 py-1" value={form.nivel} onChange={(e)=>setForm(prev=>({ ...prev, nivel:e.target.value }))}>
                <option value="basico">Básico</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
              <select className="border rounded px-2 py-1" value={form.tipo} onChange={(e)=>setForm(prev=>({ ...prev, tipo:e.target.value }))}>
                <option value="multipla_escolha">Múltipla Escolha</option>
                <option value="verdadeiro_falso">Verdadeiro/Falso</option>
                <option value="alternativa_unica">Alternativa Única</option>
                <option value="alternativa_multipla">Alternativa Múltipla</option>
                <option value="discursiva">Discursiva</option>
              </select>
              <Button onClick={add}>Adicionar Questão</Button>
            </div>
          )}
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-6 gap-2">
                <Input value={r.area||''} onChange={(e)=>update(r.id,{ area:e.target.value })} />
                <Input value={r.disciplina||''} onChange={(e)=>update(r.id,{ disciplina:e.target.value })} />
                <select className="border rounded px-2 py-1" value={r.nivel} onChange={(e)=>update(r.id,{ nivel:e.target.value })}>
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
                <select className="border rounded px-2 py-1" value={r.tipo} onChange={(e)=>update(r.id,{ tipo:e.target.value })}>
                  <option value="multipla_escolha">Múltipla Escolha</option>
                  <option value="verdadeiro_falso">Verdadeiro/Falso</option>
                  <option value="alternativa_unica">Alternativa Única</option>
                  <option value="alternativa_multipla">Alternativa Múltipla</option>
                  <option value="discursiva">Discursiva</option>
                </select>
                <Input value={r.enunciado||''} onChange={(e)=>update(r.id,{ enunciado:e.target.value })} />
                <div className="flex items-center gap-2"><Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

