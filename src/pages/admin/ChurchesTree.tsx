import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function ChurchesTree() {
  const [root, setRoot] = useState<string>("");
  const [churches, setChurches] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  useEffect(()=>{ (async () => { const { data } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia'); setChurches(data||[]); })(); },[]);
  useEffect(()=>{ (async () => { if (!root) return; const { data } = await supabase.rpc('get_church_tree', { _root: root }); setNodes((data as any) || []); })(); },[root]);
  const parents: Record<string, string[]> = {};
  nodes.forEach((n:any)=>{ const p = n.parent_church_id || 'root'; if (!parents[p]) parents[p]=[]; parents[p].push(n.id); });
  const byId: Record<string, any> = {}; nodes.forEach((n:any)=>{ byId[n.id]=n });
  const render = (id: string) => {
    const children = parents[id] || [];
    return (
      <ul className="ml-4">
        {children.map(cid => (
          <li key={cid}>
            <span className="font-medium">{byId[cid]?.nome_fantasia} • {byId[cid]?.nivel}</span>
            {render(cid)}
          </li>
        ))}
      </ul>
    );
  };
  const rootNode = nodes.find(n=>n.parent_church_id===null) || nodes[0];
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Árvore de Unidades</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Select value={root} onValueChange={setRoot}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja raiz" /></SelectTrigger><SelectContent>{churches.map(c=>(<SelectItem key={c.id} value={c.id}>{c.nome_fantasia}</SelectItem>))}</SelectContent></Select>
          </div>
          {rootNode && (
            <div>
              <div className="font-bold">{rootNode?.nome_fantasia} • {rootNode?.nivel}</div>
              {render(rootNode?.id)}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

