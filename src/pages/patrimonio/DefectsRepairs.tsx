import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function DefectsRepairs() {
  const { assetId } = useParams();
  const { toast } = useToast();
  const [asset, setAsset] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [defectDesc, setDefectDesc] = useState("");
  const [provider, setProvider] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [start, setStart] = useState<string>("");
  const [finish, setFinish] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);

  const load = async () => {
    if (!assetId) return;
    const { data: a } = await supabase.from("assets").select("*").eq("id", assetId).maybeSingle();
    setAsset(a);
    const { data: d } = await supabase.from("asset_defects").select("*").eq("asset_id", assetId).order("created_at", { ascending: false });
    setDefects(d || []);
    const { data: r } = await supabase.from("asset_repairs").select("*").eq("asset_id", assetId).order("started_at", { ascending: false });
    setRepairs(r || []);
  };

  useEffect(() => { load(); }, [assetId]);

  const addDefect = async () => {
    if (!assetId || !defectDesc) return;
    const { error } = await supabase.from("asset_defects").insert({ asset_id: assetId, description: defectDesc });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setDefectDesc("");
    await load();
  };

  const setDefectStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("asset_defects").update({ status }).eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await load();
  };

  const addRepair = async () => {
    if (!assetId) return;
    try {
      let urls: string[] = [];
      if (files && files.length) {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const ext = f.name.split(".").pop();
          const name = `${assetId}/repair-${Date.now()}-${i}.${ext}`;
          const { error: upErr } = await supabase.storage.from("siscof-assets").upload(name, f);
          if (upErr) throw upErr;
          const { data: { publicUrl } } = supabase.storage.from("siscof-assets").getPublicUrl(name);
          urls.push(publicUrl);
        }
      }
      const { error } = await supabase.from("asset_repairs").insert({ asset_id: assetId, provider, cost, started_at: start || null, finished_at: finish || null, files: urls.length ? urls : null });
      if (error) throw error;
      // status transitions
      if (start && !finish) await supabase.from("assets").update({ status: "EM_REPARO" }).eq("id", assetId);
      if (finish) await supabase.from("assets").update({ status: "ATIVO" }).eq("id", assetId);
      setProvider(""); setCost(0); setStart(""); setFinish(""); setFiles(null);
      await load();
      toast({ title: "Conserto registrado" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Defeitos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Descrição do defeito" value={defectDesc} onChange={(e) => setDefectDesc(e.target.value)} />
              <Button onClick={addDefect}>Adicionar</Button>
            </div>
            <div className="space-y-2">
              {defects.map((d) => (
                <div key={d.id} className="border p-2 rounded flex items-center justify-between">
                  <div>
                    <div>{d.description}</div>
                    <div className="text-xs text-muted-foreground">{d.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDefectStatus(d.id, "em_conserto")}>Em conserto</Button>
                    <Button variant="secondary" size="sm" onClick={() => setDefectStatus(d.id, "resolvido")}>Resolvido</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Consertos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Oficina/Fornecedor" value={provider} onChange={(e) => setProvider(e.target.value)} />
            <Input type="number" placeholder="Custo" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
            <div className="flex gap-2">
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              <Input type="date" value={finish} onChange={(e) => setFinish(e.target.value)} />
            </div>
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            <Button onClick={addRepair}>Registrar Conserto</Button>
            <div className="space-y-2">
              {repairs.map((r) => (
                <div key={r.id} className="border p-2 rounded">
                  <div>{r.provider} • {Number(r.cost).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

