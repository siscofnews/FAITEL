import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function CredentialBatchIssue() {
  const [churches, setChurches] = useState<any[]>([]);
  const [root, setRoot] = useState<string>("");
  const [type, setType] = useState<'member'|'convention'|'student'>('member');
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const loadChurches = async () => { const { data } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setChurches(data||[]); };
  const loadMembers = async () => { if (!root) return; const { data } = await supabase.from('members').select('id,full_name,church_id').eq('church_id', root).order('full_name'); setMembers(data||[]); };
  useEffect(()=>{ loadChurches(); },[]);
  useEffect(()=>{ loadMembers(); },[root]);
  const issue = async () => { const ids = members.filter(m=>selected[m.id]).map(m=>m.id); for (const id of ids) { await supabase.rpc('ensure_credential_number', { _member: id, _type: type }); } };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Emissão em Lote</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={root} onValueChange={setRoot}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{churches.map(c=>(<SelectItem key={c.id} value={c.id}>{c.nome_fantasia}</SelectItem>))}</SelectContent></Select>
            <Select value={type} onValueChange={(v:any)=>setType(v)}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member">Membro</SelectItem><SelectItem value="convention">Convenção</SelectItem><SelectItem value="student">Aluno EAD</SelectItem></SelectContent></Select>
            <Button onClick={issue}>Emitir números</Button>
          </div>
          <div className="space-y-2">
            {members.map(m=>(
              <div key={m.id} className="border p-2 rounded flex justify-between">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!selected[m.id]} onChange={(e)=>setSelected(prev=>({ ...prev, [m.id]: e.target.checked }))} />{m.full_name}</label>
                <span className="text-xs">{m.id.slice(0,8)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

