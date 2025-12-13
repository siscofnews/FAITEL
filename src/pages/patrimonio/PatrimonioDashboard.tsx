import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";

export default function PatrimonioDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({ total: 0, items: 0, reparo: 0 });

  const load = async () => {
    const states = user?.id ? await getUserScopeStates(user.id) : [];
    const { data: churches } = await supabase.from("churches").select("id, estado").in(states.length ? "estado" : "id", states.length ? states : undefined as any);
    const ids = (churches || []).map((c: any) => c.id);
    const { data: assets } = await supabase.from("assets").select("total_value, status, church_id").in(ids.length ? "church_id" : "id", ids.length ? ids : undefined as any);
    const total = (assets || []).reduce((s: number, a: any) => s + Number(a.total_value || 0), 0);
    const items = (assets || []).length;
    const reparo = (assets || []).filter((a: any) => a.status === "EM_REPARO").length;
    setStats({ total, items, reparo });
  };

  useEffect(() => { load(); }, []);

  return (
    <MainLayout>
      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Bens</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.items}</CardContent></Card>
        <Card><CardHeader><CardTitle>Valor Total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</CardContent></Card>
        <Card><CardHeader><CardTitle>Em Conserto</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.reparo}</CardContent></Card>
      </div>
    </MainLayout>
  );
}

