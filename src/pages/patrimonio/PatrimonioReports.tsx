import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserScopeStates } from "@/wiring/accessScope";
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatrimonioReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [churches, setChurches] = useState<any[]>([]);
  const [root, setRoot] = useState<string>("");
  const [totals, setTotals] = useState<any>({ total_value: 0, total_items: 0 });
  const [byCat, setByCat] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [editingSaving, setEditingSaving] = useState(false);
  const palettes: Record<string, string[]> = {
    Default: ["#4f46e5", "#16a34a", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"],
    Cool: ["#0ea5e9", "#6366f1", "#22d3ee", "#14b8a6", "#06b6d4", "#0891b2"],
    Warm: ["#f97316", "#f59e0b", "#ef4444", "#e11d48", "#fb7185", "#d946ef"],
    Mono: ["#1f2937", "#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db"],
  };
  const [paletteKey, setPaletteKey] = useState<string>(() => localStorage.getItem('patrimonio_palette_key') || "Default");
  const [customPalette, setCustomPalette] = useState<string[]>(() => {
    try { const raw = localStorage.getItem('patrimonio_palette_custom'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const currentPalette = paletteKey === 'Custom' ? (customPalette.length ? customPalette : palettes.Default) : (palettes[paletteKey] || palettes.Default);
  useEffect(() => { localStorage.setItem('patrimonio_palette_key', paletteKey); }, [paletteKey]);
  const BR_STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadChurches = async () => {
    const scopeStates = user?.id ? await getUserScopeStates(user.id) : [];
    const states = selectedStates.length ? selectedStates : scopeStates;
    const { data } = await supabase.from("churches").select("id,nome_fantasia,estado").in(states.length ? "estado" : "id", states.length ? states : undefined as any).order("nome_fantasia");
    setChurches(data || []);
  };
  const loadReports = async () => {
    if (!root) return;
    const usePeriod = !!startDate || !!endDate;
    const { data: t } = usePeriod
      ? await supabase.rpc("asset_totals_by_root_period", { _root: root, _start: startDate || null, _end: endDate || null })
      : await supabase.rpc("asset_totals_by_root", { _root: root });
    if (t && t.length) setTotals({ total_value: t[0].total_value, total_items: t[0].total_items });
    const { data: c } = usePeriod
      ? await supabase.rpc("asset_totals_by_category_period", { _root: root, _start: startDate || null, _end: endDate || null })
      : await supabase.rpc("asset_totals_by_category", { _root: root });
    setByCat(c || []);
  };

  useEffect(() => { loadChurches(); }, []);
  useEffect(() => { loadChurches(); }, [selectedStates.join(";")]);
  useEffect(() => { loadReports(); }, [startDate, endDate]);
  useEffect(() => { loadReports(); }, [root]);

  const exportCSV = () => {
    exportToCSV(byCat, `patrimonio-categorias-${new Date().toISOString().split('T')[0]}`, [
      { key: "category_name", label: "Categoria" },
      { key: "total_items", label: "Itens" },
      { key: "total_value", label: "Valor Total" },
    ]);
  };
  const exportXLSX = () => {
    exportToExcel(byCat, `patrimonio-categorias-${new Date().toISOString().split('T')[0]}`, [
      { key: "category_name", label: "Categoria" },
      { key: "total_items", label: "Itens" },
      { key: "total_value", label: "Valor Total" },
    ]);
  };
  const exportKPIsWithColorsCSV = () => {
    const rows = byCat.map((row, i) => ({ category_name: row.category_name, total_items: row.total_items, total_value: row.total_value, color: currentPalette[i % currentPalette.length] }));
    exportToCSV(rows, `patrimonio-kpis-${new Date().toISOString().split('T')[0]}`, [
      { key: "category_name", label: "Categoria" },
      { key: "total_items", label: "Itens" },
      { key: "total_value", label: "Valor Total" },
      { key: "color", label: "Cor" },
    ]);
  };
  const exportKPIsWithColorsXLSX = () => {
    const rows = byCat.map((row, i) => ({ category_name: row.category_name, total_items: row.total_items, total_value: row.total_value, color: currentPalette[i % currentPalette.length] }));
    exportToExcel(rows, `patrimonio-kpis-${new Date().toISOString().split('T')[0]}`, [
      { key: "category_name", label: "Categoria" },
      { key: "total_items", label: "Itens" },
      { key: "total_value", label: "Valor Total" },
      { key: "color", label: "Cor" },
    ]);
  };
  const addCustomColor = (hex: string) => {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) { toast({ title: 'Cor inválida', variant: 'destructive' }); return; }
    const next = [...customPalette, hex];
    setCustomPalette(next);
    localStorage.setItem('patrimonio_palette_custom', JSON.stringify(next));
  };
  const removeCustomColor = (idx: number) => {
    const next = customPalette.filter((_, i) => i !== idx);
    setCustomPalette(next);
    localStorage.setItem('patrimonio_palette_custom', JSON.stringify(next));
  };
  const avgValue = byCat.length ? (byCat.reduce((s, r) => s + Number(r.total_value || 0), 0) / byCat.length) : 0;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Relatórios de Patrimônio</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>Exportar CSV</Button>
          <Button onClick={exportXLSX}>Exportar Excel</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Selecione a igreja raiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={root} onValueChange={setRoot}>
            <SelectTrigger><SelectValue placeholder="Igreja raiz" /></SelectTrigger>
            <SelectContent>
              {churches.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome_fantasia}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Paleta</span>
            <Select value={paletteKey} onValueChange={setPaletteKey}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(palettes).map(k => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              {currentPalette.slice(0,5).map((c,i)=>(<span key={i} style={{ background:c, width:16, height:16, borderRadius:4, border:"1px solid #ddd" }} />))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {BR_STATES.map(uf => (
              <Button key={uf} size="sm" variant={selectedStates.includes(uf) ? "secondary" : "outline"} onClick={() => setSelectedStates(prev => prev.includes(uf) ? prev.filter(s => s !== uf) : [...prev, uf])}>{uf}</Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setSelectedStates([])}>Limpar estados</Button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Período</span>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }}>Limpar período</Button>
            </div>
          </div>
          {paletteKey === 'Custom' && (
            <div className="flex items-center gap-2">
              <Input placeholder="#hex" className="w-32" id="customHex" />
              <Button variant="outline" onClick={() => { const el = document.getElementById('customHex') as HTMLInputElement | null; addCustomColor(el?.value || ''); }}>Adicionar cor</Button>
              <div className="flex items-center gap-1">
                {customPalette.map((c,i)=>(
                  <div key={i} className="flex items-center gap-1">
                    <span style={{ background:c, width:16, height:16, borderRadius:4, border:"1px solid #ddd" }} />
                    <Button variant="ghost" size="sm" onClick={() => removeCustomColor(i)}>x</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle>Itens</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totals.total_items}</CardContent></Card>
            <Card><CardHeader><CardTitle>Valor Total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{Number(totals.total_value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</CardContent></Card>
            <div />
          </div>
          <div className="space-y-2">
            {byCat
              .slice()
              .sort((a,b)=>Number(b.total_value||0)-Number(a.total_value||0))
              .map((row, idx) => (
                <div key={row.category_id} className="border p-2 rounded flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {editingId === row.category_id ? (
                      <div className="flex items-center gap-2">
                        <Input className="w-48" value={editingName} onChange={(e) => {
                          const v = e.target.value;
                          if (/^[\w\s\-]{0,100}$/.test(v)) setEditingName(v);
                        }} />
                        <Button size="sm" disabled={editingSaving} onClick={async () => {
                          const name = editingName.trim(); if (!name) { toast({ title: 'Nome obrigatório', variant: 'destructive' }); return; }
                          setEditingSaving(true);
                          try {
                            const { data: exists } = await supabase.from('asset_categories').select('id').eq('name', name).neq('id', row.category_id).limit(1);
                            if (exists && exists.length) { toast({ title: 'Conflito de nome', description: 'Já existe categoria com este nome', variant: 'destructive' }); return; }
                            const { error } = await supabase.from('asset_categories').update({ name }).eq('id', row.category_id);
                            if (error) { toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' }); return; }
                            toast({ title: 'Categoria atualizada' });
                            setEditingId(null); setEditingName('');
                            loadReports();
                          } finally { setEditingSaving(false); }
                        }}>Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditingName(''); }}>Cancelar</Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const hash = Array.from(name || row.category_name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
                          const suggested = currentPalette[hash % currentPalette.length];
                          addCustomColor(suggested);
                          toast({ title: 'Sugestão aplicada', description: suggested });
                        }}>Aplicar cor sugerida</Button>
                      </div>
                    ) : (
                      <span>{row.category_name}</span>
                    )}
                    {idx < Math.max(1, Math.ceil(byCat.length * 0.1)) && <Badge variant="secondary">Top 10%</Badge>}
                    {Number(row.total_value || 0) >= avgValue && <Badge variant="outline">Acima da média</Badge>}
                    {Number(row.total_items || 0) === 0 && <Badge variant="destructive">Sem ativos</Badge>}
                    <span style={{ background: currentPalette[idx % currentPalette.length], width: 12, height: 12, borderRadius: 2 }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{row.total_items} • {Number(row.total_value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    {editingId !== row.category_id && (
                      <Button variant="ghost" size="sm" onClick={() => { setEditingId(row.category_id); setEditingName(row.category_name); }}><Pencil className="h-4 w-4" /></Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={async () => {
                      if (!confirm('Excluir categoria?')) return;
                      const { error } = await supabase.from('asset_categories').delete().eq('id', row.category_id);
                      if (error) { toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' }); return; }
                      toast({ title: 'Categoria excluída' });
                      loadReports();
                    }}><Trash2 className="h-4 w-4" /></Button>
                    {Number(row.total_items || 0) === 0 && <span className="text-xs text-muted-foreground">Exclusão segura</span>}
                  </div>
                </div>
              ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader><CardTitle>Itens por Categoria</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCat}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category_name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_items" fill={currentPalette[0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Valor por Categoria</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCat} dataKey="total_value" nameKey="category_name" outerRadius={100}>
                      {byCat.map((_, i) => (<Cell key={i} fill={currentPalette[i % currentPalette.length]} />))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              const meta = { states: selectedStates, root, startDate, endDate };
              const rows = byCat.map((row, i) => ({ category_name: row.category_name, total_items: row.total_items, total_value: row.total_value, color: currentPalette[i % currentPalette.length], meta }));
              exportToCSV(rows, `patrimonio-kpis-${new Date().toISOString().split('T')[0]}`, [
                { key: "category_name", label: "Categoria" },
                { key: "total_items", label: "Itens" },
                { key: "total_value", label: "Valor Total" },
                { key: "color", label: "Cor" },
                { key: "meta", label: "Metadata" },
              ]);
            }}>Exportar KPIs CSV</Button>
            <Button onClick={() => {
              const meta = { states: selectedStates, root, startDate, endDate };
              const rows = byCat.map((row, i) => ({ category_name: row.category_name, total_items: row.total_items, total_value: row.total_value, color: currentPalette[i % currentPalette.length], states: selectedStates.join(','), root, startDate, endDate }));
              exportToExcel(rows, `patrimonio-kpis-${new Date().toISOString().split('T')[0]}`, [
                { key: "category_name", label: "Categoria" },
                { key: "total_items", label: "Itens" },
                { key: "total_value", label: "Valor Total" },
                { key: "color", label: "Cor" },
                { key: "states", label: "Estados" },
                { key: "root", label: "Igreja Raiz" },
                { key: "startDate", label: "Início" },
                { key: "endDate", label: "Fim" },
              ]);
            }}>Exportar KPIs Excel</Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

