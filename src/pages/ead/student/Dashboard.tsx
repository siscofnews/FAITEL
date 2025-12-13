import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function StudentDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async()=>{
    const { data: sessionData } = await supabase.auth.getSession(); const uid = sessionData.session?.user?.id; if (!uid) return;
    const { data } = await supabase.from('ead_enrollments').select('id,course_id,status').eq('student_id', uid);
    const { data: courses } = await supabase.from('ead_courses').select('id,name');
    setRows((data||[]).map((e:any)=>({ ...e, course_name: (courses||[]).find((c:any)=>c.id===e.course_id)?.name })));
  };
  useEffect(()=>{ load(); },[]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Meu EAD</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {rows.map(r=> (
            <div key={r.id} className="border p-2 rounded flex items-center gap-2">
              <span className="flex-1">{r.course_name}</span>
              <a className="text-blue-600 underline" href={`/ead/aluno/curso/${r.course_id}`}>Abrir</a>
            </div>
          ))}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

