import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Licensing() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [licenseRows, setLicenseRows] = useState<any[]>([]);
  const [facultyId, setFacultyId] = useState<string>("");
  const [planForm, setPlanForm] = useState({ name:"Básico", max_students:100, monthly_price:0 });
  const loadFacs = async()=>{ const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setFaculties(data||[]); };
  const loadPlans = async()=>{ const { data } = await supabase.from('ead_plans').select('*').order('created_at'); setPlans(data||[]); };
  const loadLicenses = async()=>{ const { data } = await supabase.from('ead_licenses').select('*').order('created_at'); setLicenseRows(data||[]); };
  useEffect(()=>{ loadFacs(); loadPlans(); loadLicenses(); },[]);
  const addPlan = async()=>{ await supabase.from('ead_plans').insert(planForm); setPlanForm({ name:"Básico", max_students:100, monthly_price:0 }); loadPlans(); };
  const assign = async(plan_id:string)=>{ if (!facultyId) return; await supabase.from('ead_licenses').insert({ faculty_id: facultyId, plan_id, status:'active', start_date: new Date().toISOString().slice(0,10) }); loadLicenses(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Contratos e Licenças (SaaS)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 items-center">
            <select className="border rounded px-2 py-1" value={facultyId} onChange={(e)=>setFacultyId(e.target.value)}>
              <option value="">Faculdade Matriz EAD</option>
              {faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name}</option>))}
            </select>
            <Input placeholder="Plano" value={planForm.name} onChange={(e)=>setPlanForm(prev=>({ ...prev, name:e.target.value }))} />
            <Input type="number" placeholder="Mensalidade" value={planForm.monthly_price} onChange={(e)=>setPlanForm(prev=>({ ...prev, monthly_price:Number(e.target.value||0) }))} />
            <Button onClick={addPlan}>Criar Plano</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border p-2 rounded">
              <div className="text-xs mb-1">Planos</div>
              {plans.map(p=> (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <span className="flex-1">{p.name} • Máx:{p.max_students} • R$ {Number(p.monthly_price||0).toFixed(2)}</span>
                  <Button variant="secondary" onClick={()=>assign(p.id)}>Atribuir à Faculdade</Button>
                </div>
              ))}
            </div>
            <div className="border p-2 rounded">
              <div className="text-xs mb-1">Licenças</div>
              {licenseRows.map(l=> (
                <div key={l.id} className="flex items-center gap-2 text-xs">
                  <span className="flex-1">{faculties.find(f=>f.id===l.faculty_id)?.name||''} • Plano: {plans.find(p=>p.id===l.plan_id)?.name||''} • {l.status}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

