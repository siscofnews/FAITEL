import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ModulesManage() {
  const [courseId, setCourseId] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ index_order:1, title:"", content_url:"", video_url:"" });
  const loadCourses = async()=>{ const { data } = await supabase.from('ead_courses').select('id,name').order('name'); setCourses(data||[]); };
  const load = async()=>{ if (!courseId) { setRows([]); return; } const { data } = await supabase.from('ead_modules').select('*').eq('course_id', courseId).order('index_order'); setRows(data||[]); };
  useEffect(()=>{ loadCourses(); },[]);
  useEffect(()=>{ load(); },[courseId]);
  const add = async()=>{ if (!courseId || !form.title) return; await supabase.from('ead_modules').insert({ ...form, course_id: courseId }); setForm({ index_order:1, title:"", content_url:"", video_url:"" }); load(); };
  const update = async(id:string, patch:any)=>{ await supabase.from('ead_modules').update(patch).eq('id', id); load(); };
  const remove = async(id:string)=>{ await supabase.from('ead_modules').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Gerenciar Módulos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={courseId} onChange={(e)=>setCourseId(e.target.value)}>
              <option value="">Selecione o Curso</option>
              {courses.map((c:any)=>(<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          {!!courseId && (
            <div className="grid grid-cols-5 gap-2 items-center">
              <Input type="number" placeholder="Ordem" value={form.index_order} onChange={(e)=>setForm(prev=>({ ...prev, index_order:Number(e.target.value||1) }))} />
              <Input placeholder="Título" value={form.title} onChange={(e)=>setForm(prev=>({ ...prev, title:e.target.value }))} />
              <Input placeholder="URL Conteúdo" value={form.content_url} onChange={(e)=>setForm(prev=>({ ...prev, content_url:e.target.value }))} />
              <Input placeholder="URL Vídeo" value={form.video_url} onChange={(e)=>setForm(prev=>({ ...prev, video_url:e.target.value }))} />
              <Button onClick={add}>Adicionar Módulo</Button>
            </div>
          )}
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-5 gap-2">
                <Input type="number" value={r.index_order||1} onChange={(e)=>update(r.id,{ index_order:Number(e.target.value||1) })} />
                <Input value={r.title||''} onChange={(e)=>update(r.id,{ title:e.target.value })} />
                <Input value={r.content_url||''} onChange={(e)=>update(r.id,{ content_url:e.target.value })} />
                <Input value={r.video_url||''} onChange={(e)=>update(r.id,{ video_url:e.target.value })} />
                <div className="flex items-center gap-2"><Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

