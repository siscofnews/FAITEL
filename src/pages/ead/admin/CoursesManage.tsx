import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function CoursesManage() {
  const [facultyId, setFacultyId] = useState<string>("");
  const [faculties, setFaculties] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ name:"", description:"", carga_horaria:0, categoria:"teologico", valor:0, forma_pagamento:"" });
  const loadFacs = async()=>{ const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setFaculties(data||[]); };
  const load = async()=>{ if (!facultyId) { setRows([]); return; } const { data } = await supabase.from('ead_courses').select('*').eq('faculty_id', facultyId).order('created_at'); setRows(data||[]); };
  useEffect(()=>{ loadFacs(); },[]);
  useEffect(()=>{ load(); },[facultyId]);
  const add = async()=>{ if (!facultyId || !form.name) return; await supabase.from('ead_courses').insert({ ...form, faculty_id: facultyId }); setForm({ name:"", description:"", carga_horaria:0, categoria:"teologico", valor:0, forma_pagamento:"" }); load(); };
  const update = async(id:string, patch:any)=>{ await supabase.from('ead_courses').update(patch).eq('id', id); load(); };
  const remove = async(id:string)=>{ await supabase.from('ead_courses').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Gerenciar Cursos EAD</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={facultyId} onChange={(e)=>setFacultyId(e.target.value)}>
              <option value="">Selecione a Matriz EAD</option>
              {faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name}</option>))}
            </select>
          </div>
          {!!facultyId && (
            <div className="grid grid-cols-5 gap-2 items-center">
              <Input placeholder="Nome" value={form.name} onChange={(e)=>setForm(prev=>({ ...prev, name:e.target.value }))} />
              <Input placeholder="Descrição" value={form.description} onChange={(e)=>setForm(prev=>({ ...prev, description:e.target.value }))} />
              <Input placeholder="Carga Horária" type="number" value={form.carga_horaria} onChange={(e)=>setForm(prev=>({ ...prev, carga_horaria:Number(e.target.value||0) }))} />
              <select className="border rounded px-2 py-1" value={form.categoria} onChange={(e)=>setForm(prev=>({ ...prev, categoria:e.target.value }))}>
                <option value="teologico">Teológico</option>
                <option value="academico">Acadêmico</option>
                <option value="livre">Livre</option>
                <option value="extensao">Extensão</option>
              </select>
              <Button onClick={add}>Adicionar Curso</Button>
            </div>
          )}
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-6 gap-2">
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <Input value={r.description||''} onChange={(e)=>update(r.id,{ description:e.target.value })} />
                <Input type="number" value={r.carga_horaria||0} onChange={(e)=>update(r.id,{ carga_horaria:Number(e.target.value||0) })} />
                <select className="border rounded px-2 py-1" value={r.categoria||'teologico'} onChange={(e)=>update(r.id,{ categoria:e.target.value })}>
                  <option value="teologico">Teológico</option>
                  <option value="academico">Acadêmico</option>
                  <option value="livre">Livre</option>
                  <option value="extensao">Extensão</option>
                </select>
                <Input type="number" value={r.valor||0} onChange={(e)=>update(r.id,{ valor:Number(e.target.value||0) })} />
                <div className="flex items-center gap-2"><Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

