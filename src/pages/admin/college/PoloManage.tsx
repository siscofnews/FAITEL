import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PoleLogoUpload } from "@/components/college/PoleLogoUpload";

export default function PoloManage() {
  const [matrizes, setMatrizes] = useState<any[]>([]);
  const [matrizId, setMatrizId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [financePoles, setFinancePoles] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [director, setDirector] = useState<string>("");
  const [cep, setCep] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [stateUf, setStateUf] = useState<string>("");
  const [country, setCountry] = useState<string>("Brasil");
  const handleCep = async (value:string) => {
    const clean = (value||"").replace(/\D/g,"");
    setCep(value);
    if (clean.length===8) {
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await resp.json();
        if (!data.erro) {
          setAddress(data.logradouro||"");
          setDistrict(data.bairro||"");
          setCity(data.localidade||"");
          setStateUf(data.uf||"");
        }
      } catch {}
    }
  };
  const loadMatrizes = async () => { const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setMatrizes(data||[]); };
  const load = async () => { if (!matrizId) return; const { data } = await supabase.from('college_polo').select('*').eq('matriz_id', matrizId).order('name'); setRows(data||[]); const { data: nucleos } = await supabase.from('college_nucleo').select('id,polo_id'); const c: Record<string, number> = {}; (nucleos||[]).forEach((n:any)=>{ c[n.polo_id] = (c[n.polo_id]||0)+1 }); setCounts(c); };
  useEffect(()=>{ loadMatrizes(); const params = new URLSearchParams(window.location.search); const mid = params.get('matrizId'); if (mid) setMatrizId(mid); },[]);
  useEffect(()=>{ load(); },[matrizId]);
  useEffect(()=>{ (async()=>{ const { data: fps } = await supabase.from('faculty_poles').select('id,name').order('name'); setFinancePoles(fps||[]); })(); },[]);
  const add = async () => { if (!matrizId || !name) return; const { data } = await supabase.from('college_polo').insert({ matriz_id: matrizId, name, email, phone, director_name: director, cep, address, number, district, city, state: stateUf, country }).select().single(); setName(''); setEmail(''); setPhone(''); setDirector(''); setCep(''); setAddress(''); setNumber(''); setDistrict(''); setCity(''); setStateUf(''); setCountry('Brasil'); if (data?.id) window.location.href = `/admin/faculdades/nucleos?poloId=${data.id}`; else load(); };
  const update = async (id:string, patch:any) => { await supabase.from('college_polo').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('college_polo').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Polos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {matrizId && (
            <div className="text-xs mb-2"><a className="underline" href="/admin/faculdades/matriz">Matriz EAD</a> &gt; <span>{matrizes.find(m=>m.id===matrizId)?.name||''}</span> &gt; <span>Polos</span></div>
          )}
          {matrizId && (
            <div className="grid grid-cols-3 gap-2">
              <div className="border p-2 rounded"><div className="text-xs">Total Polos</div><div className="text-lg font-semibold">{rows.length}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Núcleos agregados</div><div className="text-lg font-semibold">{Object.values(counts).reduce((s,n)=>s+n,0)}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Consolidação</div><div className="text-sm"><a className="underline" href={`/tesouraria/consolidacao?entity=FACULDADE&rootId=${matrizId}`}>ver gráfico</a></div></div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select value={matrizId} onValueChange={setMatrizId}><SelectTrigger className="w-64"><SelectValue placeholder="Matriz" /></SelectTrigger><SelectContent>{matrizes.map(m=>(<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Nome do Polo" value={name} onChange={(e)=>setName(e.target.value)} />
            <Input placeholder="Diretor do Polo" value={director} onChange={(e)=>setDirector(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input placeholder="Telefone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <Input placeholder="CEP" value={cep} onChange={(e)=>handleCep(e.target.value)} />
            <Input placeholder="Endereço" value={address} onChange={(e)=>setAddress(e.target.value)} />
            <Input placeholder="Número" value={number} onChange={(e)=>setNumber(e.target.value)} />
            <Input placeholder="Bairro" value={district} onChange={(e)=>setDistrict(e.target.value)} />
            <Input placeholder="Cidade" value={city} onChange={(e)=>setCity(e.target.value)} />
            <Input placeholder="Estado" value={stateUf} onChange={(e)=>setStateUf(e.target.value)} />
            <Input placeholder="País" value={country} onChange={(e)=>setCountry(e.target.value)} />
            <Button onClick={add}>Salvar Polo</Button>
          </div>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-1 md:grid-cols-2 gap-2">
                <span className="text-xs">Matriz: {matrizes.find(m=>m.id===r.matriz_id)?.name||''}</span>
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <Input placeholder="Diretor do Polo" value={r.director_name||''} onChange={(e)=>update(r.id,{ director_name: e.target.value })} />
                <Input placeholder="Email" value={r.email||''} onChange={(e)=>update(r.id,{ email: e.target.value })} />
                <Input placeholder="Telefone" value={r.phone||''} onChange={(e)=>update(r.id,{ phone: e.target.value })} />
                <Input placeholder="CEP" value={r.cep||''} onChange={(e)=>update(r.id,{ cep: e.target.value })} />
                <Input placeholder="Endereço" value={r.address||''} onChange={(e)=>update(r.id,{ address: e.target.value })} />
                <Input placeholder="Número" value={r.number||''} onChange={(e)=>update(r.id,{ number: e.target.value })} />
                <Input placeholder="Bairro" value={r.district||''} onChange={(e)=>update(r.id,{ district: e.target.value })} />
                <Input placeholder="Cidade" value={r.city||''} onChange={(e)=>update(r.id,{ city: e.target.value })} />
                <Input placeholder="Estado" value={r.state||''} onChange={(e)=>update(r.id,{ state: e.target.value })} />
                <Input placeholder="País" value={r.country||''} onChange={(e)=>update(r.id,{ country: e.target.value })} />
                <PoleLogoUpload poleId={r.id} currentLogoUrl={r.logo_url} onUploadSuccess={(url)=>update(r.id,{ logo_url: url })} />
                <select className="border rounded px-2 py-1 text-xs" value={r.finance_pole_id||''} onChange={(e)=>update(r.id,{ finance_pole_id: e.target.value })}>
                  <option value="">Vínculo Financeiro (Polo)</option>
                  {financePoles.map((p:any)=>(<option key={p.id} value={p.id}>{p.name||p.id}</option>))}
                </select>
                <span className="text-xs">Núcleos: {counts[r.id]||0}</span>
                <Button variant="secondary" onClick={()=>window.location.href=`/tesouraria/consolidacao?entity=FACULDADE&rootId=${matrizId}`}>Consolidar Matriz EAD</Button>
                <Button variant="outline" onClick={()=>{ if ((counts[r.id]||0)>0) return alert('Exclua os núcleos antes.'); remove(r.id); }}>Excluir</Button>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const lines = ['level,id,name,nucleos'];
                  rows.forEach((r:any)=>lines.push(`POLO,${r.id},${r.name},${counts[r.id]||0}`));
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hierarquia_polos_${matrizId}.csv`; a.click();
                }}>Exportar Hierarquia (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

