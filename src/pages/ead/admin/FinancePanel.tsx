import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function FinancePanel() {
  const [facultyId, setFacultyId] = useState<string>("");
  const [faculties, setFaculties] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [expectedByCourse, setExpectedByCourse] = useState<Record<string, number>>({});
  const [actualByCourse, setActualByCourse] = useState<Record<string, number>>({});
  const [byPolo, setByPolo] = useState<Record<string, number>>({});
  const [repasseRules, setRepasseRules] = useState<Record<string, number>>({});
  
  const [compareStart, setCompareStart] = useState<string>("");
  const [compareEnd, setCompareEnd] = useState<string>("");
  const [compareRows, setCompareRows] = useState<Array<{ polo:string, pctA:number, pctB:number, deltaPct:number, repA:number, repB:number, deltaRep:number }>>([]);
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [polosRows, setPolosRows] = useState<any[]>([]);
  const [monthCsv, setMonthCsv] = useState<string>("");
  const [rulesTimeline, setRulesTimeline] = useState<Record<string, Array<{ date:string, percent:number }>>>({});
  const loadFacs = async()=>{ const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setFaculties(data||[]); };
  const load = async()=>{
    if (!facultyId) { setCourses([]); setExpectedByCourse({}); setActualByCourse({}); setByPolo({}); return; }
    const { data: cs } = await supabase.from('ead_courses').select('id,name,valor,faculty_id').eq('faculty_id', facultyId);
    setCourses(cs||[]);
    const { data: enr } = await supabase.from('ead_enrollments').select('id,course_id,polo_id,status');
    const exp: any = {}; (cs||[]).forEach((c:any)=>{ const count = (enr||[]).filter((e:any)=>e.course_id===c.id).length; exp[c.id] = Number(c.valor||0) * count; }); setExpectedByCourse(exp);
    const { data: links } = await supabase.from('ead_payment_links').select('payment_id,enrollment_id,course_id,polo_id');
    const payIds = (links||[]).map((l:any)=>l.payment_id);
    const { data: pays } = payIds.length? await supabase.from('payments').select('id,amount,date').in('id', payIds): { data: [] } as any;
    const act: any = {}; (cs||[]).forEach((c:any)=> act[c.id]=0);
    (links||[]).forEach((l:any)=>{ const val = (pays||[]).find((p:any)=>p.id===l.payment_id)?.amount||0; act[l.course_id] = (act[l.course_id]||0) + Number(val||0); }); setActualByCourse(act);
    const { data: polos } = await supabase.from('college_polo').select('id,name,matriz_id').eq('matriz_id', facultyId); setPolosRows(polos||[]);
    const bp: any = {}; (polos||[]).forEach((p:any)=>bp[p.id]=0);
    (links||[]).forEach((l:any)=>{ const pm = (pays||[]).find((p:any)=>p.id===l.payment_id); const val = pm?.amount||0; bp[l.polo_id] = (bp[l.polo_id]||0) + Number(val||0); }); setByPolo(bp);
    const byMonth: any = {}; (links||[]).forEach((l:any)=>{ const pm = (pays||[]).find((p:any)=>p.id===l.payment_id); const dt = pm?.date; if (!dt) return; const k = `${new Date(dt).getFullYear()}-${String(new Date(dt).getMonth()+1).padStart(2,'0')}`; byMonth[k] ||= {}; byMonth[k][l.polo_id] = (byMonth[k][l.polo_id]||0) + Number(pm?.amount||0); });
    const lines = ['mes,polo,valor']; Object.keys(byMonth).sort().forEach(mk=>{ Object.keys(byMonth[mk]).forEach(pid=>{ const name = (polos||[]).find((p:any)=>p.id===pid)?.name||pid; lines.push(`${mk},${name},${byMonth[mk][pid]}`); }); }); setMonthCsv(lines.join('\n'));
    const { data: rulesRaw } = await supabase.from('ead_polo_repasse_rules').select('polo_id,percent_to_matriz,effective_date');
    const rr: any = {}; (rulesRaw||[]).filter((r:any)=> !effectiveDate || new Date(r.effective_date).getTime() <= new Date(effectiveDate).getTime()).forEach((r:any)=>{ const cur = rr[r.polo_id]; if (!cur || new Date(r.effective_date).getTime() > (cur.date||0)) rr[r.polo_id] = { val: Number(r.percent_to_matriz||0), date: new Date(r.effective_date).getTime() }; });
    const flat: any = {}; Object.keys(rr).forEach(pid=> flat[pid] = rr[pid].val); setRepasseRules(flat);
    const ids = new Set((polos||[]).map((p:any)=>p.id)); const tl: any = {}; (rulesRaw||[]).filter((r:any)=>ids.has(r.polo_id)).forEach((r:any)=>{ tl[r.polo_id] ||= []; tl[r.polo_id].push({ date: r.effective_date, percent: Number(r.percent_to_matriz||0) }); }); Object.keys(tl).forEach(pid=> tl[pid].sort((a:any,b:any)=> new Date(a.date).getTime() - new Date(b.date).getTime())); setRulesTimeline(tl);
  };
  useEffect(()=>{ loadFacs(); },[]);
  useEffect(()=>{ load(); },[facultyId]);
  const inadimplentes = courses.map(c=>({ id:c.id, name:c.name, count: ((expectedByCourse[c.id]||0) > (actualByCourse[c.id]||0))? Math.max(0, ((expectedByCourse[c.id]||0) - (actualByCourse[c.id]||0)) / Number(c.valor||1)): 0 }));
  const repasseData = Object.keys(byPolo).map(pid=>{ const total = byPolo[pid]||0; const pct = repasseRules[pid]||0; return { polo: pid, matriz: total * (pct/100), polo_retencao: total * (1 - (pct/100)) }; });
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Painel Financeiro EAD</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <select className="border rounded px-2 py-1" value={facultyId} onChange={(e)=>setFacultyId(e.target.value)}>
            <option value="">Selecione a Matriz EAD</option>
            {faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name}</option>))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs">Data de referência:</span>
            <input type="date" className="border rounded px-2 py-1 text-xs" value={effectiveDate} onChange={(e)=>setEffectiveDate(e.target.value)} />
            <button className="border rounded px-2 py-1 text-xs" onClick={()=>load()}>Aplicar</button>
          </div>
          <div className="border p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="text-xs">Histórico de Repasse por Polo</div>
              <button className="border rounded px-2 py-1 text-xs" onClick={()=>{ const lines = ['polo,data,percent']; Object.keys(rulesTimeline).forEach(pid=>{ const name = polosRows.find(p=>p.id===pid)?.name||pid; rulesTimeline[pid].forEach((row:any)=>{ lines.push(`${name},${row.date},${row.percent}`); }); }); const blob = new Blob([lines.join('\n')],{ type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'repasse_historico.csv'; a.click(); }}>Export CSV (Histórico)</button>
            </div>
            <div className="space-y-2 mt-2">
              {polosRows.map(pr=> (
                <div key={`hist-${pr.id}`} className="border rounded p-2">
                  <div className="text-xs font-semibold mb-1">{pr.name}</div>
                  <div className="space-y-1">
                    {(rulesTimeline[pr.id]||[]).map((row:any,idx:number)=>{
                      const prev = (rulesTimeline[pr.id]||[])[idx-1]; const delta = prev? (row.percent - prev.percent): 0;
                      return (<div key={`r-${pr.id}-${row.date}`} className="text-xs flex gap-2"><span className="w-28">{row.date}</span><span>{row.percent.toFixed(2)}%</span><span>{prev? `Δ ${delta>0?'+':''}${delta.toFixed(2)}%`: ''}</span></div>);
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border p-2 rounded">
            <div className="text-xs mb-1">Comparação de Repasse por Polo</div>
            <div className="flex items-center gap-2">
              <input type="date" className="border rounded px-2 py-1 text-xs" value={compareStart} onChange={(e)=>setCompareStart(e.target.value)} />
              <input type="date" className="border rounded px-2 py-1 text-xs" value={compareEnd} onChange={(e)=>setCompareEnd(e.target.value)} />
              <button className="border rounded px-2 py-1 text-xs" onClick={async()=>{
                const { data: rulesRaw } = await supabase.from('ead_polo_repasse_rules').select('polo_id,percent_to_matriz,effective_date');
                const calcPct = (date:string, pid:string) => {
                  const candidates = (rulesRaw||[]).filter((r:any)=>r.polo_id===pid && new Date(r.effective_date).getTime() <= new Date(date).getTime());
                  if (!candidates.length) return 0; const last = candidates.sort((a:any,b:any)=> new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime()).slice(-1)[0]; return Number(last.percent_to_matriz||0);
                };
                const rows = polosRows.map(pr=>{ const total = byPolo[pr.id]||0; const pctA = compareStart? calcPct(compareStart, pr.id): 0; const pctB = compareEnd? calcPct(compareEnd, pr.id): 0; const repA = total * (pctA/100); const repB = total * (pctB/100); return { polo: pr.name, pctA, pctB, deltaPct: pctB-pctA, repA, repB, deltaRep: repB-repA }; });
                setCompareRows(rows);
              }}>Comparar</button>
              <button className="border rounded px-2 py-1 text-xs" onClick={()=>{ const lines = ['polo,pctA,pctB,deltaPct,repA,repB,deltaRep']; compareRows.forEach(r=>lines.push(`${r.polo},${r.pctA},${r.pctB},${r.deltaPct},${r.repA},${r.repB},${r.deltaRep}`)); const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'comparativo_repasse.csv'; a.click(); }}>Export CSV (Comparativo)</button>
            </div>
            <div className="space-y-1 mt-2">
              {compareRows.map(r=> (
                <div key={`cmp-${r.polo}`} className="text-xs grid grid-cols-6 gap-2">
                  <span className="truncate">{r.polo}</span>
                  <span>{r.pctA.toFixed(2)}%</span>
                  <span>{r.pctB.toFixed(2)}%</span>
                  <span>{r.deltaPct>0?'+':''}{r.deltaPct.toFixed(2)}%</span>
                  <span>R$ {r.repA.toFixed(2)}</span>
                  <span>Δ R$ {r.deltaRep>0?'+':''}{r.deltaRep.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2" style={{ height: 320 }}>
              <div className="border rounded p-2">
                <div className="text-xs mb-1">Repasse (R$) por Polo</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={compareRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="polo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="repA" name="Repasse A" fill="#0ea5e9" />
                    <Bar dataKey="repB" name="Repasse B" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="border rounded p-2">
                <div className="text-xs mb-1">Percentual de Repasse (%)</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={compareRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="polo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pctA" name="% A" fill="#f59e0b" />
                    <Bar dataKey="pctB" name="% B" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <button className="border rounded px-2 py-1 text-xs" onClick={()=>{
            const lines = ['curso,real,esperado']; courses.forEach(c=>lines.push(`${c.name},${(actualByCourse[c.id]||0)},${(expectedByCourse[c.id]||0)}`));
            const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'financeiro_cursos.csv'; a.click();
          }}>Export CSV (Cursos)</button>
          <button className="border rounded px-2 py-1 text-xs" onClick={()=>{ const blob = new Blob([monthCsv], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'financeiro_polo_mes.csv'; a.click(); }}>Export CSV (Polo/Mês)</button>
          <div className="grid grid-cols-2 gap-2">
            <div className="border p-2 rounded">
              <div className="text-xs mb-1">Receita por Curso (Real vs Esperado)</div>
              {courses.map(c=> (
                <div key={c.id} className="text-xs flex gap-2"><span className="flex-1 truncate">{c.name}</span><span>Real:R$ {(actualByCourse[c.id]||0).toFixed(2)}</span><span>Esperado:R$ {(expectedByCourse[c.id]||0).toFixed(2)}</span></div>
              ))}
            </div>
            <div className="border p-2 rounded">
              <div className="text-xs mb-1">Receita por Polo</div>
              {Object.keys(byPolo).map(pid=> (
                <div key={pid} className="text-xs flex gap-2"><span className="flex-1 truncate">{pid}</span><span>R$ {(byPolo[pid]||0).toFixed(2)}</span></div>
              ))}
            </div>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repasseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="polo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="matriz" name="Repasse à Matriz" fill="#0ea5e9" />
                <Bar dataKey="polo_retencao" name="Retenção Polo" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthCsv.split('\n').slice(1).map((l)=>{ const [mes,polo,valor] = l.split(','); return { mes, polo, valor: Number(valor||0) }; })}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" name="Receita por mês" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border p-2 rounded">
            <div className="text-xs mb-1">Regras de Repasse por Polo</div>
            <div className="space-y-2">
              {polosRows.map(pr=> (
                <div key={pr.id} className="grid grid-cols-3 gap-2 items-center text-xs">
                  <span className="truncate">{pr.name}</span>
                  <input className="border rounded px-2 py-1" type="number" step="0.01" value={repasseRules[pr.id]||0} onChange={(e)=>setRepasseRules(prev=>({ ...prev, [pr.id]: Number(e.target.value||0) }))} />
                  <button className="border rounded px-2 py-1" onClick={async()=>{ await supabase.from('ead_polo_repasse_rules').insert({ polo_id: pr.id, percent_to_matriz: repasseRules[pr.id]||0, effective_date: new Date().toISOString().slice(0,10) }); const { data: rules } = await supabase.from('ead_polo_repasse_rules').select('polo_id,percent_to_matriz'); const rr: any = {}; (rules||[]).forEach((r:any)=>{ rr[r.polo_id] = Number(r.percent_to_matriz||0); }); setRepasseRules(rr); }}>Salvar</button>
                </div>
              ))}
            </div>
          </div>
          <div className="border p-2 rounded">
            <div className="text-xs mb-1">Inadimplência (estimada)</div>
            {inadimplentes.map(x=> (
              <div key={x.id} className="text-xs flex gap-2"><span className="flex-1 truncate">{x.name}</span><span>Alunos estimados em atraso: {Math.floor(x.count)}</span></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

