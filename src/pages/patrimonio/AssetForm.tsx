import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";

export default function AssetForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [churches, setChurches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ church_id: "", category_id: "", name: "", description: "", quantity: 1, unit_value: 0, status: "ATIVO", files: [] as string[] });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const states = user?.id ? await getUserScopeStates(user.id) : [];
    const { data: ch } = await supabase.from("churches").select("id,nome_fantasia,estado").in(states.length ? "estado" : "id", states.length ? states : undefined as any);
    const { data: cats } = await supabase.from("asset_categories").select("id,name");
    setChurches(ch || []);
    setCategories(cats || []);
  };

  useEffect(() => { load(); }, []);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ext = f.name.split(".").pop();
        const name = `${form.church_id || "misc"}/asset-${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage.from("siscof-assets").upload(name, f);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("siscof-assets").getPublicUrl(name);
        urls.push(publicUrl);
      }
      setForm((prev: any) => ({ ...prev, files: [...prev.files, ...urls] }));
      toast({ title: "Arquivos enviados" });
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      if (!form.church_id || !form.name) throw new Error("Dados obrigatórios");
      const { data: codeRow, error: codeErr } = await supabase.rpc("generate_asset_code_by_church", { _church_id: form.church_id });
      if (codeErr) throw codeErr;
      const code = codeRow as any;
      const { error } = await supabase.from("assets").insert({ ...form, code });
      if (error) throw error;
      toast({ title: "Patrimônio cadastrado" });
      navigate("/patrimonio/itens");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Novo Patrimônio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={form.church_id} onValueChange={(v) => setForm((p: any) => ({ ...p, church_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Igreja" /></SelectTrigger>
            <SelectContent>
              {churches.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome_fantasia}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={form.category_id || ""} onValueChange={(v) => setForm((p: any) => ({ ...p, category_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input placeholder="Nome" value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} />
          <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))} />
          <div className="flex gap-2">
            <Input type="number" placeholder="Quantidade" value={form.quantity} onChange={(e) => setForm((p: any) => ({ ...p, quantity: Number(e.target.value) }))} />
            <Input type="number" placeholder="Valor unitário" value={form.unit_value} onChange={(e) => setForm((p: any) => ({ ...p, unit_value: Number(e.target.value) }))} />
          </div>
          <Select value={form.status} onValueChange={(v) => setForm((p: any) => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ATIVO">Ativo</SelectItem>
              <SelectItem value="EMPRESTADO">Emprestado</SelectItem>
              <SelectItem value="EM_REPARO">Em reparo</SelectItem>
              <SelectItem value="DOADO">Doado</SelectItem>
              <SelectItem value="BAIXADO">Baixado</SelectItem>
            </SelectContent>
          </Select>
          <input type="file" multiple onChange={(e) => uploadFiles(e.target.files)} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={uploading}>Salvar</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

