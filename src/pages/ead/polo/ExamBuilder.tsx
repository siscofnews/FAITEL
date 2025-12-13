import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ExamBuilder() {
  const [moduleId, setModuleId] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const loadModules = async()=>{ const { data } = await supabase.from('ead_modules').select('id,title').order('title'); setModules(data||[]); };
  const loadQuestions = async()=>{ const { data } = await supabase.from('ead_questions').select('*').order('created_at'); setQuestions(data||[]); };
  useEffect(()=>{ loadModules(); loadQuestions(); },[]);
  const toggle = (id:string)=> setSelected(prev=>({ ...prev, [id]: !prev[id] }));
  const salvar = async()=>{
    const sel = Object.keys(selected).filter(k=>selected[k]); if (!moduleId || sel.length===0) return;
    const { data: exam } = await supabase.from('ead_exams').select('id').eq('module_id', moduleId).limit(1);
    let examId = (exam||[])[0]?.id;
    if (!examId) { const ins = await supabase.from('ead_exams').insert({ module_id: moduleId, num_questoes: sel.length }).select('id').limit(1); examId = ins.data?.[0]?.id; }
    await supabase.from('ead_exam_questions').delete().eq('exam_id', examId);
    await supabase.from('ead_exam_questions').insert(sel.map(qid=>({ exam_id: examId, question_id: qid })));
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Montagem de Provas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={moduleId} onChange={(e)=>setModuleId(e.target.value)}>
              <option value="">Selecione o Módulo</option>
              {modules.map((m:any)=>(<option key={m.id} value={m.id}>{m.title}</option>))}
            </select>
            <Button onClick={salvar}>Salvar</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {questions.map(q=> (
              <label key={q.id} className="border p-2 rounded flex items-center gap-2">
                <input type="checkbox" checked={!!selected[q.id]} onChange={()=>toggle(q.id)} />
                <span className="text-xs">{q.enunciado}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

