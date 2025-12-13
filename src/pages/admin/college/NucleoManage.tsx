import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { NucleoLogoUpload } from "@/components/college/NucleoLogoUpload";

export default function NucleoManage() {
  const [polos, setPolos] = useState<any[]>([]);
  const [poloId, setPoloId] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [financeNuclei, setFinanceNuclei] = useState<any[]>([]);
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
  const loadPolos = async () => { const { data } = await supabase.from('college_polo').select('id,name,matriz_id').order('name'); setPolos(data||[]); };
  const load = async () => { if (!poloId) return; const { data } = await supabase.from('college_nucleo').select('*').eq('polo_id', poloId).order('name'); setRows(data||[]); };
  useEffect(()=>{ loadPolos(); const params = new URLSearchParams(window.location.search); const pid = params.get('poloId'); if (pid) setPoloId(pid); },[]);
  useEffect(()=>{ load(); },[poloId]);
  useEffect(()=>{ (async()=>{ try { const { data } = await supabase.from('faculty_nuclei').select('id,name').order('name'); setFinanceNuclei(data||[]); } catch(e) { setFinanceNuclei([]); } })(); },[]);
  const add = async () => { if (!poloId || !name) return; await supabase.from('college_nucleo').insert({ polo_id: poloId, name, email, phone, director_name: director, cep, address, number, district, city, state: stateUf, country }); setName(''); setEmail(''); setPhone(''); setDirector(''); setCep(''); setAddress(''); setNumber(''); setDistrict(''); setCity(''); setStateUf(''); setCountry('Brasil'); load(); };
  const update = async (id:string, patch:any) => { await supabase.from('college_nucleo').update(patch).eq('id', id); load(); };
  const remove = async (id:string) => { await supabase.from('college_nucleo').delete().eq('id', id); load(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Núcleos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {poloId && (
            <div className="text-xs mb-2"><a className="underline" href="/admin/faculdades/matriz">Matriz EAD</a> &gt; <a className="underline" href={`/admin/faculdades/polos?poloId=${poloId}`}>Polo</a> &gt; <span>Núcleos</span></div>
          )}
          {poloId && (
            <div className="grid grid-cols-3 gap-2">
              <div className="border p-2 rounded"><div className="text-xs">Total Núcleos</div><div className="text-lg font-semibold">{rows.length}</div></div>
              <div className="border p-2 rounded"><div className="text-xs">Tesouraria EAD</div><div className="text-sm"><a className="underline" href="/tesouraria">acessar</a></div></div>
              <div className="border p-2 rounded"><div className="text-xs">Consolidação</div><div className="text-sm"><a className="underline" href={`/tesouraria/consolidacao?entity=FACULDADE&rootId=${polos.find(p=>p.id===poloId)?.matriz_id||''}`}>ver gráfico</a></div></div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select value={poloId} onValueChange={setPoloId}><SelectTrigger className="w-64"><SelectValue placeholder="Polo" /></SelectTrigger><SelectContent>{polos.map(p=>(<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent></Select>
            <Input placeholder="Nome do Núcleo" value={name} onChange={(e)=>setName(e.target.value)} />
            <Input placeholder="Diretor do Núcleo" value={director} onChange={(e)=>setDirector(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input placeholder="Telefone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <Input placeholder="CEP" value={cep} onChange={(e)=>handleCep(e.target.value)} />
            <Input placeholder="Endereço" value={address} onChange={(e)=>setAddress(e.target.value)} />
            <Input placeholder="Número" value={number} onChange={(e)=>setNumber(e.target.value)} />
            <Input placeholder="Bairro" value={district} onChange={(e)=>setDistrict(e.target.value)} />
            <Input placeholder="Cidade" value={city} onChange={(e)=>setCity(e.target.value)} />
            <Input placeholder="Estado" value={stateUf} onChange={(e)=>setStateUf(e.target.value)} />
            <Input placeholder="País" value={country} onChange={(e)=>setCountry(e.target.value)} />
            <Button onClick={add}>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {rows.map(r=> (
              <div key={r.id} className="border p-2 rounded grid grid-cols-1 md:grid-cols-2 gap-2">
                <span className="text-xs">Polo: {polos.find(p=>p.id===r.polo_id)?.name||''}</span>
                <Input value={r.name||''} onChange={(e)=>update(r.id,{ name:e.target.value })} />
                <Input placeholder="Diretor do Núcleo" value={r.director_name||''} onChange={(e)=>update(r.id,{ director_name: e.target.value })} />
                <Input placeholder="Email" value={r.email||''} onChange={(e)=>update(r.id,{ email: e.target.value })} />
                <Input placeholder="Telefone" value={r.phone||''} onChange={(e)=>update(r.id,{ phone: e.target.value })} />
                <Input placeholder="CEP" value={r.cep||''} onChange={(e)=>update(r.id,{ cep: e.target.value })} />
                <Input placeholder="Endereço" value={r.address||''} onChange={(e)=>update(r.id,{ address: e.target.value })} />
                <Input placeholder="Número" value={r.number||''} onChange={(e)=>update(r.id,{ number: e.target.value })} />
                <Input placeholder="Bairro" value={r.district||''} onChange={(e)=>update(r.id,{ district: e.target.value })} />
                <Input placeholder="Cidade" value={r.city||''} onChange={(e)=>update(r.id,{ city: e.target.value })} />
                <Input placeholder="Estado" value={r.state||''} onChange={(e)=>update(r.id,{ state: e.target.value })} />
                <Input placeholder="País" value={r.country||''} onChange={(e)=>update(r.id,{ country: e.target.value })} />
                <NucleoLogoUpload nucleoId={r.id} currentLogoUrl={r.logo_url} onUploadSuccess={(url)=>update(r.id,{ logo_url: url })} />
                {financeNuclei.length>0 ? (
                  <Select value={r.finance_nucleo_id||''} onValueChange={(v)=>update(r.id,{ finance_nucleo_id: v })}>
                    <SelectTrigger className="w-64"><SelectValue placeholder="Finance Núcleo" /></SelectTrigger>
                    <SelectContent>{financeNuclei.map((n:any)=>(<SelectItem key={n.id} value={n.id}>{n.name||n.id}</SelectItem>))}</SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="Finance Núcleo ID" value={r.finance_nucleo_id||''} onChange={(e)=>update(r.id,{ finance_nucleo_id: e.target.value })} />
                )}
                <Button variant="secondary" onClick={()=>window.location.href='/tesouraria'}>Tesouraria EAD</Button>
                <Button variant="secondary" onClick={()=>{ window.location.href = `/tesouraria/consolidacao?entity=FACULDADE&rootId=${polos.find(p=>p.id===r.polo_id)?.matriz_id||''}`; }}>Consolidar Matriz</Button>
                <Button variant="outline" onClick={()=>remove(r.id)}>Excluir</Button>
              </div>
            ))}
            {rows.length>0 && (
              <div>
                <Button variant="outline" onClick={async()=>{
                  const lines = ['level,id,name'];
                  rows.forEach((r:any)=>lines.push(`NUCLEO,${r.id},${r.name}`));
                  const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hierarquia_nucleos_${poloId}.csv`; a.click();
                }}>Exportar Hierarquia (CSV)</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

