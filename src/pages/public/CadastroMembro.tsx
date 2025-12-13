import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

export default function CadastroMembro() {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [churches, setChurches] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ full_name: "", birth_date: "", email: "", phone: "", church_id: "", is_tither: false, is_offeror: false });
  const [uploading, setUploading] = useState(false);
  useEffect(() => { (async () => {
    const pre = params.get('igreja') || '';
    const { data } = await supabase.from('churches_public').select('id,nome_fantasia');
    setChurches(data || []);
    if (pre) setForm((p:any)=>({ ...p, church_id: pre }));
  })(); }, []);

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const name = `${form.church_id || 'public'}/member-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('member-photos').upload(name, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('member-photos').getPublicUrl(name);
      setForm((p:any)=>({ ...p, photo_path: publicUrl }));
      toast({ title: 'Foto enviada' });
    } catch (e:any) { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); }
    finally { setUploading(false); }
  };

  const save = async () => {
    try {
      if (!form.full_name || !form.birth_date || !form.church_id) { toast({ title: 'Preencha campos obrigatórios', variant: 'destructive' }); return; }
      const { data: m, error } = await supabase
        .from('members')
        .insert({ full_name: form.full_name, birth_date: form.birth_date, email: form.email, phone: form.phone, church_id: form.church_id, is_active: false, is_tither: form.is_tither, is_offeror: form.is_offeror })
        .select('id')
        .single();
      if (error) throw error;
      if (form.photo_path) await supabase.from('member_profiles').upsert({ member_id: m.id, photo_path: form.photo_path });
      await supabase.rpc('assign_member_department', { m_id: m.id });
      toast({ title: 'Cadastro enviado' });
    } catch (e:any) { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto max-w-2xl py-6">
      <Card>
        <CardHeader><CardTitle>Cadastro de Membro / Congregado</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Nome completo" value={form.full_name} onChange={(e)=>setForm((p:any)=>({ ...p, full_name: e.target.value }))} />
          <div className="flex gap-2">
            <Input type="date" value={form.birth_date} onChange={(e)=>setForm((p:any)=>({ ...p, birth_date: e.target.value }))} />
            <Input placeholder="Email" value={form.email} onChange={(e)=>setForm((p:any)=>({ ...p, email: e.target.value }))} />
            <Input placeholder="Telefone" value={form.phone} onChange={(e)=>setForm((p:any)=>({ ...p, phone: e.target.value }))} />
          </div>
          <Select value={form.church_id} onValueChange={(v)=>setForm((p:any)=>({ ...p, church_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
            <SelectContent>
              {churches.map(c => (<SelectItem key={c.id} value={c.id}>{c.nome_fantasia}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_tither} onChange={(e)=>setForm((p:any)=>({ ...p, is_tither: e.target.checked }))} /> Dízimista
            <input type="checkbox" checked={form.is_offeror} onChange={(e)=>setForm((p:any)=>({ ...p, is_offeror: e.target.checked }))} /> Ofertante
          </div>
          <input type="file" accept="image/*" onChange={(e)=>onUpload(e.target.files?.[0]||null)} />
          <Button onClick={save} disabled={uploading}>Enviar</Button>
        </CardContent>
      </Card>
    </div>
  );
}

