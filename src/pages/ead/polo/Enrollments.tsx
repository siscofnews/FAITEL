import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Enrollments() {
  const [poloId, setPoloId] = useState<string>("");
  const [polos, setPolos] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const loadPolos = async()=>{ const { data } = await supabase.from('college_polo').select('id,name').order('name'); setPolos(data||[]); };
  const loadCourses = async()=>{ const { data } = await supabase.from('ead_courses').select('id,name').order('name'); setCourses(data||[]); };
  const load = async()=>{ if (!poloId) { setRows([]); return; } const { data } = await supabase.from('ead_enrollments').select('*').eq('polo_id', poloId).order('created_at'); setRows(data||[]); };
  useEffect(()=>{ loadPolos(); loadCourses(); },[]);
  useEffect(()=>{ load(); },[poloId]);
  const matricular = async()=>{
    const { data: user } = await supabase.from('profiles').select('id').eq('email', studentEmail).maybeSingle(); const uid = (user as any)?.id; if (!uid || !courseId || !poloId) return;
    await supabase.from('ead_enrollments').insert({ student_id: uid, course_id: courseId, polo_id: poloId, accepted_terms: false }); load();
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Matrículas do Polo</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-2 items-center">
            <select className="border rounded px-2 py-1" value={poloId} onChange={(e)=>setPoloId(e.target.value)}>
              <option value="">Selecione o Polo</option>
              {polos.map((p:any)=>(<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            <Input placeholder="Email do Aluno" value={studentEmail} onChange={(e)=>setStudentEmail(e.target.value)} />
            <select className="border rounded px-2 py-1" value={courseId} onChange={(e)=>setCourseId(e.target.value)}>
              <option value="">Curso</option>
              {courses.map((c:any)=>(<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <Button onClick={matricular}>Matricular</Button>
          </div>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-4 gap-2">
                <span>{r.student_id}</span>
                <span>{courses.find(c=>c.id===r.course_id)?.name||''}</span>
                <span>{polos.find(p=>p.id===r.polo_id)?.name||''}</span>
                <span>{r.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

