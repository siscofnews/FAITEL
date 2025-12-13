import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ContentOnboarding() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [newCourseName, setNewCourseName] = useState("");
  const [moduleId, setModuleId] = useState<string>("");
  const [moduleName, setModuleName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscoding, setIsTranscoding] = useState(false);

  useEffect(()=>{ (async()=>{ try { const { data } = await supabase.from('courses').select('id,name').order('name'); setCourses(data||[]); } catch { try { const demo = JSON.parse(localStorage.getItem('demo_courses')||'[]'); setCourses(demo||[]); } catch { setCourses([]); } } })(); },[]);

  const createCourse = async () => {
    try { const { data, error } = await supabase.from('courses').insert({ name: newCourseName }).select().single(); if (error) throw error; setCourseId(data.id); setCourses([...(courses||[]), { id: data.id, name: newCourseName }]); toast({ title: 'Curso criado' }); }
    catch { const id = String(Date.now()); const list = [...(courses||[]), { id, name: newCourseName }]; setCourses(list); setCourseId(id); try { localStorage.setItem('demo_courses', JSON.stringify(list)); } catch {}; toast({ title: 'Curso criado (offline)' }); }
  };
  const createModule = async () => {
    try { const { data, error } = await supabase.from('course_modules').insert({ course_id: courseId, name: moduleName }).select().single(); if (error) throw error; setModuleId(data.id); toast({ title: 'Módulo criado' }); }
    catch { const id = String(Date.now()); setModuleId(id); try { const key = 'demo_course_modules'; const list = JSON.parse(localStorage.getItem(key)||'[]'); list.push({ id, course_id: courseId, name: moduleName }); localStorage.setItem(key, JSON.stringify(list)); } catch {}; toast({ title: 'Módulo criado (offline)' }); }
  };
  const uploadContent = async () => {
    if (!moduleId || !lessonTitle) { toast({ title: 'Preencha módulo e título', variant: 'destructive' }); return; }
    setIsUploading(true);
    try {
      let videoUrl: string | null = null;
      if (videoFile) {
        try {
          const ext = videoFile.name.split('.').pop();
          const path = `${courseId}/${moduleId}/lesson-${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage.from('ead-content').upload(path, videoFile, { upsert: true, cacheControl: '3600' });
          if (!upErr) { const { data: pub } = supabase.storage.from('ead-content').getPublicUrl(path); videoUrl = pub.publicUrl; }
        } catch {
          videoUrl = URL.createObjectURL(videoFile);
        }
      }
      try {
        const { data: lesson, error: lErr } = await supabase.from('course_lessons').insert({ module_id: moduleId, title: lessonTitle, description: lessonDesc, video_url: videoUrl, is_published: true, published_at: new Date().toISOString() }).select().single();
        if (lErr) throw lErr;
        if (assetFile) {
          try {
            const aPath = `${courseId}/${moduleId}/${lesson.id}/asset-${Date.now()}-${assetFile.name}`;
            const { error: aErr } = await supabase.storage.from('ead-content').upload(aPath, assetFile, { upsert: true, cacheControl: '3600' });
            if (!aErr) { const { data: aPub } = supabase.storage.from('ead-content').getPublicUrl(aPath); await supabase.from('lesson_assets').insert({ lesson_id: lesson.id, name: assetFile.name, type: 'pdf', url: aPub.publicUrl }); }
          } catch {}
        }
        toast({ title: 'Aula publicada' });
        if (videoFile) { setIsTranscoding(true); const start = Date.now(); const poll = async()=>{ const { data } = await supabase.from('course_lessons').select('video_sd_url,video_hd_url').eq('id', lesson.id).maybeSingle(); if (data?.video_sd_url||data?.video_hd_url) { setIsTranscoding(false); toast({ title: 'Transcodificação pronta' }); return; } if (Date.now()-start < 5*60*1000) setTimeout(poll, 5000); else setIsTranscoding(false); }; setTimeout(poll, 5000); }
      } catch {
        const lessonId = String(Date.now());
        try { const key = 'demo_course_lessons'; const list = JSON.parse(localStorage.getItem(key)||'[]'); list.push({ id: lessonId, module_id: moduleId, title: lessonTitle, description: lessonDesc, video_url: videoUrl, is_published: true }); localStorage.setItem(key, JSON.stringify(list)); } catch {}
        if (assetFile) { try { const aKey = 'demo_lesson_assets'; const listA = JSON.parse(localStorage.getItem(aKey)||'[]'); const blobUrl = URL.createObjectURL(assetFile); listA.push({ id: String(Date.now()+1), lesson_id: lessonId, name: assetFile.name, type: 'pdf', url: blobUrl }); localStorage.setItem(aKey, JSON.stringify(listA)); } catch {} }
        toast({ title: 'Aula publicada (offline)' });
        setIsTranscoding(false);
      }
    } catch (e:any) { toast({ title: 'Erro ao publicar', description: e?.message||'' , variant: 'destructive' }); } finally { setIsUploading(false); }
  };

  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Onboarding de Conteúdo EAD</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Curso</Label>
              <select className="border rounded px-2 py-2" value={courseId} onChange={(e)=>setCourseId(e.target.value)}>
                <option value="">Selecione</option>
                {courses.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <div className="flex gap-2">
                <Input placeholder="Novo curso" value={newCourseName} onChange={(e)=>setNewCourseName(e.target.value)} />
                <Button onClick={createCourse}>Criar</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Módulo</Label>
              <Input placeholder="Nome do módulo" value={moduleName} onChange={(e)=>setModuleName(e.target.value)} />
              <Button onClick={createModule} disabled={!courseId}>Criar Módulo</Button>
            </div>
            <div className="space-y-2">
              <Label>Título da Aula</Label>
              <Input placeholder="Ex.: Introdução à Bibliologia" value={lessonTitle} onChange={(e)=>setLessonTitle(e.target.value)} />
              <Input placeholder="Descrição" value={lessonDesc} onChange={(e)=>setLessonDesc(e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Vídeo (MP4)</Label>
              <input type="file" accept="video/*" onChange={(e)=>setVideoFile(e.target.files?.[0]||null)} />
            </div>
            <div className="space-y-2">
              <Label>Material (PDF)</Label>
              <input type="file" accept="application/pdf" onChange={(e)=>setAssetFile(e.target.files?.[0]||null)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={uploadContent} disabled={isUploading || !moduleId || !lessonTitle}>{isUploading? 'Publicando...' : 'Publicar Aula'}</Button>
            {isTranscoding && (<div className="text-xs text-muted-foreground">Transcodificando…</div>)}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

