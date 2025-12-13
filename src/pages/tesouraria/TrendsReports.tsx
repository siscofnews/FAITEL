import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";

export default function TrendsReports() {
  const [churchId, setChurchId] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [months, setMonths] = useState<any[]>([]);
  const [drill, setDrill] = useState<any[]>([]);
  const within = (d:string) => { if (!start || !end) return true; const x = new Date(d).getTime(); return x >= new Date(start).getTime() && x <= new Date(end).getTime(); };
  const monthKey = (d:string) => { const nd = new Date(d); return `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}` };
  const load = async () => {
    if (!churchId) return;
    const { data: e } = await supabase.from('church_entries').select('amount,date,cost_center_id').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('total_value,date,cost_center_id').eq('church_id', churchId);
    const agg: Record<string, { month:string, entries:number, expenses:number, balance:number, yoy?:number, mom?:number }> = {};
    (e||[]).filter((r:any)=>within(r.date)).forEach((r:any)=>{ const k = monthKey(r.date); agg[k] ||= { month:k, entries:0, expenses:0, balance:0 }; agg[k].entries += Number(r.amount||0); });
    (x||[]).filter((r:any)=>within(r.date)).forEach((r:any)=>{ const k = monthKey(r.date); agg[k] ||= { month:k, entries:0, expenses:0, balance:0 }; agg[k].expenses += Number(r.total_value||0); });
    const rows = Object.values(agg).map(r=>({ ...r, balance: r.entries - r.expenses })).sort((a,b)=>a.month.localeCompare(b.month));
    for (let i=0;i<rows.length;i++) {
      const cur = rows[i];
      const prevMonth = rows[i-1];
      if (prevMonth) cur.mom = ((cur.balance - prevMonth.balance) / (prevMonth.balance || 1)) * 100;
      const [y, m] = cur.month.split('-').map(Number);
      const yKey = `${y-1}-${String(m).padStart(2,'0')}`;
      const prevYear = rows.find(r=>r.month===yKey);
      if (prevYear) cur.yoy = ((cur.balance - prevYear.balance) / (prevYear.balance || 1)) * 100;
    }
    setMonths(rows);
    setDrill([]);
  };
  useEffect(()=>{ load(); },[churchId, start, end]);
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const id = p.get('churchId'); if (id) setChurchId(id); },[]);
  const onBarClick = async (m:string) => {
    const { data: e } = await supabase.from('church_entries').select('amount,date,cost_center_id').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('total_value,date,cost_center_id').eq('church_id', churchId);
    const filtE = (e||[]).filter((r:any)=>monthKey(r.date)===m);
    const filtX = (x||[]).filter((r:any)=>monthKey(r.date)===m);
    const map: Record<string,{ cc:string, entries:number, expenses:number, balance:number }> = {};
    filtE.forEach((r:any)=>{ const k=r.cost_center_id||'sem'; map[k] ||= { cc:k, entries:0, expenses:0, balance:0 }; map[k].entries += Number(r.amount||0); });
    filtX.forEach((r:any)=>{ const k=r.cost_center_id||'sem'; map[k] ||= { cc:k, entries:0, expenses:0, balance:0 }; map[k].expenses += Number(r.total_value||0); });
    setDrill(Object.values(map).map(r=>({ ...r, balance: r.entries - r.expenses })));
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Tendências e Drilldown</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{/* options */}</SelectContent></Select>
            <input type="date" value={start} onChange={(e)=>setStart(e.target.value)} />
            <input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} />
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} onClick={(e:any)=>{ const m = e?.activeLabel; if (m) onBarClick(m); }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entries" name="Entradas" fill="#16a34a" />
                <Bar dataKey="expenses" name="Despesas" fill="#ef4444" />
                <Bar dataKey="balance" name="Saldo" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 260 }} className="mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mom" stroke="#a855f7" name="MoM %" />
                <Line type="monotone" dataKey="yoy" stroke="#f59e0b" name="YoY %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            {drill.map((r:any)=>(<div key={r.cc} className="border p-2 rounded flex justify-between"><span>{r.cc}</span><span>{r.entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • {r.expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • {r.balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
