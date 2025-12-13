import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MovementForm() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [asset, setAsset] = useState<any>(null);
  const [type, setType] = useState("emprestimo");
  const [quantity, setQuantity] = useState(1);
  const [destination, setDestination] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string>("");

  const load = async () => {
    if (!assetId) return;
    const { data } = await supabase.from("assets").select("*").eq("id", assetId).maybeSingle();
    setAsset(data);
  };

  useEffect(() => { load(); }, [assetId]);

  const uploadSignature = async (file: File | null) => {
    if (!file) return;
    const ext = file.name.split(".").pop();
    const name = `${assetId}/sig-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("digital-signatures").upload(name, file);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("digital-signatures").getPublicUrl(name);
    setSignatureUrl(publicUrl);
  };

  const save = async () => {
    if (!assetId) return;
    const { data: protocol } = await supabase.rpc("generate_protocol_code");
    const { error } = await supabase.from("asset_movements").insert({ asset_id: assetId, type, protocol_code: protocol as any, quantity, destination, signatures: signatureUrl ? { pastor: signatureUrl } : null });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    const statusMap: Record<string, string> = { emprestimo: "EMPRESTADO", doacao: "DOADO", retirada: "BAIXADO", retorno: "ATIVO" };
    const { error: upErr } = await supabase.from("assets").update({ status: statusMap[type] }).eq("id", assetId);
    if (upErr) { toast({ title: "Erro", description: upErr.message, variant: "destructive" }); return; }
    toast({ title: "Movimento registrado" });
    navigate(`/patrimonio/item/${assetId}`);
  };

  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Movimentar Patrimônio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="emprestimo">Empréstimo</SelectItem>
              <SelectItem value="doacao">Doação</SelectItem>
              <SelectItem value="retirada">Retirada</SelectItem>
              <SelectItem value="retorno">Retorno</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="Quantidade" />
          <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destino" />
          <input type="file" onChange={(e) => uploadSignature(e.target.files?.[0] || null)} />
          <div className="flex gap-2">
            <Button onClick={save}>Salvar</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

