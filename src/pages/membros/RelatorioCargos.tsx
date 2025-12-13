import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function RelatorioCargos() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from('members').select('id,role').order('role');
    const map: Record<string, number> = {};
    (data||[]).forEach((m:any)=>{ const r = m.role||'membro'; map[r]=(map[r]||0)+1; });
    setRows(Object.entries(map).map(([role,count])=>({ role, count })));
  };
  useEffect(()=>{ load(); },[]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Cargos</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {rows.map(r=>(<div key={r.role} className="border p-2 rounded flex justify-between"><span>{r.role}</span><span>{r.count}</span></div>))}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

