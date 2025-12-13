import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";

export default function MonthlyReports() {
  const [churchId, setChurchId] = useState<string>("");
  const [months, setMonths] = useState<any[]>([]);
  const load = async () => {
    if (!churchId) return;
    const { data: e } = await supabase.from('church_entries').select('amount,date').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('total_value,date').eq('church_id', churchId);
    const agg: Record<string, { month: string, entries: number, expenses: number, balance: number }> = {};
    (e||[]).forEach((r:any)=>{ const d=new Date(r.date); const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; agg[k] ||= { month:k, entries:0, expenses:0, balance:0 }; agg[k].entries += Number(r.amount||0); });
    (x||[]).forEach((r:any)=>{ const d=new Date(r.date); const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; agg[k] ||= { month:k, entries:0, expenses:0, balance:0 }; agg[k].expenses += Number(r.total_value||0); });
    const rows = Object.values(agg).map(r=>({ ...r, balance: r.entries - r.expenses })).sort((a,b)=>a.month.localeCompare(b.month));
    setMonths(rows);
  };
  useEffect(()=>{ load(); },[churchId]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Relatórios Mensais</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{/* options from context */}</SelectContent></Select>
            <button onClick={()=>exportToCSV(months,'mensal',[{key:'month',label:'Mês'},{key:'entries',label:'Entradas'},{key:'expenses',label:'Despesas'},{key:'balance',label:'Saldo'}])}>CSV</button>
            <button onClick={()=>exportToExcel(months,'mensal',[{key:'month',label:'Mês'},{key:'entries',label:'Entradas'},{key:'expenses',label:'Despesas'},{key:'balance',label:'Saldo'}])}>Excel</button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="entries" fill="#16a34a" />
                  <Bar dataKey="expenses" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="balance" stroke="#0ea5e9" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

