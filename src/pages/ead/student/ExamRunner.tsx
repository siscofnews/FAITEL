import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Question = { id:string, enunciado:string, tipo:string, opcoes:any };

export default function ExamRunner() {
  const [moduleId, setModuleId] = useState<string>("");
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [enrollmentId, setEnrollmentId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [attempt, setAttempt] = useState<number>(1);
  useEffect(()=>{ const parts = window.location.pathname.split('/'); const mid = parts[parts.length-1]; setModuleId(mid); },[]);
  useEffect(()=>{ (async()=>{
    if (!moduleId) return;
    const { data: ex } = await supabase.from('ead_exams').select('*').eq('module_id', moduleId).limit(1);
    const e = (ex||[])[0]; if (!e) return; setExam(e); setTimeLeft((e.tempo_minutos||30) * 60);
    const { data: qj } = await supabase.from('ead_exam_questions').select('question_id').eq('exam_id', e.id);
    const ids = (qj||[]).map((x:any)=>x.question_id);
    const { data: qs } = await supabase.from('ead_questions').select('id,enunciado,tipo,opcoes').in('id', ids);
    setQuestions(qs||[]);
    const { data: sessionData } = await supabase.auth.getSession(); const uid = sessionData.session?.user?.id; setStudentId(uid||"");
    const { data: mod } = await supabase.from('ead_modules').select('course_id,id').eq('id', moduleId).maybeSingle(); const cid = (mod as any)?.course_id;
    const { data: crs } = await supabase.from('ead_courses').select('faculty_id').eq('id', cid).maybeSingle(); const fac = (crs as any)?.faculty_id;
    const { data: sets } = await supabase.from('ead_settings').select('*').eq('faculty_id', fac).maybeSingle(); const cfg = sets as any;
    const { data: enr } = await supabase.from('ead_enrollments').select('id').eq('student_id', uid).eq('course_id', cid).maybeSingle(); const eid = (enr as any)?.id; setEnrollmentId(eid||"");
    const { data: prev } = await supabase.from('ead_exam_results').select('attempt').eq('exam_id', e.id).eq('enrollment_id', eid); setAttempt(((prev||[]).length||0)+1);
    const { data: prog } = await supabase.from('ead_progress').select('lock_until').eq('enrollment_id', eid).eq('module_id', moduleId).maybeSingle();
    const lu = (prog as any)?.lock_until; if (lu && new Date(lu).getTime() > Date.now()) { alert('Você está temporariamente bloqueado para refazer esta prova. Tente novamente mais tarde.'); window.location.href = `/ead/aluno/curso/${cid}`; return; }
    const { data: fails } = await supabase.from('ead_exam_results').select('id').eq('exam_id', e.id).eq('enrollment_id', eid).eq('approved', false);
    if ((fails||[]).length >= Number(cfg?.max_reprobations||e.tentativas_permitidas||1)) { alert('Limite de reprovações atingido'); window.location.href = `/ead/aluno/curso/${cid}`; return; }
  })(); },[moduleId]);
  useEffect(()=>{ if (!timeLeft) return; const iv = setInterval(()=>setTimeLeft(t=>Math.max(0,t-1)),1000); return ()=>clearInterval(iv); },[timeLeft]);
  const setAns = (qid:string, val:any) => setAnswers(prev=>({ ...prev, [qid]: val }));
  const submit = async()=>{
    if (!exam) return;
    if (attempt > Number(exam.tentativas_permitidas||1)) { alert('Limite de tentativas atingido'); return; }
    const { data: corr } = await supabase.from('ead_questions').select('id,resposta').in('id', questions.map(q=>q.id));
    const map: Record<string, any> = {}; (corr||[]).forEach((r:any)=>{ map[r.id] = r.resposta });
    let score = 0; const peso = Number(exam.peso_por_questao||1);
    questions.forEach(q=>{ const a = answers[q.id]; const c = map[q.id]; if (JSON.stringify(a)===JSON.stringify(c)) score += peso; });
    const approved = score >= Number(exam.nota_aprovacao||7);
    await supabase.from('ead_exam_results').insert({ exam_id: exam.id, enrollment_id: enrollmentId, module_id: moduleId, student_id: studentId, attempt, score, approved });
    const { data: pr } = await supabase.from('ead_progress').select('attempts').eq('enrollment_id', enrollmentId).eq('module_id', moduleId);
    const attempts = ((pr||[])[0]?.attempts||0) + 1;
    const status = approved? 'aprovado':'reprovado';
    const { data: mod2 } = await supabase.from('ead_modules').select('course_id').eq('id', moduleId).maybeSingle(); const cid2 = (mod2 as any)?.course_id;
    const { data: crs2 } = await supabase.from('ead_courses').select('faculty_id').eq('id', cid2).maybeSingle(); const fac2 = (crs2 as any)?.faculty_id;
    const { data: sets2 } = await supabase.from('ead_settings').select('*').eq('faculty_id', fac2).maybeSingle(); const hours = Number((sets2 as any)?.block_hours_on_fail||24);
    const lock_until = approved? null : new Date(Date.now() + hours*60*60*1000).toISOString();
    await supabase.from('ead_progress').upsert({ enrollment_id: enrollmentId, module_id: moduleId, score, status, attempts, unlocked: approved, lock_until });
    alert(`Sua nota: ${score} • ${approved? 'Aprovado':'Reprovado'}`);
    window.location.href = `/ead/aluno/curso/${cid2||''}`;
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Prova do Módulo</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!!exam && (<div className="flex items-center gap-2"><span className="text-xs">Tempo</span><span className="text-lg font-semibold">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span></div>)}
          <div className="space-y-3">
            {questions.map(q=> (
              <div key={q.id} className="border p-2 rounded">
                <div className="mb-2 text-sm">{q.enunciado}</div>
                {q.tipo==='multipla_escolha' && (q.opcoes||[]).map((opt:any,idx:number)=>(
                  <label key={idx} className="flex items-center gap-2 text-xs"><input type="radio" name={`q-${q.id}`} onChange={()=>setAns(q.id, idx)} />{String(opt)}</label>
                ))}
                {q.tipo==='alternativa_multipla' && (q.opcoes||[]).map((opt:any,idx:number)=>(
                  <label key={idx} className="flex items-center gap-2 text-xs"><input type="checkbox" onChange={(e)=>{ const cur = Array.isArray(answers[q.id])? answers[q.id]:[]; if (e.target.checked) setAns(q.id,[...cur, idx]); else setAns(q.id, cur.filter((x:any)=>x!==idx)); }} />{String(opt)}</label>
                ))}
                {q.tipo==='verdadeiro_falso' && (
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1"><input type="radio" name={`q-${q.id}`} onChange={()=>setAns(q.id, true)} />Verdadeiro</label>
                    <label className="flex items-center gap-1"><input type="radio" name={`q-${q.id}`} onChange={()=>setAns(q.id, false)} />Falso</label>
                  </div>
                )}
                {q.tipo==='alternativa_unica' && (q.opcoes||[]).map((opt:any,idx:number)=>(
                  <label key={idx} className="flex items-center gap-2 text-xs"><input type="radio" name={`q-${q.id}`} onChange={()=>setAns(q.id, idx)} />{String(opt)}</label>
                ))}
              </div>
            ))}
          </div>
          {!!exam && <Button onClick={submit} disabled={timeLeft===0}>Enviar Prova</Button>}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

