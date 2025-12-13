import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";

export default function RelatorioAniversariantes() {
  const [month, setMonth] = useState<string>(String(new Date().getMonth()+1).padStart(2,'0'));
  const [members, setMembers] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from('members').select('id,full_name,birth_date,churches(nome_fantasia),departments(name)').order('full_name');
    const list = (data||[]).filter((m:any)=> m.birth_date && String(new Date(m.birth_date).getMonth()+1).padStart(2,'0')===month);
    setMembers(list);
  };
  useEffect(()=>{ load(); },[month]);
  return (
    <MainLayout>
      <Card>
        <CardHeader className="flex items-center justify-between"><CardTitle>Aniversariantes</CardTitle>
          <div className="flex gap-2">
            <Select value={month} onValueChange={setMonth}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')).map(m=>(<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select>
            <button onClick={()=>exportToCSV(members,'aniversariantes',[{key:'full_name',label:'Nome'},{key:'birth_date',label:'Nascimento'},{key:'departments.name',label:'Departamento'},{key:'churches.nome_fantasia',label:'Igreja'}])}>CSV</button>
            <button onClick={()=>exportToExcel(members,'aniversariantes',[{key:'full_name',label:'Nome'},{key:'birth_date',label:'Nascimento'},{key:'departments.name',label:'Departamento'},{key:'churches.nome_fantasia',label:'Igreja'}])}>Excel</button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((m:any)=>(<div key={m.id} className="border p-2 rounded flex justify-between"><span>{m.full_name}</span><span>{new Date(m.birth_date).toLocaleDateString('pt-BR')}</span></div>))}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

