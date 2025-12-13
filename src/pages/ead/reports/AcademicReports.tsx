import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function AcademicReports() {
  const [facultyId, setFacultyId] = useState<string>("");
  const [faculties, setFaculties] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [byCourse, setByCourse] = useState<Record<string, any>>({});
  const [byPolo, setByPolo] = useState<Record<string, any>>({});
  const [courseMonthlyData, setCourseMonthlyData] = useState<any[]>([]);
  const [courseMonthlyAvg, setCourseMonthlyAvg] = useState<any[]>([]);
  const [courseMonthlyRate, setCourseMonthlyRate] = useState<any[]>([]);
  const loadFacs = async()=>{ const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setFaculties(data||[]); };
  const load = async()=>{
    if (!facultyId) { setCourses([]); setProgressData([]); return; }
    const { data: cs } = await supabase.from('ead_courses').select('id,name,faculty_id').eq('faculty_id', facultyId);
    setCourses(cs||[]);
    const { data: enr } = await supabase.from('ead_enrollments').select('id,course_id,polo_id');
    const { data: prog } = await supabase.from('ead_progress').select('enrollment_id,module_id,status,score');
    const byC: any = {}; (cs||[]).forEach((c:any)=>{ byC[c.id] = { name:c.name, aprovados:0, reprovados:0, media:0, count:0 }; });
    (prog||[]).forEach((p:any)=>{
      const en = (enr||[]).find((e:any)=>e.id===p.enrollment_id); if (!en) return; const agg = byC[en.course_id]; if (!agg) return; agg.count++; if (p.status==='aprovado') agg.aprovados++; if (p.status==='reprovado') agg.reprovados++; agg.media += Number(p.score||0);
    }); Object.keys(byC).forEach(k=>{ const a = byC[k]; a.media = a.count? a.media/a.count: 0; }); setByCourse(byC);
    const polosIds = Array.from(new Set((enr||[]).map((e:any)=>e.polo_id).filter(Boolean))); const { data: polos } = await supabase.from('college_polo').select('id,name').in('id', polosIds);
    const byP: any = {}; (polos||[]).forEach((p:any)=>{ byP[p.id] = { name:p.name, alunos:0, aprovados:0, reprovados:0 }; });
    (enr||[]).forEach((e:any)=>{ const bp = byP[e.polo_id]; if (!bp) return; bp.alunos++; const prs = (prog||[]).filter((x:any)=>x.enrollment_id===e.id); if (prs.some((x:any)=>x.status==='aprovado')) bp.aprovados++; if (prs.some((x:any)=>x.status==='reprovado')) bp.reprovados++; });
    setByPolo(byP);
    const courseIds = (cs||[]).map((c:any)=>c.id);
    const { data: mods } = courseIds.length? await supabase.from('ead_modules').select('id,course_id').in('course_id', courseIds): { data: [] } as any;
    const midToCid: Record<string,string> = {}; (mods||[]).forEach((m:any)=>{ midToCid[m.id] = m.course_id });
    const modIds = (mods||[]).map((m:any)=>m.id);
    const { data: results } = modIds.length? await supabase.from('ead_exam_results').select('module_id,score,approved,created_at').in('module_id', modIds): { data: [] } as any;
    const byMonthCourse: any = {};
    const byMonthAgg: any = {};
    (results||[]).forEach((r:any)=>{ const d=new Date(r.created_at); const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; const cid = midToCid[r.module_id]; const name = (cs||[]).find((c:any)=>c.id===cid)?.name||cid; byMonthCourse[k] ||= {}; byMonthCourse[k][name] = (byMonthCourse[k][name]||0) + (r.approved? 1: 0); byMonthAgg[k] ||= {}; byMonthAgg[k][name] ||= { sum:0, cnt:0, appr:0 }; byMonthAgg[k][name].sum += Number(r.score||0); byMonthAgg[k][name].cnt += 1; if (r.approved) byMonthAgg[k][name].appr += 1; });
    const months = Object.keys(byMonthCourse).sort(); const rows = months.map(m=>({ month:m, ...byMonthCourse[m] })); setCourseMonthlyData(rows);
    const rowsAvg = months.map(m=>{ const obj: any = { month:m }; Object.keys(byMonthAgg[m]||{}).forEach(name=>{ const a = byMonthAgg[m][name]; obj[name] = a.cnt? (a.sum/a.cnt): 0; }); return obj; }); setCourseMonthlyAvg(rowsAvg);
    const rowsRate = months.map(m=>{ const obj: any = { month:m }; Object.keys(byMonthAgg[m]||{}).forEach(name=>{ const a = byMonthAgg[m][name]; obj[name] = a.cnt? (a.appr/a.cnt)*100: 0; }); return obj; }); setCourseMonthlyRate(rowsRate);
  };
  useEffect(()=>{ loadFacs(); },[]);
  useEffect(()=>{ load(); },[facultyId]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Relatórios Acadêmicos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <select className="border rounded px-2 py-1" value={facultyId} onChange={(e)=>setFacultyId(e.target.value)}>
            <option value="">Selecione a Matriz EAD</option>
            {faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name}</option>))}
          </select>
          <button className="border rounded px-2 py-1 text-xs" onClick={()=>{
            const lines = ['curso,aprovados,reprovados,media'];
            Object.keys(byCourse).forEach(cid=>{ const c = byCourse[cid]; lines.push(`${c.name},${c.aprovados},${c.reprovados},${c.media.toFixed(2)}`); });
            const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio_academico_cursos.csv'; a.click();
          }}>Export CSV (Cursos)</button>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.keys(byCourse).map(cid=>({ curso: byCourse[cid].name, aprovados: byCourse[cid].aprovados, reprovados: byCourse[cid].reprovados }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="curso" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="aprovados" name="Aprovados" fill="#22c55e" />
                <Bar dataKey="reprovados" name="Reprovados" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button className="border rounded px-2 py-1 text-xs" onClick={()=>{
            const lines = ['mes,curso,aprovacoes,media,aprovacao_percent'];
            courseMonthlyData.forEach((row:any)=>{
              Object.keys(row).filter(k=>k!=='month').forEach(name=>{
                const aprovs = row[name];
                const avgRow = courseMonthlyAvg.find((r:any)=>r.month===row.month)||{};
                const rateRow = courseMonthlyRate.find((r:any)=>r.month===row.month)||{};
                const avgVal = avgRow[name]||0; const rateVal = rateRow[name]||0;
                lines.push(`${row.month},${name},${aprovs},${avgVal},${rateVal}`);
              });
            });
            const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'curso_mes_consolidado.csv'; a.click();
          }}>Export CSV (Curso/Mês Consolidado)</button>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={courseMonthlyAvg}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {courses.map((c:any,idx:number)=> (
                  <Line key={`avg-${c.id}`} type="monotone" dataKey={c.name} name={`Média • ${c.name}`} stroke={["#0ea5e9","#22c55e","#f59e0b","#ef4444","#6366f1","#14b8a6"][idx%6]} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={courseMonthlyRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {courses.map((c:any,idx:number)=> (
                  <Line key={`rate-${c.id}`} type="monotone" dataKey={c.name} name={`Aprovação (%) • ${c.name}`} stroke={["#0ea5e9","#22c55e","#f59e0b","#ef4444","#6366f1","#14b8a6"][idx%6]} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <button className="border rounded px-2 py-1 text-xs" onClick={()=>{ const lines = ['mes,curso,media,aprovacao_percent']; courseMonthlyAvg.forEach((row:any)=>{ Object.keys(row).filter(k=>k!=='month').forEach(name=>{ const avgVal = row[name]; const rateRow = courseMonthlyRate.find((r:any)=>r.month===row.month)||{}; const rateVal = rateRow[name]||0; lines.push(`${row.month},${name},${avgVal},${rateVal}`); }); }); const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'metricas_mensais_curso.csv'; a.click(); }}>Export CSV (Médias/Taxas)</button>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={courseMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {courses.map((c:any,idx:number)=> (
                  <Line key={`lc-${c.id}`} type="monotone" dataKey={c.name} name={c.name} stroke={["#0ea5e9","#22c55e","#f59e0b","#ef4444","#6366f1","#14b8a6"][idx%6]} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border p-2 rounded">
              <div className="text-xs mb-2">Aprovação/Reprovação por Curso</div>
              {Object.keys(byCourse).map(cid=> (
                <div key={cid} className="text-xs flex gap-2"><span className="flex-1 truncate">{byCourse[cid].name}</span><span>A:{byCourse[cid].aprovados}</span><span>R:{byCourse[cid].reprovados}</span><span>Média:{byCourse[cid].media.toFixed(2)}</span></div>
              ))}
            </div>
            <div className="border p-2 rounded">
              <div className="text-xs mb-2">Estatísticas por Polo</div>
              {Object.keys(byPolo).map(pid=> (
                <div key={pid} className="text-xs flex gap-2"><span className="flex-1 truncate">{byPolo[pid].name}</span><span>Alunos:{byPolo[pid].alunos}</span><span>A:{byPolo[pid].aprovados}</span><span>R:{byPolo[pid].reprovados}</span></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
