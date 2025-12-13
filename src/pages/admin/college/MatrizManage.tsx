import { useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CollegeLogoUpload } from "@/components/college/CollegeLogoUpload";
import { CollegeAvatarUpload } from "@/components/college/CollegeAvatarUpload";
import { CollegeVideoUpload } from "@/components/college/CollegeVideoUpload";

export default function CollegeMatrizManage() {
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [deep, setDeep] = useState<Record<string, number>>({});
  const [fin, setFin] = useState<Record<string, { entries:number, expenses:number, balance:number }>>({});
  const [faculties, setFaculties] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const nameRef = useRef<HTMLInputElement|null>(null);
  const [fantasia, setFantasia] = useState<string>("");
  const [razao, setRazao] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [chanceler, setChanceler] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [instVideo, setInstVideo] = useState<string>("");
  const [ytChannel, setYtChannel] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [brandPrimary, setBrandPrimary] = useState<string>("#003399");
  const [brandSecondary, setBrandSecondary] = useState<string>("#FFCC00");
  const [mode, setMode] = useState<'quick'|'advanced'>('quick');
  const [cep, setCep] = useState<string>("");
  const [endereco, setEndereco] = useState<string>("");
  const [numero, setNumero] = useState<string>("");
  const [bairro, setBairro] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [pais, setPais] = useState<string>("Brasil");
  const handleCep = async (value:string) => {
    const clean = (value||"").replace(/\D/g,"");
    setCep(value);
    if (clean.length===8) {
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await resp.json();
        if (!data.erro) {
          setEndereco(data.logradouro||"");
          setBairro(data.bairro||"");
          setCidade(data.localidade||"");
          setEstado(data.uf||"");
        }
      } catch {}
    }
  };
  const load = async () => {
    let list: any[] = [];
    try {
      const { data } = await supabase.from('college_matriz').select('*').order('name');
      list = data || [];
    } catch {}
    if (!list || list.length === 0) {
      try { list = JSON.parse(localStorage.getItem('demo_college_matriz')||'[]'); } catch {}
    }
    setRows(list || []);
    const { data: polos } = await supabase.from('college_polo').select('id,matriz_id');
    const { data: nucleos } = await supabase.from('college_nucleo').select('id,polo_id');
    const c: Record<string, number> = {};
    (polos||[]).forEach((p:any)=>{ c[p.matriz_id] = (c[p.matriz_id]||0)+1 });
    setCounts(c);
    const pById = new Map((polos||[]).map((p:any)=>[p.id, p]));
    const aggN: Record<string, number> = {};
    (nucleos||[]).forEach((n:any)=>{ const p = pById.get(n.polo_id); if (p) aggN[p.matriz_id] = (aggN[p.matriz_id]||0)+1 });
    setDeep(aggN);
    const { data: facs } = await supabase.from('faculties').select('id,name').order('name');
    setFaculties(facs||[]);
    const mappedPoles = (polos||[]).map((p:any)=>p.finance_pole_id).filter(Boolean);
    if (mappedPoles.length) {
      const { data: pays } = await supabase.from('payments').select('amount,pole_id');
      const dfin: Record<string, { entries:number, expenses:number, balance:number }> = {};
      (data||[]).forEach((m:any)=>{
        const relatedPoles = (polos||[]).filter((p:any)=>p.matriz_id===m.id && p.finance_pole_id);
        const total = relatedPoles.reduce((s:number,p:any)=> s + (pays||[]).filter((r:any)=>r.pole_id===p.finance_pole_id).reduce((ss:number,rr:any)=>ss+Number(rr.amount||0),0), 0);
        dfin[m.id] = { entries: total, expenses: 0, balance: total };
      });
      setFin(dfin);
    } else setFin({});
  };
  useEffect(()=>{ load(); },[]);
  const add = async () => {
    const base = { name: name||razao||fantasia };
    if (!base.name) return;
    try {
      const { data, error } = await supabase.from('college_matriz' as any).insert({
        name: base.name,
        fantasy_name: fantasia || null,
        legal_name: razao || null,
        email: email || null,
        phone: telefone || null,
        chancellor_president: chanceler || null,
        logo_url: logoUrl || null,
        institutional_video_url: instVideo || null,
        youtube_channel_url: ytChannel || null,
        brand_primary_color: brandPrimary || null,
        brand_secondary_color: brandSecondary || null,
        cep: cep || null,
        address: endereco || null,
        number: numero || null,
        district: bairro || null,
        city: cidade || null,
        state: estado || null,
        country: pais || null,
      } as any).select().single();
      if (error) throw error;
      if (data?.id && logoFile) {
        const ext = logoFile.name.split('.').pop();
        const fileName = `${data.id}/logo-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('college-logos').upload(fileName, logoFile, { cacheControl: '3600', upsert: true });
        if (!upErr) {
          const { data: pub } = supabase.storage.from('college-logos').getPublicUrl(fileName);
          const u = pub.publicUrl;
          await supabase.from('college_matriz' as any).update({ logo_url: u }).eq('id', data.id);
        }
      }
      if (data?.id && videoFile) {
        const ext = videoFile.name.split('.').pop();
        const fileName = `${data.id}/institutional-${Date.now()}.${ext}`;
        const { error: vErr } = await supabase.storage.from('college-videos').upload(fileName, videoFile, { cacheControl: '3600', upsert: true });
        if (!vErr) {
          const { data: pub } = supabase.storage.from('college-videos').getPublicUrl(fileName);
          const u = pub.publicUrl;
          await supabase.from('college_matriz' as any).update({ institutional_video_url: u }).eq('id', data.id);
        }
      }
      if (data?.id && email) {
        try { await supabase.from('global_users' as any).insert({ email, role: 'COLLEGE_ADMIN', organization_id: data.id }); } catch {}
      }
      setFantasia(''); setRazao(''); setEmail(''); setTelefone(''); setChanceler(''); setLogoUrl(''); setInstVideo(''); setYtChannel(''); setBrandPrimary('#003399'); setBrandSecondary('#FFCC00'); setCep(''); setEndereco(''); setNumero(''); setBairro(''); setCidade(''); setEstado(''); setPais('Brasil'); setName('');
      setLogoFile(null); setLogoPreview('');
      window.location.href = '/ead/admin/onboarding-conteudo';
    } catch {
      try {
        const demo = JSON.parse(localStorage.getItem('demo_college_matriz')||'[]');
        const id = String(Date.now());
        demo.push({ id, ...base, fantasy_name: fantasia, legal_name: razao, email, phone: telefone, chancellor_president: chanceler, logo_url: logoPreview || logoUrl, institutional_video_url: instVideo, youtube_channel_url: ytChannel, brand_primary_color: brandPrimary, brand_secondary_color: brandSecondary, cep, address: endereco, number: numero, district: bairro, city: cidade, state: estado, country: pais });
        localStorage.setItem('demo_college_matriz', JSON.stringify(demo));
        setName(''); setFantasia(''); setRazao(''); setEmail(''); setTelefone(''); setChanceler(''); setLogoUrl(''); setInstVideo(''); setYtChannel(''); setBrandPrimary('#003399'); setBrandSecondary('#FFCC00'); setCep(''); setEndereco(''); setNumero(''); setBairro(''); setCidade(''); setEstado(''); setPais('Brasil'); setLogoFile(null); setLogoPreview('');
        window.location.href = '/ead/admin/onboarding-conteudo?demo=1';
      } catch {}
    }
  };
  const update = async (id:string, patch:any) => { await supabase.from('college_matriz').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('college_matriz').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Faculdades EAD (Matriz)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Button variant={mode==='quick'?'default':'outline'} onClick={()=>setMode('quick')}>Modo Rápido</Button>
            <Button variant={mode==='advanced'?'default':'outline'} onClick={()=>setMode('advanced')}>Modo Avançado</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="border p-3 rounded">
              <div className="text-sm font-semibold mb-2">Operar sem Polos/Núcleos</div>
              <div className="text-xs mb-2">Publique aulas e matricule alunos diretamente na Matriz</div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" className="w-full" onClick={()=>window.location.href='/ead/admin/onboarding-conteudo'}>Publicar Aulas</Button>
                <Button variant="secondary" className="w-full" onClick={()=>window.location.href='/gerenciar-turmas'}>Matricular Alunos</Button>
              </div>
            </div>
            <div className="border p-3 rounded">
              <div className="text-sm font-semibold mb-2">Passo 1: Criar Faculdade Matriz</div>
              <Button variant="hero" className="w-full" onClick={()=>{ nameRef.current?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Criar Matriz</Button>
            </div>
            <div className="border p-3 rounded">
              <div className="text-sm font-semibold mb-2">Passo 2: Cadastrar Polos</div>
              <Button variant="secondary" className="w-full" onClick={()=>window.location.href='/admin/faculdades/polos'}>Abrir Polos</Button>
            </div>
            <div className="border p-3 rounded">
              <div className="text-sm font-semibold mb-2">Passo 3: Cadastrar Núcleos</div>
              <Button variant="secondary" className="w-full" onClick={()=>window.location.href='/admin/faculdades/nucleos'}>Abrir Núcleos</Button>
            </div>
          </div>
          {mode==='quick' ? (
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Nome da Faculdade</Label>
              <Input ref={nameRef} placeholder="Ex.: FAITEL" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="email@faculdade.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
                <Button type="button" variant="outline" onClick={()=>{ try { localStorage.setItem('prefill_login_email', email||''); } catch {}; window.location.href = '/login?target=faculdade'; }}>Criar acesso admin</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(99) 99999-9999" value={telefone} onChange={(e)=>setTelefone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-2">
                {logoPreview ? (<img src={logoPreview} alt="Logo" className="h-10 w-10 object-contain border rounded" />) : null}
                <input type="file" id="quick-college-logo" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]||null; if (!f) return; setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }} />
                <Label htmlFor="quick-college-logo"><Button type="button" variant="outline" asChild><span className="cursor-pointer text-xs">Escolher Logo</span></Button></Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avatar do Chanceler</Label>
              <CollegeAvatarUpload matrizId={"new"} currentAvatarUrl={""} onUploadSuccess={(url)=>setLogoUrl(url)} />
            </div>
            <div className="space-y-2">
              <Label>Vídeo de boas‑vindas (URL ou MP4)</Label>
              <Input placeholder="https://www.youtube.com/watch?v=..." value={instVideo} onChange={(e)=>setInstVideo(e.target.value)} />
              <div className="flex items-center gap-2">
                <input type="file" id="quick-college-video" accept="video/mp4,video/*" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]||null; if (!f) return; setVideoFile(f); }} />
                <Label htmlFor="quick-college-video"><Button type="button" variant="outline" asChild><span className="cursor-pointer text-xs">Enviar MP4</span></Button></Label>
                {videoFile && (<span className="text-xs truncate max-w-[200px]" title={videoFile.name}>{videoFile.name}</span>)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Canal YouTube (opcional)</Label>
              <Input placeholder="https://www.youtube.com/@..." value={ytChannel} onChange={(e)=>setYtChannel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cor Primária</Label>
              <Input type="color" value={brandPrimary} onChange={(e)=>setBrandPrimary(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cor Secundária</Label>
              <Input type="color" value={brandSecondary} onChange={(e)=>setBrandSecondary(e.target.value)} />
            </div>
            <details className="md:col-span-3">
              <summary className="cursor-pointer text-sm">Mais opções (endereço)</summary>
              <div className="grid md:grid-cols-3 gap-3 mt-2">
                <div className="space-y-2"><Label>CEP</Label><Input placeholder="00000-000" value={cep} onChange={(e)=>handleCep(e.target.value)} /></div>
                <div className="space-y-2"><Label>Endereço</Label><Input placeholder="Rua/Avenida" value={endereco} onChange={(e)=>setEndereco(e.target.value)} /></div>
                <div className="space-y-2"><Label>Número</Label><Input placeholder="123" value={numero} onChange={(e)=>setNumero(e.target.value)} /></div>
                <div className="space-y-2"><Label>Bairro</Label><Input placeholder="Bairro" value={bairro} onChange={(e)=>setBairro(e.target.value)} /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input placeholder="Cidade" value={cidade} onChange={(e)=>setCidade(e.target.value)} /></div>
                <div className="space-y-2"><Label>Estado</Label><Input placeholder="UF" value={estado} onChange={(e)=>setEstado(e.target.value)} /></div>
                <div className="space-y-2"><Label>País</Label><Input placeholder="Brasil" value={pais} onChange={(e)=>setPais(e.target.value)} /></div>
              </div>
            </details>
            <div className="md:col-span-3 flex items-center gap-2">
              <Button onClick={add}>Salvar Matriz</Button>
              <Button variant="outline" onClick={()=>window.scrollTo({ top: 0, behavior: 'smooth' })}>Voltar ao topo</Button>
            </div>
          </div>
          ) : (
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Nome de Fantasia (iniciais do domínio)</Label>
              <Input placeholder="Ex.: SISCOF EAD" value={fantasia} onChange={(e)=>setFantasia(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Razão Social (nome da faculdade)</Label>
              <Input placeholder="Ex.: Faculdade Sistema Cristão de Formação" value={razao} onChange={(e)=>setRazao(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Chanceler/Presidente</Label>
              <Input placeholder="Nome do chanceler" value={chanceler} onChange={(e)=>setChanceler(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="email@faculdade.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(99) 99999-9999" value={telefone} onChange={(e)=>setTelefone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Logo da Faculdade</Label>
              <div className="flex items-center gap-2">
                {logoPreview ? (<img src={logoPreview} alt="Logo" className="h-10 w-10 object-contain border rounded" />) : null}
                <input type="file" id="new-college-logo" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]||null; if (!f) return; setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }} />
                <Label htmlFor="new-college-logo">
                  <Button type="button" variant="outline" asChild><span className="cursor-pointer text-xs">Escolher Logo</span></Button>
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vídeo de boas‑vindas (URL)</Label>
              <Input placeholder="https://www.youtube.com/embed/.." value={instVideo} onChange={(e)=>setInstVideo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Enviar Vídeo MP4</Label>
              <div className="flex items-center gap-2">
                <input type="file" id="new-college-video" accept="video/mp4,video/*" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]||null; if (!f) return; setVideoFile(f); }} />
                <Label htmlFor="new-college-video">
                  <Button type="button" variant="outline" asChild><span className="cursor-pointer text-xs">Escolher Vídeo</span></Button>
                </Label>
                {videoFile && (<span className="text-xs truncate max-w-[200px]" title={videoFile.name}>{videoFile.name}</span>)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Canal YouTube (URL)</Label>
              <Input placeholder="https://www.youtube.com/@..." value={ytChannel} onChange={(e)=>setYtChannel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CEP / Caixa Postal</Label>
              <Input placeholder="00000-000" value={cep} onChange={(e)=>handleCep(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input placeholder="Rua/Avenida/Travessa" value={endereco} onChange={(e)=>setEndereco(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input placeholder="123" value={numero} onChange={(e)=>setNumero(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input placeholder="Bairro" value={bairro} onChange={(e)=>setBairro(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input placeholder="Cidade" value={cidade} onChange={(e)=>setCidade(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input placeholder="UF" value={estado} onChange={(e)=>setEstado(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Input placeholder="Brasil" value={pais} onChange={(e)=>setPais(e.target.value)} />
            </div>
          </div>
          )}
          <div className="flex items-center gap-2 mt-2"><Input ref={nameRef} placeholder="Nome curto (exibição)" value={name} onChange={(e)=>setName(e.target.value)} /><Button onClick={add}>Salvar Matriz</Button></div>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-8 gap-2">
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <CollegeLogoUpload matrizId={r.id} currentLogoUrl={r.logo_url} onUploadSuccess={(url)=>update(r.id,{ logo_url:url })} />
                <CollegeAvatarUpload matrizId={r.id} currentAvatarUrl={r.chancellor_avatar_url} onUploadSuccess={(url)=>update(r.id,{ chancellor_avatar_url:url })} />
                <CollegeVideoUpload matrizId={r.id} currentVideoUrl={r.institutional_video_url} onUploadSuccess={(url)=>update(r.id,{ institutional_video_url:url })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_faculty_id||''} onChange={(e)=>update(r.id,{ finance_faculty_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Faculdade)</option>
                  {faculties.map((f:any)=>(<option key={f.id} value={f.id}>{f.name||f.id}</option>))}
                </select>
                <span className="text-xs">Polos: {counts[r.id]||0} • Núcleos: {deep[r.id]||0}</span>
                <span className="text-xs">{fin[r.id]?`Entradas ${fin[r.id].entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • Despesas ${fin[r.id].expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • Saldo ${fin[r.id].balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`:'Sem vínculo financeiro'}</span>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=FACULDADE&rootId=${r.id}`}>Consolidação</Button>
                <Button variant="secondary" onClick={()=>window.location.href='/tesouraria'}>Tesouraria EAD</Button>
                <Button variant="outline" onClick={()=>{ if ((counts[r.id]||0)>0) return alert('Exclua os polos antes.'); remove(r.id); }}>Excluir</Button>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const { data: polos } = await supabase.from('college_polo').select('id,name,matriz_id');
                  const { data: nucleos } = await supabase.from('college_nucleo').select('id,name,polo_id');
                  const lines = ['system,level,id,name,parent_level,parent_id,parent_name'];
                  (rows||[]).forEach((m:any)=>lines.push(`FACULDADE,MATRIZ,${m.id},${m.name},,,`));
                  (polos||[]).forEach((p:any)=>{ const parent = (rows||[]).find((m:any)=>m.id===p.matriz_id); lines.push(`FACULDADE,POLO,${p.id},${p.name},MATRIZ,${parent?.id||''},${parent?.name||''}`) });
                  (nucleos||[]).forEach((n:any)=>{ const parent = (polos||[]).find((p:any)=>p.id===n.polo_id); lines.push(`FACULDADE,NUCLEO,${n.id},${n.name},POLO,${parent?.id||''},${parent?.name||''}`) });
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `arvore_faculdade.csv`; a.click();
                }}>Exportar Árvore Completa (CSV)</Button>
                <Button variant="outline" onClick={async()=>{
                  const { data: polos } = await supabase.from('college_polo').select('id,name,matriz_id,finance_pole_id');
                  const { data: nucleos } = await supabase.from('college_nucleo').select('id,name,polo_id');
                  const { data: pays } = await supabase.from('payments').select('amount,pole_id');
                  const calcPole = (fid:any) => { const ent = (pays||[]).filter((r:any)=>r.pole_id===fid).reduce((s:number,r:any)=>s+Number(r.amount||0),0); return { ent, exp:0, bal:ent } };
                  const lines = ['system,level,id,name,parent_level,parent_id,parent_name,finance_id,entries,expenses,balance'];
                  (rows||[]).forEach((m:any)=>{ const f = { ent:0,exp:0,bal:0 }; lines.push(`FACULDADE,MATRIZ,${m.id},${m.name},,,${m.finance_faculty_id||''},${f.ent},${f.exp},${f.bal}`) });
                  (polos||[]).forEach((p:any)=>{ const parent = (rows||[]).find((m:any)=>m.id===p.matriz_id); const f = p.finance_pole_id ? calcPole(p.finance_pole_id) : { ent:0,exp:0,bal:0 }; lines.push(`FACULDADE,POLO,${p.id},${p.name},MATRIZ,${parent?.id||''},${parent?.name||''},${p.finance_pole_id||''},${f.ent},${f.exp},${f.bal}`) });
                  (nucleos||[]).forEach((n:any)=>{ const parent = (polos||[]).find((p:any)=>p.id===n.polo_id); const f = { ent:0,exp:0,bal:0 }; lines.push(`FACULDADE,NUCLEO,${n.id},${n.name},POLO,${parent?.id||''},${parent?.name||''},,${f.ent},${f.exp},${f.bal}`) });
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `arvore_faculdade_financeiro.csv`; a.click();
                }}>Export Financeiro por Árvore (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

