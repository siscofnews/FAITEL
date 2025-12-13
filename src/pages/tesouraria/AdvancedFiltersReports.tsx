import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function AdvancedFiltersReports() {
  const [churchId, setChurchId] = useState<string>("");
  const [ccId, setCcId] = useState<string>("");
  const [acct, setAcct] = useState<string>("");
  const [centers, setCenters] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const loadMeta = async () => {
    if (!churchId) return;
    const { data: c } = await supabase.from('cost_centers').select('*').eq('entity','IGREJA').eq('entity_id', churchId);
    const { data: a } = await supabase.from('chart_accounts').select('*').eq('entity','IGREJA').eq('entity_id', churchId);
    setCenters(c||[]); setAccounts(a||[]);
  };
  const loadRows = async () => {
    if (!churchId) return;
    const { data: e } = await supabase.from('church_entries').select('amount,date,cost_center_id,account_code').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('total_value,date,cost_center_id,account_code').eq('church_id', churchId);
    const filtE = (e||[]).filter((r:any)=>(!ccId||r.cost_center_id===ccId) && (!acct||r.account_code===acct));
    const filtX = (x||[]).filter((r:any)=>(!ccId||r.cost_center_id===ccId) && (!acct||r.account_code===acct));
    const map: Record<string,{ month:string, entries:number, expenses:number, balance:number }> = {};
    const mKey = (d:string)=>{ const nd=new Date(d); return `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}` };
    filtE.forEach((r:any)=>{ const k=mKey(r.date); map[k] ||= { month:k, entries:0, expenses:0, balance:0 }; map[k].entries += Number(r.amount||0); });
    filtX.forEach((r:any)=>{ const k=mKey(r.date); map[k] ||= { month:k, entries:0, expenses:0, balance:0 }; map[k].expenses += Number(r.total_value||0); });
    setRows(Object.values(map).map(r=>({ ...r, balance: r.entries - r.expenses })).sort((a,b)=>a.month.localeCompare(b.month)));
  };
  useEffect(()=>{ loadMeta(); },[churchId]);
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const id = p.get('churchId'); if (id) setChurchId(id); },[]);
  useEffect(()=>{ loadRows(); },[churchId, ccId, acct]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Relatórios com Filtros Avançados</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{/* options */}</SelectContent></Select>
            <Select value={ccId} onValueChange={setCcId}><SelectTrigger className="w-64"><SelectValue placeholder="Centro de Custo" /></SelectTrigger><SelectContent>{centers.map(c=>(<SelectItem key={c.id} value={c.id}>{c.code} • {c.name}</SelectItem>))}</SelectContent></Select>
            <Select value={acct} onValueChange={setAcct}><SelectTrigger className="w-64"><SelectValue placeholder="Conta" /></SelectTrigger><SelectContent>{accounts.map(a=>(<SelectItem key={a.code} value={a.code}>{a.code} • {a.name}</SelectItem>))}</SelectContent></Select>
          </div>
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
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
        </CardContent>
      </Card>
    </MainLayout>
  );
}

