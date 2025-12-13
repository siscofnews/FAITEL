import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ContentManage() {
  const [moduleId, setModuleId] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ type:"pdf", file_path:"" });
  const loadModules = async()=>{ const { data } = await supabase.from('ead_modules').select('id,title').order('title'); setModules(data||[]); };
  const load = async()=>{ if (!moduleId) { setRows([]); return; } const { data } = await supabase.from('ead_modules').select('id,title,content_url,video_url').eq('id', moduleId); setRows(data||[]); };
  useEffect(()=>{ loadModules(); },[]);
  useEffect(()=>{ load(); },[moduleId]);
  const salvar = async()=>{ if (!moduleId) return; await supabase.from('ead_modules').update({ content_url: form.type==='pdf'? form.file_path: rows[0]?.content_url, video_url: form.type!=='pdf'? form.file_path: rows[0]?.video_url }).eq('id', moduleId); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Conteúdos do Módulo</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1" value={moduleId} onChange={(e)=>setModuleId(e.target.value)}>
              <option value="">Selecione o Módulo</option>
              {modules.map((m:any)=>(<option key={m.id} value={m.id}>{m.title}</option>))}
            </select>
          </div>
          {!!moduleId && (
            <div className="grid grid-cols-4 gap-2 items-center">
              <select className="border rounded px-2 py-1" value={form.type} onChange={(e)=>setForm(prev=>({ ...prev, type:e.target.value }))}>
                <option value="pdf">PDF</option>
                <option value="video">Vídeo</option>
                <option value="youtube">YouTube</option>
              </select>
              <Input placeholder="Arquivo/URL" value={form.file_path} onChange={(e)=>setForm(prev=>({ ...prev, file_path:e.target.value }))} />
              <Button onClick={salvar}>Salvar</Button>
              {rows[0] && (<span className="text-xs">Conteúdo: {rows[0]?.content_url||''} • Vídeo: {rows[0]?.video_url||''}</span>)}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

