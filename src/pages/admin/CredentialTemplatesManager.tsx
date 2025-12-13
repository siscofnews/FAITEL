import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DndContext, useDraggable } from "@dnd-kit/core";

export default function CredentialTemplatesManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [churchId, setChurchId] = useState<string>("");
  const [churches, setChurches] = useState<any[]>([]);
  const [type, setType] = useState<'member'|'convention'|'student'>('member');
  const [templates, setTemplates] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [side, setSide] = useState<'front'|'back'>('front');
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const presets = [
    { label: 'Nome Completo', key: 'member.full_name' },
    { label: 'Cargo', key: 'member.role' },
    { label: 'Departamento', key: 'department.name' },
    { label: 'Igreja', key: 'church.name' },
    { label: 'Foto', key: 'profile.photo_path', image: true },
    { label: 'Número da Credencial', key: 'credential.number' },
    { label: 'QR de Validação', key: 'credential.qr', qr: true },
    { label: 'Curso EAD', key: 'student.class_name' },
    { label: 'Convenção Estadual', key: 'profile.state_convention' },
    { label: 'Convenção Geral', key: 'profile.general_convention' },
    { label: 'Curso Teológico', key: 'profile.theology_course' },
    { label: 'Instituição', key: 'profile.theology_institution' },
    { label: 'Nacionalidade', key: 'profile.nationality' },
    { label: 'Naturalidade', key: 'profile.naturality' },
    { label: 'Nascimento', key: 'member.birth_date' },
    { label: 'RG', key: 'profile.rg' },
    { label: 'CPF', key: 'profile.cpf' },
    { label: 'Estado Civil', key: 'profile.marital_status' },
    { label: 'Filiação (Pai)', key: 'member_profiles.father_name' },
    { label: 'Filiação (Mãe)', key: 'member_profiles.mother_name' },
    { label: 'Membro Desde', key: 'member.member_since' },
    { label: 'Validade', key: 'member.cred_valid_until' },
    { label: 'QR Assinatura', key: 'credential.signature_qr', qr: true },
  ];

  const loadChurches = async () => {
    const { data } = await supabase.from('churches').select('id,nome_fantasia').order('nome_fantasia');
    setChurches(data || []);
  };
  const applyPresetIADMA = async () => {
    if (!current?.id) return;
    const layoutFront = [
      { name: 'NOME', key: 'member.full_name', x: 40, y: 300, w: 500, h: 28, font_size: 16, bold: true },
      { name: 'FUNÇÃO', key: 'member.role', x: 40, y: 360, w: 260, h: 24, font_size: 14, bold: true },
      { name: 'CONGREGAÇÃO', key: 'church.name', x: 320, y: 360, w: 260, h: 24, font_size: 14, bold: true },
      { name: 'Nº', key: 'credential.number', x: 600, y: 360, w: 220, h: 24, font_size: 14, bold: true },
      { name: 'Ordenado', key: 'member.dating_date', x: 600, y: 430, w: 220, h: 24, font_size: 14 },
      { name: 'Foto', key: 'profile.photo_path', x: 720, y: 240, w: 160, h: 200, is_image: true },
      { name: 'Assinatura do portador', key: 'credential.signature_url', x: 40, y: 430, w: 520, h: 40, is_image: true },
      { name: 'QR Validação', key: 'credential.qr', x: 720, y: 470, w: 120, h: 120, is_qr: true },
    ];
    const layoutBack = [
      { name: 'Nacionalidade', key: 'profile.nationality', x: 40, y: 80, w: 220, h: 24 },
      { name: 'Naturalidade', key: 'profile.naturality', x: 300, y: 80, w: 220, h: 24 },
      { name: 'Nascimento', key: 'member.birth_date', x: 560, y: 80, w: 220, h: 24 },
      { name: 'RG', key: 'profile.rg', x: 40, y: 140, w: 220, h: 24 },
      { name: 'CPF', key: 'profile.cpf', x: 300, y: 140, w: 220, h: 24 },
      { name: 'Estado Civil', key: 'profile.marital_status', x: 560, y: 140, w: 220, h: 24 },
      { name: 'Filiação', key: 'member_profiles.father_name', x: 40, y: 210, w: 740, h: 24 },
      { name: 'Filiação 2', key: 'member_profiles.mother_name', x: 40, y: 240, w: 740, h: 24 },
      { name: 'Membro Desde', key: 'member.member_since', x: 580, y: 300, w: 200, h: 24 },
      { name: 'Validade', key: 'member.cred_valid_until', x: 580, y: 340, w: 200, h: 24 },
      { name: 'QR Assinatura', key: 'credential.signature_qr', x: 700, y: 400, w: 120, h: 120, is_qr: true },
    ];
    const layout = (current.side === 'front') ? layoutFront : layoutBack;
    for (const f of layout) {
      const { error } = await supabase.from('credential_fields').insert({ template_id: current.id, name: f.name, source_key: f.key, x: f.x, y: f.y, w: f.w, h: f.h, font_size: f.font_size || 12, bold: !!f.bold, is_image: !!f.is_image, is_qr: !!f.is_qr });
      if (error) { toast({ title:'Erro cenário', description:error.message, variant:'destructive' }); return; }
    }
    loadFields();
  };
  const applyPresetIADMAExact = async () => {
    if (!current?.id) return;
    const front = [
      { name: 'NOME', key: 'member.full_name', x: 40, y: 210, w: 600, h: 38, font_size: 16, bold: true },
      { name: 'TIPO SANGUÍNEO', key: 'profile.blood_type', x: 40, y: 270, w: 160, h: 28 },
      { name: 'RG', key: 'profile.rg', x: 220, y: 270, w: 180, h: 28 },
      { name: 'CPF', key: 'profile.cpf', x: 420, y: 270, w: 220, h: 28 },
      { name: 'MATRÍCULA', key: 'credential.number', x: 40, y: 320, w: 160, h: 28 },
      { name: 'DATA DE NASC.', key: 'member.birth_date', x: 220, y: 320, w: 180, h: 28 },
      { name: 'NATURALIDADE', key: 'profile.naturality', x: 420, y: 320, w: 220, h: 28 },
      { name: 'BATISADO', key: 'member.baptism_water_date', x: 40, y: 370, w: 160, h: 28 },
      { name: 'FUNÇÃO ECLESIASTICA', key: 'member.role', x: 220, y: 370, w: 220, h: 28 },
      { name: 'CAMPO OU CONGREGAÇÃO', key: 'church.name', x: 460, y: 370, w: 180, h: 28 },
      { name: 'FOTO', key: 'profile.photo_path', x: 720, y: 210, w: 150, h: 230, is_image: true },
    ];
    const back = [
      { name: 'PAI', key: 'member_profiles.father_name', x: 40, y: 40, w: 740, h: 30 },
      { name: 'MÃE', key: 'member_profiles.mother_name', x: 40, y: 90, w: 740, h: 30 },
      { name: 'ESTADO CIVIL', key: 'profile.marital_status', x: 40, y: 140, w: 240, h: 28 },
      { name: 'EXPEDIÇÃO', key: 'member.member_since', x: 320, y: 140, w: 240, h: 28 },
      { name: 'VALIDADE', key: 'member.cred_valid_until', x: 600, y: 140, w: 180, h: 28 },
      { name: 'QR Assinatura', key: 'credential.signature_qr', x: 710, y: 410, w: 120, h: 120, is_qr: true },
    ];
    const layout = current.side === 'front' ? front : back;
    for (const f of layout) {
      const { error } = await supabase.from('credential_fields').insert({ template_id: current.id, name: f.name, source_key: f.key, x: f.x, y: f.y, w: f.w, h: f.h, font_size: f.font_size || 12, bold: !!f.bold, is_image: !!f.is_image, is_qr: !!f.is_qr });
      if (error) { toast({ title:'Erro preset', description:error.message, variant:'destructive' }); return; }
    }
    loadFields();
  };
  const loadTemplates = async () => {
    if (!churchId) return;
    const { data } = await supabase.from('credential_templates').select('*').eq('church_id', churchId).order('created_at', { ascending: false });
    setTemplates(data || []);
  };
  useEffect(()=>{ loadChurches(); },[]);
  useEffect(()=>{ loadTemplates(); },[churchId]);

  const uploadImage = async (file: File | null) => {
    if (!file || !churchId) return;
    const ext = file.name.split('.').pop();
    const name = `${churchId}/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('credential-templates').upload(name, file);
    if (error) { toast({ title:'Erro no upload', description:error.message, variant:'destructive' }); return; }
    const { data: { publicUrl } } = supabase.storage.from('credential-templates').getPublicUrl(name);
    const { data: t, error: terr } = await supabase.from('credential_templates').insert({ church_id: churchId, type, image_url: publicUrl, side }).select('*').single();
    if (terr) { toast({ title:'Erro ao salvar', description:terr.message, variant:'destructive' }); return; }
    setCurrent(t);
    toast({ title:'Template criado' });
    loadTemplates();
  };

  const addField = async () => {
    if (!current?.id) return;
    const f = { template_id: current.id, name: `Campo ${fields.length+1}`, source_key: 'member.full_name', x: 20, y: 20, w: 160, h: 24, font_size: 12, color: '#000', align: 'left', bold: false, is_image: false };
    const { data, error } = await supabase.from('credential_fields').insert(f).select('*').single();
    if (error) { toast({ title:'Erro', description:error.message, variant:'destructive' }); return; }
    setFields(prev => [...prev, data]);
  };
  const addPresetField = async (key: string, opts?: any) => {
    if (!current?.id) return;
    const f = { template_id: current.id, name: key, source_key: key, x: 20, y: 20, w: 160, h: 24, font_size: 12, color: '#000', align: 'left', bold: false, is_image: !!opts?.image, is_qr: !!opts?.qr };
    const { data, error } = await supabase.from('credential_fields').insert(f).select('*').single();
    if (error) { toast({ title:'Erro', description:error.message, variant:'destructive' }); return; }
    setFields(prev => [...prev, data]);
  };

  const loadFields = async () => {
    if (!current?.id) return;
    const { data } = await supabase.from('credential_fields').select('*').eq('template_id', current.id);
    setFields(data || []);
  };
  useEffect(()=>{ loadFields(); },[current?.id]);

  const updateField = async (id: string, patch: any) => {
    const { error } = await supabase.from('credential_fields').update(patch).eq('id', id);
    if (error) { toast({ title:'Erro', description:error.message, variant:'destructive' }); return; }
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const onDragMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!current) return;
    const rect = (e.currentTarget.parentElement as HTMLDivElement).getBoundingClientRect();
    const nx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ny = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const ids = selectedFieldIds.length ? selectedFieldIds : [id];
    ids.forEach(fid => updateField(fid, { x: Math.round(nx), y: Math.round(ny) }));
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedFieldIds.length) return;
    const step = e.shiftKey ? 5 : 1;
    let patch: any = {};
    if (e.key === 'ArrowLeft') patch = { xDelta: -step };
    if (e.key === 'ArrowRight') patch = { xDelta: step };
    if (e.key === 'ArrowUp') patch = { yDelta: -step };
    if (e.key === 'ArrowDown') patch = { yDelta: step };
    if (patch.xDelta || patch.yDelta) {
      fields.filter(f=>selectedFieldIds.includes(f.id)).forEach(f => updateField(f.id, { x: (f.x || 0) + (patch.xDelta||0), y: (f.y || 0) + (patch.yDelta||0) }));
      e.preventDefault();
    }
  };

  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Modelos de Credencial</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{churches.map(c=>(<SelectItem key={c.id} value={c.id}>{c.nome_fantasia}</SelectItem>))}</SelectContent></Select>
            <Select value={type} onValueChange={(v:any)=>setType(v)}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member">Membro</SelectItem><SelectItem value="convention">Convenção</SelectItem><SelectItem value="student">Aluno EAD</SelectItem></SelectContent></Select>
            <Select value={side} onValueChange={(v:any)=>setSide(v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="front">Frente</SelectItem><SelectItem value="back">Verso</SelectItem></SelectContent></Select>
            <input type="file" accept="image/jpeg,image/png" onChange={(e)=>uploadImage(e.target.files?.[0]||null)} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {templates.filter(t => t.type === type).map(t => (
              <div key={t.id} className={`border rounded p-2 ${current?.id===t.id?'ring-2 ring-primary':''}`}>
                <img src={t.image_url} className="w-full h-28 object-cover rounded" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs">{t.id.slice(0,8)}</span>
                  <Button variant="outline" size="sm" onClick={()=>setCurrent(t)}>Editar</Button>
                </div>
              </div>
            ))}
          </div>
          {current && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative" tabIndex={0} onKeyDown={onKeyDown}>
                <img src={current.image_url} className="w-full rounded" />
                <div className="absolute inset-0">
                  {fields.map(f => (
                    <div key={f.id} style={{ position:'absolute', left:f.x, top:f.y, width:f.w||120, height:f.h||24, border:selectedFieldIds.includes(f.id)?'2px solid #4f46e5':'1px dashed #888', background:'rgba(255,255,255,0.2)' }} onMouseDown={(e)=>onDragMove(f.id, e)} onClick={()=>setSelectedFieldIds(prev=>prev.includes(f.id)?prev.filter(x=>x!==f.id):[...prev,f.id])}>
                      <span className="text-[10px] px-1 bg-white/70">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="font-medium">Campos</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={addField}>Campo vazio</Button>
                    <Select onValueChange={(v)=>{ const p = presets.find(x=>x.key===v); if (p) addPresetField(p.key, { image: p.image, qr: p.qr }); }}>
                      <SelectTrigger className="w-56"><SelectValue placeholder="Adicionar via preset" /></SelectTrigger>
                      <SelectContent>
                        {presets.map(p=>(<SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="secondary" onClick={applyPresetIADMA}>Aplicar layout IADMA</Button>
                    <Button size="sm" variant="outline" onClick={applyPresetIADMAExact}>Preset exato IADMA</Button>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {fields.map(f => (
                    <div key={f.id} className="border rounded p-2 grid grid-cols-2 gap-2">
                      <Input value={f.name} onChange={(e)=>updateField(f.id, { name: e.target.value })} />
                      <Input value={f.source_key} onChange={(e)=>updateField(f.id, { source_key: e.target.value })} />
                      <Input type="number" value={f.x} onChange={(e)=>updateField(f.id, { x: Number(e.target.value) })} />
                      <Input type="number" value={f.y} onChange={(e)=>updateField(f.id, { y: Number(e.target.value) })} />
                      <Input type="number" value={f.w || 0} onChange={(e)=>updateField(f.id, { w: Number(e.target.value) })} />
                      <Input type="number" value={f.h || 0} onChange={(e)=>updateField(f.id, { h: Number(e.target.value) })} />
                      <Input type="number" value={f.font_size || 12} onChange={(e)=>updateField(f.id, { font_size: Number(e.target.value) })} />
                      <Input value={f.color || '#000'} onChange={(e)=>updateField(f.id, { color: e.target.value })} />
                      <Select value={f.align || 'left'} onValueChange={(v)=>updateField(f.id, { align: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Esquerda</SelectItem><SelectItem value="center">Centro</SelectItem><SelectItem value="right">Direita</SelectItem></SelectContent></Select>
                      <Select value={String(f.is_image)} onValueChange={(v)=>updateField(f.id, { is_image: v==='true' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="false">Texto</SelectItem><SelectItem value="true">Imagem</SelectItem></SelectContent></Select>
                      <Select value={String(f.is_qr)} onValueChange={(v)=>updateField(f.id, { is_qr: v==='true' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="false">Sem QR</SelectItem><SelectItem value="true">QR</SelectItem></SelectContent></Select>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Input placeholder="Cor primária (#hex)" value={current.primary_color||''} onChange={async (e)=>{ const v=e.target.value; await supabase.from('credential_templates').update({ primary_color:v }).eq('id', current.id); setCurrent({ ...current, primary_color:v }); }} />
                  <Input placeholder="Cor secundária (#hex)" value={current.secondary_color||''} onChange={async (e)=>{ const v=e.target.value; await supabase.from('credential_templates').update({ secondary_color:v }).eq('id', current.id); setCurrent({ ...current, secondary_color:v }); }} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

