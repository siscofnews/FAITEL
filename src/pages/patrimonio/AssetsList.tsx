import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";

export default function AssetsList() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const load = async () => {
    const states = user?.id ? await getUserScopeStates(user.id) : [];
    let query = supabase
      .from("assets")
      .select("id, code, name, quantity, unit_value, total_value, status, asset_categories(name), churches(nome_fantasia, estado)")
      .eq("assets.status", status === "all" ? "assets.status" : status);
    if (states.length) query = query.in("churches.estado", states);
    if (category !== "all") query = query.eq("category_id", category);
    const { data } = await query;
    const filtered = (data || []).filter((a: any) => {
      const term = search.toLowerCase();
      return !term || (a.name || "").toLowerCase().includes(term) || (a.code || "").toLowerCase().includes(term);
    });
    setAssets(filtered);
  };

  useEffect(() => { load(); }, [search, status, category]);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Patrimônio</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ATIVO">Ativo</SelectItem>
              <SelectItem value="EMPRESTADO">Emprestado</SelectItem>
              <SelectItem value="EM_REPARO">Em reparo</SelectItem>
              <SelectItem value="DOADO">Doado</SelectItem>
              <SelectItem value="BAIXADO">Baixado</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={load}>Atualizar</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Qtde</TableHead>
                <TableHead>Unitário</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Igreja</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{a.code}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.asset_categories?.name}</TableCell>
                  <TableCell>{a.quantity}</TableCell>
                  <TableCell>{Number(a.unit_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>{Number(a.total_value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>{a.churches?.nome_fantasia}</TableCell>
                  <TableCell>{a.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

