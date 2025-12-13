import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AssetDetail() {
  const { assetId } = useParams();
  const [asset, setAsset] = useState<any>(null);
  const [movs, setMovs] = useState<any[]>([]);
  const [defs, setDefs] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [defectDesc, setDefectDesc] = useState("");
  const [provider, setProvider] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [start, setStart] = useState<string>("");
  const [finish, setFinish] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);
  const { toast } = useToast();

  const load = async () => {
    if (!assetId) return;
    const { data: a } = await supabase.from("assets").select("*, churches(nome_fantasia), asset_categories(name)").eq("id", assetId).maybeSingle();
    setAsset(a);
    const { data: m } = await supabase.from("asset_movements").select("*").eq("asset_id", assetId).order("created_at", { ascending: false });
    setMovs(m || []);
    const { data: d } = await supabase.from("asset_defects").select("*").eq("asset_id", assetId).order("created_at", { ascending: false });
    setDefs(d || []);
    const { data: r } = await supabase.from("asset_repairs").select("*").eq("asset_id", assetId).order("started_at", { ascending: false });
    setReps(r || []);
  };

  useEffect(() => { load(); }, [assetId]);

  const addDefect = async () => {
    if (!assetId || !defectDesc) return;
    const { error } = await supabase.from("asset_defects").insert({ asset_id: assetId, description: defectDesc });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setDefectDesc("");
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
          <CardHeader><CardTitle>Patrimônio</CardTitle></CardHeader>
          <CardContent>
            {asset && (
              <div className="space-y-2">
                <div>{asset.code}</div>
                <div>{asset.name}</div>
                <div>{asset.asset_categories?.name}</div>
                <div>{asset.churches?.nome_fantasia}</div>
                <div>{asset.status}</div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Descrição do defeito" value={defectDesc} onChange={(e) => setDefectDesc(e.target.value)} />
                    <Button onClick={addDefect}>Abrir defeito</Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <Input placeholder="Fornecedor" value={provider} onChange={(e) => setProvider(e.target.value)} />
                    <Input type="number" placeholder="Custo" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
                    <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                    <Input type="date" value={finish} onChange={(e) => setFinish(e.target.value)} />
                    <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
                    <Button onClick={addRepair}>Iniciar/Finalizar conserto</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Movimentos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {movs.map((m) => (<div key={m.id} className="border p-2 rounded">{m.type} • {m.protocol_code}</div>))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Defeitos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {defs.map((d) => (<div key={d.id} className="border p-2 rounded">{d.description} • {d.status}</div>))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Consertos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reps.map((r) => (<div key={r.id} className="border p-2 rounded">{r.provider} • {Number(r.cost).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

