import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Layout = 'contador' | 'basic';

export default function AccountingCustomExport() {
  const [churchId, setChurchId] = useState<string>("");
  const [layout, setLayout] = useState<Layout>('contador');
  const [period, setPeriod] = useState({ start: '', end: '' });
  const [text, setText] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [fixedWidth, setFixedWidth] = useState<boolean>(true);
  const [decimalComma, setDecimalComma] = useState<boolean>(true);
  const [company, setCompany] = useState<any>(null);
  const [pubKey, setPubKey] = useState<string>("");
  const [spec, setSpec] = useState<any[]>([]);
  const within = (d:string) => { if (!period.start || !period.end) return true; const x = new Date(d).getTime(); return x >= new Date(period.start).getTime() && x <= new Date(period.end).getTime(); };
  useEffect(()=>{ const p = new URLSearchParams(window.location.search); const id = p.get('churchId'); if (id) setChurchId(id); },[]);
  const load = async () => {
    if (!churchId) return;
    const { data: ch } = await supabase.from('churches').select('id,nome_fantasia,cnpj,state_registration,address').eq('id', churchId).maybeSingle();
    setCompany(ch||null);
    const { data: e } = await supabase.from('church_entries').select('*').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('*').eq('church_id', churchId);
    const { data: accounts } = await supabase.from('chart_accounts').select('*').eq('entity','IGREJA').eq('entity_id', churchId).order('code');
    const { data: spBody } = await supabase.from('accounting_specs').select('*').eq('entity','IGREJA').eq('entity_id', churchId).eq('section','body').order('row_ord').order('ord');
    const { data: spHeader } = await supabase.from('accounting_specs').select('*').eq('entity','IGREJA').eq('entity_id', churchId).eq('section','header').order('row_ord').order('ord');
    const { data: spFooter } = await supabase.from('accounting_specs').select('*').eq('entity','IGREJA').eq('entity_id', churchId).eq('section','footer').order('row_ord').order('ord');
    setSpec(spBody||[]);
    const rows: any[] = [];
    const zpad = (s:string, len:number) => {
      const d = (s||'').replace(/\D/g,'');
      return d ? d.padStart(len, '0') : s;
    };
    (e||[]).filter((r:any)=>within(r.date)).forEach((r:any)=>rows.push({ date:r.date, conta:zpad(r.account_code||'1.1.1', 6), cc:zpad((r.cost_center_id||'').toString(), 4), debito:Number(r.amount||0), credito:0, historico:(r.description||'') }));
    (x||[]).filter((r:any)=>within(r.date)).forEach((r:any)=>rows.push({ date:r.date, conta:zpad(r.account_code||'3.1.1', 6), cc:zpad((r.cost_center_id||'').toString(), 4), debito:0, credito:Number(r.total_value||0), historico:(r.description||'') }));
    const normalize = (s:string, len:number) => s.replace(/\s+/g,' ').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^\w\s\-\.]/g,'').toUpperCase().slice(0,len);
    const brDate = (d:string) => { const nd = new Date(d); const dd = String(nd.getDate()).padStart(2,'0'); const mm = String(nd.getMonth()+1).padStart(2,'0'); const yyyy = nd.getFullYear(); return `${dd}/${mm}/${yyyy}`; };
    const fmt = (n:number) => {
      const v = (decimalComma ? n.toFixed(2).replace('.', ',') : n.toFixed(2));
      return fixedWidth ? pad(v, 15) : v;
    };
    const valErrors: string[] = [];
    let lines = '';
    const buildBySpec = (r:any) => {
      if (!spec.length) return null;
      const cells = spec.map((c:any)=>{
        const width = Number(c.width)||10;
        const name = String(c.column_name).toUpperCase();
        let val = '';
        if (name==='CONTA') val = normalize(r.conta, width);
        else if (name==='CENTRO_CUSTO') val = normalize(r.cc, width);
        else if (name==='DEBITO') val = fmt(Number(r.debito||0));
        else if (name==='CREDITO') val = fmt(Number(r.credito||0));
        else if (name==='VALOR') val = fmt(Number(r.debito||r.credito||0));
        else if (name==='HISTORICO') val = normalize(r.historico.replace(/\r?\n/g,' '), width);
        else if (name==='DATA') val = brDate(r.date);
        return fixedWidth ? (val + ' '.repeat(Math.max(0, width - val.length))) : val;
      });
      return fixedWidth ? cells.join('') : cells.join(';');
    };
    if (layout === 'contador') {
      lines = rows.map((r,i)=>{
        const specLine = buildBySpec(r);
        if (specLine) return specLine;
        const conta = pad(normalize(r.conta, 20), 20);
        const cc = pad(normalize(r.cc, 20), 20);
        const hist = pad(normalize(r.historico.replace(/\r?\n/g,' '), 120), 120);
        if (!conta.trim()) valErrors.push(`Linha ${i+1}: conta vazia`);
        const deb = fmt(Number(r.debito||0));
        const cre = fmt(Number(r.credito||0));
        const dateBr = fixedWidth ? pad(brDate(r.date), 10) : brDate(r.date);
        return fixedWidth
          ? [conta, deb, cre, hist, dateBr, cc].join('')
          : [conta.trim(), deb.trim(), cre.trim(), hist.trim(), dateBr, cc.trim()].join(';');
      }).join('\n');
    } else {
      lines = rows.map((r,i)=>{
        const specLine = buildBySpec(r);
        if (specLine) return specLine;
        const conta = pad(normalize(r.conta, 20), 20);
        const cc = pad(normalize(r.cc, 20), 20);
        const hist = pad(normalize(r.historico, 120), 120);
        const val = fmt(Number(r.debito?r.debito:r.credito));
        if (!conta.trim()) valErrors.push(`Linha ${i+1}: conta vazia`);
        const dateBr = fixedWidth ? pad(brDate(r.date), 10) : brDate(r.date);
        return fixedWidth
          ? [dateBr, conta, cc, val, hist].join('')
          : [dateBr, conta.trim(), cc.trim(), val.trim(), hist.trim()].join(';');
      }).join('\n');
    }
    const sumDeb = rows.reduce((s,r)=>s+Number(r.debito||0),0);
    const sumCre = rows.reduce((s,r)=>s+Number(r.credito||0),0);
    const pad = (s:string, len:number) => (s.length < len) ? (s + ' '.repeat(len - s.length)) : s.slice(0,len);
    const buildHeader = () => {
      const lines: string[] = [];
      const H = spHeader||[];
      if (!H.length) {
        lines.push(pad('#EMPRESA', 30));
        lines.push(pad('NOME', 10)+pad((company?.nome_fantasia||'').toUpperCase(), 60));
        lines.push(pad('CNPJ', 10)+pad((company?.cnpj||'').replace(/\D/g,''), 14));
        lines.push(pad('IE', 10)+pad((company?.state_registration||'').replace(/\D/g,''), 14));
        lines.push(pad('ENDERECO', 10)+pad((company?.address||'').toUpperCase(), 80));
        lines.push(pad('PERIODO', 10)+pad(`${period.start||''} a ${period.end||''}`, 30));
      } else {
        const groups = Object.groupBy(H, (r:any)=>r.row_ord);
        Object.keys(groups).sort((a,b)=>Number(a)-Number(b)).forEach((row:any)=>{
          const cells = (groups as any)[row].sort((a:any,b:any)=>a.ord-b.ord).map((c:any)=>{
            const width = Number(c.width)||10;
            let val = '';
            const fmt = String(c.format||'');
            if (fmt.startsWith('CONST:')) val = fmt.slice(6);
            else if (String(c.column_name).toUpperCase()==='LABEL') val = c.label||'';
            else {
              const nm = String(c.column_name).toUpperCase();
              if (nm==='NOME') val = (company?.nome_fantasia||'').toUpperCase();
              else if (nm==='CNPJ') val = (company?.cnpj||'').replace(/\D/g,'');
              else if (nm==='CNPJ_MATRIZ') val = (company?.cnpj_matriz||'').replace(/\D/g,'');
              else if (nm==='CNPJ_FILIAL') val = (company?.cnpj_filial||'').replace(/\D/g,'');
              else if (nm==='IE') val = (company?.state_registration||'').replace(/\D/g,'');
              else if (nm==='IM') val = (company?.municipal_registration||'').replace(/\D/g,'');
              else if (nm==='ENDERECO') val = (company?.address||'').toUpperCase();
              else if (nm==='PERIODO') val = `${period.start||''} a ${period.end||''}`;
            }
            val = val.toString();
            return fixedWidth ? (val + ' '.repeat(Math.max(0, width - val.length))) : val;
          });
          lines.push(fixedWidth ? cells.join('') : cells.join(';'));
        });
      }
      lines.push(pad('#PLANO_CONTAS', 30));
      lines.push(pad('CONTA',20)+pad('NOME',60)+pad('NATUREZA',10));
      (accounts||[]).forEach((a:any)=>lines.push(pad(a.code,20)+pad(a.name.toUpperCase(),60)+pad(a.nature,10)));
      return lines.join('\n');
    };
    const headLines = buildHeader();
    const buildFooter = async (sigHex: string, sigType: string) => {
      const F = spFooter||[];
      if (!F.length) {
        return [pad('#RESUMO',30), pad('DEBITO',10)+fmt(sumDeb), pad('CREDITO',10)+fmt(sumCre), pad('LINHAS',10)+pad(String(rows.length),10)].join('\n');
      }
      const lines: string[] = [];
      const groups = Object.groupBy(F, (r:any)=>r.row_ord);
      Object.keys(groups).sort((a,b)=>Number(a)-Number(b)).forEach((row:any)=>{
        const cells = (groups as any)[row].sort((a:any,b:any)=>a.ord-b.ord).map((c:any)=>{
          const width = Number(c.width)||10;
          const nm = String(c.column_name).toUpperCase();
          const fmtC = String(c.format||'');
          let val = '';
          if (fmtC.startsWith('CONST:')) val = fmtC.slice(6);
          else if (nm==='LABEL') val = c.label||'';
          else if (nm==='DEBITO_TOTAL') val = sumDeb.toFixed(2).replace('.', decimalComma?',':'.');
          else if (nm==='CREDITO_TOTAL') val = sumCre.toFixed(2).replace('.', decimalComma?',':'.');
          else if (nm==='LINHAS') val = String(rows.length);
          else if (nm==='SIGNATURE_SHA256' || nm==='SIGNATURE_ECDSA') val = sigHex;
          else val = '';
          return fixedWidth ? (val + ' '.repeat(Math.max(0, width - val.length))) : val;
        });
        lines.push(fixedWidth ? cells.join('') : cells.join(';'));
      });
      return lines.join('\n');
    };
    let content = `${headLines}\n${lines}\n`;
    const enc = new TextEncoder();
    const buf = enc.encode(content);
    let sigLine = '';
    let sigHex = '';
    try {
      const pemPriv = (window as any)?.SISCOF_PRIVKEY || '';
      const pemPub = (window as any)?.SISCOF_PUBKEY || '';
      setPubKey(pemPub||'');
      if (pemPriv && pemPub && (crypto as any)?.subtle) {
        const b64ToArray = (b64:string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
        const pkcs8 = pemPriv.replace(/-----[^-]+-----/g,'').replace(/\s+/g,'');
        const spki = pemPub.replace(/-----[^-]+-----/g,'').replace(/\s+/g,'');
        const privKey = await crypto.subtle.importKey('pkcs8', b64ToArray(pkcs8), { name:'ECDSA', namedCurve:'P-256' }, false, ['sign']);
        const sig = await crypto.subtle.sign({ name:'ECDSA', hash:'SHA-256' }, privKey, buf);
        const hex = Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
        sigHex = hex;
        const pubLine = fixedWidth ? pad('#PUBKEY',30)+pad(spki.slice(0,64),64) : `#PUBKEY;${spki}`;
        sigLine = fixedWidth ? pad('#SIGNATURE_ECDSA',30)+pad(hex,64) : `#SIGNATURE_ECDSA;${hex}`;
        const footer = await buildFooter(hex, 'ECDSA');
        content = `${content}${footer}\n${pubLine}\n${sigLine}`;
      } else {
        const dig = await crypto.subtle.digest('SHA-256', buf);
        const hex = Array.from(new Uint8Array(dig)).map(b=>b.toString(16).padStart(2,'0')).join('');
        sigHex = hex;
        const footer = await buildFooter(hex, 'SHA256');
        sigLine = fixedWidth ? pad('#SIGNATURE_SHA256',30)+pad(hex,64) : `#SIGNATURE_SHA256;${hex}`;
        content = `${content}${footer}\n${sigLine}`;
      }
    } catch {}
    setText(content);
    setErrors(valErrors);
  };
  useEffect(()=>{ load(); },[churchId, layout, period.start, period.end]);
  const download = () => { if (errors.length) return; const blob = new Blob([text], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `export_${layout}_${churchId}.txt`; a.click(); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Export Personalizado do Contador</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{/* options */}</SelectContent></Select>
            <Select value={layout} onValueChange={(v:any)=>setLayout(v)}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="contador">Layout do Contador</SelectItem><SelectItem value="basic">Básico</SelectItem></SelectContent></Select>
            <input type="date" value={period.start} onChange={(e)=>setPeriod(p=>({ ...p, start: e.target.value }))} />
            <input type="date" value={period.end} onChange={(e)=>setPeriod(p=>({ ...p, end: e.target.value }))} />
            <label className="flex items-center gap-2"><input type="checkbox" checked={fixedWidth} onChange={(e)=>setFixedWidth(e.target.checked)} />Largura fixa</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={decimalComma} onChange={(e)=>setDecimalComma(e.target.checked)} />Decimal vírgula</label>
            <button onClick={download} disabled={!!errors.length}>Baixar TXT</button>
          </div>
          <textarea readOnly className="w-full h-64 border rounded p-2" value={text} />
          <div className="text-sm">{errors.length ? `${errors.length} erros de validação` : 'Sem erros'}</div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

