import { useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function VideoPlayer() {
  const [moduleId, setModuleId] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [enrollmentId, setEnrollmentId] = useState<string>("");
  const [watched, setWatched] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [lastTime, setLastTime] = useState<number>(0);
  const vidRef = useRef<HTMLVideoElement>(null);
  useEffect(()=>{ const parts = window.location.pathname.split('/'); const mid = parts[parts.length-1]; setModuleId(mid); },[]);
  useEffect(()=>{ (async()=>{
    if (!moduleId) return;
    const { data: mod } = await supabase.from('ead_modules').select('video_url,course_id').eq('id', moduleId).maybeSingle(); setVideoUrl((mod as any)?.video_url||"");
    const { data: sessionData } = await supabase.auth.getSession(); const uid = sessionData.session?.user?.id; const { data: enr } = await supabase.from('ead_enrollments').select('id').eq('student_id', uid).eq('course_id', (mod as any)?.course_id).maybeSingle(); setEnrollmentId((enr as any)?.id||"");
    const { data: crs } = await supabase.from('ead_courses').select('faculty_id').eq('id', (mod as any)?.course_id).maybeSingle(); const fac = (crs as any)?.faculty_id;
    const { data: sets } = await supabase.from('ead_settings').select('min_view_percentage').eq('faculty_id', fac).maybeSingle(); const perc = Number((sets as any)?.min_view_percentage||90);
    setRequiredPct(perc);
  })(); },[moduleId]);
  const onTimeUpdate = () => {
    const v = vidRef.current; if (!v) return;
    const cur = Math.floor(v.currentTime); setDuration(Math.floor(v.duration||0));
    if (cur > lastTime + 2) { v.currentTime = lastTime; return; }
    setLastTime(cur); setWatched(Math.max(watched, cur));
    const pct = (watched / Math.max(1, Math.floor(v.duration||1))) * 100;
    if (pct >= requiredPct && enrollmentId) { supabase.from('ead_attendance').upsert({ enrollment_id: enrollmentId, module_id: moduleId, time_watched_seconds: watched, percentage: Math.min(100, pct) }); }
  };
  const onSeeking = () => { const v = vidRef.current; if (!v) return; if (v.currentTime > lastTime + 2) v.currentTime = lastTime; };
  const [requiredPct, setRequiredPct] = useState<number>(90);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Player</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {videoUrl? (
            <video ref={vidRef} src={videoUrl} controls onTimeUpdate={onTimeUpdate} onSeeking={onSeeking} style={{ width:'100%', maxHeight: 480 }} />
          ): (<div className="text-xs">Vídeo não disponível</div>)}
          <div className="text-xs">Assistido: {watched}s • Duração: {duration}s</div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

