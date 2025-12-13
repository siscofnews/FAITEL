import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function RelatorioTeologia() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from('member_profiles').select('member_id,theology_course,theology_institution, members(full_name,churches(nome_fantasia))');
    setRows(data||[]);
  };
  useEffect(()=>{ load(); },[]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Formação Teológica</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {rows.map((r:any)=>(<div key={r.member_id} className="border p-2 rounded"><div>{r.members?.full_name}</div><div className="text-sm">{r.theology_course} • {r.theology_institution}</div><div className="text-xs text-muted-foreground">{r.members?.churches?.nome_fantasia}</div></div>))}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

