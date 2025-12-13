import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function TreasuryDashboard() {
  const [churchId, setChurchId] = useState<string>("");
  const [totals, setTotals] = useState<any>({ entries:0, expenses:0, repass:0, balance:0 });
  const load = async () => {
    if (!churchId) return;
    const { data: e } = await supabase.from('church_entries').select('amount').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('total_value').eq('church_id', churchId);
    const sE = (e||[]).reduce((a,b)=>a+Number(b.amount||0),0);
    const sX = (x||[]).reduce((a,b)=>a+Number(b.total_value||0),0);
    setTotals({ entries:sE, expenses:sX, repass:0, balance:sE-sX });
  };
  useEffect(()=>{ load(); },[churchId]);
  return (
    <MainLayout>
      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Entradas</CardTitle></CardHeader><CardContent>{totals.entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</CardContent></Card>
        <Card><CardHeader><CardTitle>Despesas</CardTitle></CardHeader><CardContent>{totals.expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</CardContent></Card>
        <Card><CardHeader><CardTitle>Repasse</CardTitle></CardHeader><CardContent>{totals.repass.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</CardContent></Card>
        <Card><CardHeader><CardTitle>Saldo</CardTitle></CardHeader><CardContent>{totals.balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</CardContent></Card>
      </div>
    </MainLayout>
  );
}

