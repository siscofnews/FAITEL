import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ModuleViewer() {
  const [courseId, setCourseId] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string>("");
  const [progress, setProgress] = useState<Record<string, any>>({});
  useEffect(()=>{ const parts = window.location.pathname.split('/'); const cid = parts[parts.length-1]; setCourseId(cid); },[]);
  useEffect(()=>{ (async()=>{
    if (!courseId) return;
    const { data: mods } = await supabase.from('ead_modules').select('*').eq('course_id', courseId).order('index_order'); setModules(mods||[]);
    const { data: sessionData } = await supabase.auth.getSession(); const uid = sessionData.session?.user?.id; if (!uid) return;
    const { data: enr } = await supabase.from('ead_enrollments').select('id').eq('student_id', uid).eq('course_id', courseId).maybeSingle(); const eid = (enr as any)?.id; if (!eid) return; setEnrollmentId(eid);
    const { data: prog } = await supabase.from('ead_progress').select('*').eq('enrollment_id', eid);
    const map: any = {}; (prog||[]).forEach((p:any)=>{ map[p.module_id] = p }); setProgress(map);
  })(); },[courseId]);
  const desbloquearProximo = (mid:string) => {
    const mod = modules.find(m=>m.id===mid); if (!mod) return false;
    if (mod.index_order===1) return true;
    const prev = modules.find(m=>m.index_order===mod.index_order-1); const p = prev && progress[prev.id]; return !!p && p.status==='aprovado';
  };
  const registrarAssistido = async(mid:string)=>{ if (!enrollmentId) return; await supabase.from('ead_attendance').upsert({ enrollment_id: enrollmentId, module_id: mid, time_watched_seconds: 300, percentage: 100 }); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Módulos do Curso</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {modules.map(m=>{
            const locked = !desbloquearProximo(m.id);
            return (
              <div key={m.id} className="border p-2 rounded">
                <div className="flex items-center gap-2"><span className="flex-1">{m.index_order}. {m.title}</span><span className="text-xs">{locked?'Bloqueado':'Liberado'}</span></div>
                {!locked && (
                  <div className="flex items-center gap-2">
                    {m.content_url && (<a className="text-blue-600 underline" href={m.content_url} target="_blank">Abrir Conteúdo</a>)}
                    {m.video_url && (<a className="text-blue-600 underline" href={`/ead/aluno/player/${m.id}`}>Assistir Vídeo</a>)}
                    <Button onClick={()=>registrarAssistido(m.id)}>Marcar Presença</Button>
                    <a className="text-blue-600 underline" href={`/ead/aluno/exam/${m.id}`}>Fazer Prova</a>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

