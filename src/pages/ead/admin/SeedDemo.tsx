import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SeedDemo() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const importDemo = async () => {
    setBusy(true);
    try {
      let courseId: string = '';
      try { const { data } = await supabase.from('courses').insert({ name: 'Teologia Básica' }).select().single(); courseId = data?.id || ''; } catch {}
      if (!courseId) courseId = String(Date.now());
      let moduleId: string = '';
      try { const { data } = await supabase.from('course_modules').insert({ course_id: courseId, name: 'Bibliologia I' }).select().single(); moduleId = data?.id || ''; } catch {}
      if (!moduleId) moduleId = String(Date.now()+1);
      const lessons = [
        { title: 'Introdução à Bibliologia', description: 'Panorama e objetivos do curso', video_url: '' },
        { title: 'Revelação', description: 'Conceitos de revelação geral e especial', video_url: '' },
        { title: 'Inspiração', description: 'Doutrina da inspiração das Escrituras', video_url: '' },
      ];
      for (const l of lessons) {
        try { await supabase.from('course_lessons').insert({ module_id: moduleId, title: l.title, description: l.description, video_url: l.video_url, is_published: true }); } catch {}
      }
      try {
        const key = 'demo_courses'; const listC = JSON.parse(localStorage.getItem(key)||'[]'); listC.push({ id: courseId, name: 'Teologia Básica' }); localStorage.setItem(key, JSON.stringify(listC));
        const keyM = 'demo_course_modules'; const listM = JSON.parse(localStorage.getItem(keyM)||'[]'); listM.push({ id: moduleId, course_id: courseId, name: 'Bibliologia I' }); localStorage.setItem(keyM, JSON.stringify(listM));
        const keyL = 'demo_course_lessons'; const listL = JSON.parse(localStorage.getItem(keyL)||'[]'); lessons.forEach((l, idx)=> listL.push({ id: String(Date.now()+idx+2), module_id: moduleId, title: l.title, description: l.description, video_url: l.video_url, is_published: true })); localStorage.setItem(keyL, JSON.stringify(listL));
      } catch {}
      toast({ title: 'Pacote importado' });
    } catch (e:any) { toast({ title: 'Erro ao importar', description: e?.message||'', variant: 'destructive' }); } finally { setBusy(false); }
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Importar Pacote de Aulas (Demo)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>Adiciona 1 curso, 1 módulo e 3 aulas iniciais para homologação.</div>
          <Button onClick={importDemo} disabled={busy}>{busy? 'Importando...' : 'Importar 3 Aulas'}</Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

