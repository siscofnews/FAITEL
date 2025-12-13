import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsManage() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [facultyId, setFacultyId] = useState<string>("");
  const [form, setForm] = useState({ block_hours_on_fail:24, max_reprobations:3, min_view_percentage:90 });
  const loadFacs = async()=>{ const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setFaculties(data||[]); };
  const load = async()=>{ if (!facultyId) { setForm({ block_hours_on_fail:24, max_reprobations:3, min_view_percentage:90 }); return; } const { data } = await supabase.from('ead_settings').select('*').eq('faculty_id', facultyId).maybeSingle(); const s = (data as any); if (s) setForm({ block_hours_on_fail: Number(s.block_hours_on_fail||24), max_reprobations: Number(s.max_reprobations||3), min_view_percentage: Number(s.min_view_percentage||90) }); else setForm({ block_hours_on_fail:24, max_reprobations:3, min_view_percentage:90 }); };
  useEffect(()=>{ loadFacs(); },[]);
  useEffect(()=>{ load(); },[facultyId]);
  const save = async()=>{ if (!facultyId) return; await supabase.from('ead_settings').upsert({ faculty_id: facultyId, block_hours_on_fail: form.block_hours_on_fail, max_reprobations: form.max_reprobations, min_view_percentage: form.min_view_percentage }); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Configurações EAD (por Faculdade)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <select className="border rounded px-2 py-1" value={facultyId} onChange={(e)=>setFacultyId(e.target.value)}>
            <option value="">Selecione a Matriz EAD</option>
            {faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name}</option>))}
          </select>
          {!!facultyId && (
            <div className="grid grid-cols-3 gap-2 items-center">
              <div className="space-y-1">
                <div className="text-xs">Bloqueio por reprovação (horas)</div>
                <Input type="number" value={form.block_hours_on_fail} onChange={(e)=>setForm(prev=>({ ...prev, block_hours_on_fail: Number(e.target.value||24) }))} />
              </div>
              <div className="space-y-1">
                <div className="text-xs">Máximo de reprovações</div>
                <Input type="number" value={form.max_reprobations} onChange={(e)=>setForm(prev=>({ ...prev, max_reprobations: Number(e.target.value||3) }))} />
              </div>
              <div className="space-y-1">
                <div className="text-xs">Presença mínima (%)</div>
                <Input type="number" step="0.01" value={form.min_view_percentage} onChange={(e)=>setForm(prev=>({ ...prev, min_view_percentage: Number(e.target.value||90) }))} />
              </div>
            </div>
          )}
          <Button onClick={save} disabled={!facultyId}>Salvar</Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

