import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function HeatmapTargets() {
  const [churchId, setChurchId] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [nature, setNature] = useState<'RECEITA'|'DESPESA'>('RECEITA');
  const [centers, setCenters] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [ytd, setYtd] = useState<any[]>([]);
  const [mode, setMode] = useState<'MENSAL'|'TRIMESTRAL'|'SEMESTRAL'>('MENSAL');
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const loadCenters = async () => { if (!churchId) return; const { data } = await supabase.from('cost_centers').select('id,code,name').eq('entity','IGREJA').eq('entity_id', churchId); setCenters(data||[]); };
  const loadData = async () => {
    if (!churchId) return;
    const { data: targets } = await supabase.from('monthly_targets').select('*').eq('entity','IGREJA').eq('entity_id', churchId).eq('nature', nature).eq('year', year);
    const { data: e } = await supabase.from('church_entries').select('amount,date,cost_center_id').eq('church_id', churchId);
    const { data: x } = await supabase.from('church_expenses').select('total_value,date,cost_center_id').eq('church_id', churchId);
    const actual: Record<string, number> = {};
    const key = (cc:string, m:number) => `${cc||'sem'}:${m}`;
    const mKey = (d:string) => new Date(d).getMonth() + 1;
    if (nature==='RECEITA') (e||[]).forEach((r:any)=>{ const k = key(r.cost_center_id||'sem', mKey(r.date)); actual[k] = (actual[k]||0) + Number(r.amount||0); });
    else (x||[]).forEach((r:any)=>{ const k = key(r.cost_center_id||'sem', mKey(r.date)); actual[k] = (actual[k]||0) + Number(r.total_value||0); });
    const groups = mode==='MENSAL'
      ? months.map(m=>({ label: String(m).padStart(2,'0'), months:[m] }))
      : mode==='TRIMESTRAL'
        ? [[1,2,3],[4,5,6],[7,8,9],[10,11,12]].map((g,i)=>({ label:`Q${i+1}`, months:g }))
        : [[1,2,3,4,5,6],[7,8,9,10,11,12]].map((g,i)=>({ label:`H${i+1}`, months:g }));
    const rows = (centers.length?centers:[{ id:'sem', code:'SEM', name:'Sem centro' }]).map((c:any)=>{
      const cells = groups.map(g=>{
        const tgt = (targets||[]).filter((t:any)=> (t.cost_center_id||'sem') === (c.id||'sem') && g.months.includes(t.month)).reduce((s:number,t:any)=>s+Number(t.target_amount||0),0);
        const act = g.months.reduce((s:number,m:number)=> s + (actual[key(c.id||'sem', m)]||0), 0);
        const pct = tgt>0 ? (act/tgt) : 0;
        const ok = pct >= 1;
        const color = ok ? `rgba(16, 185, 129, ${Math.min(1,pct)})` : `rgba(239, 68, 68, ${Math.min(1,1-pct)})`;
        return { label:g.label, target:tgt, actual:act, pct, ok, color };
      });
      return { center:c, cells };
    });
    setData(rows);
    const ytdRows = rows.map(r=>{
      const tgt = r.cells.reduce((s:number,c:any)=>s+Number(c.target||0),0);
      const act = r.cells.reduce((s:number,c:any)=>s+Number(c.actual||0),0);
      const pct = tgt>0 ? (act/tgt) : 0;
      const ok = pct >= 1;
      return { center:r.center, target:tgt, actual:act, pct, ok };
    });
    setYtd(ytdRows);
  };
  useEffect(()=>{ loadCenters(); },[churchId]);
  useEffect(()=>{ loadData(); },[churchId, year, nature, centers.length]);
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Heatmap de Metas por Centro</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Select value={churchId} onValueChange={setChurchId}><SelectTrigger className="w-64"><SelectValue placeholder="Igreja" /></SelectTrigger><SelectContent>{/* options */}</SelectContent></Select>
            <Select value={String(year)} onValueChange={(v:any)=>setYear(Number(v))}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{[year-1,year,year+1].map(y=>(<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent></Select>
            <Select value={nature} onValueChange={(v:any)=>setNature(v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RECEITA">Receita</SelectItem><SelectItem value="DESPESA">Despesa</SelectItem></SelectContent></Select>
            <Select value={mode} onValueChange={(v:any)=>setMode(v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MENSAL">Mensal</SelectItem><SelectItem value="TRIMESTRAL">Trimestral</SelectItem><SelectItem value="SEMESTRAL">Semestral</SelectItem></SelectContent></Select>
          </div>
          <div className="space-y-3">
            {data.map((row:any)=>(
              <div key={row.center.id||'sem'}>
                <div className="text-sm font-medium mb-1">{row.center.code} • {row.center.name}</div>
                <div className={`grid gap-1 ${mode==='MENSAL'?'grid-cols-12':mode==='TRIMESTRAL'?'grid-cols-4':'grid-cols-2'}`}>
                  {row.cells.map((c:any)=>(
                    <div key={c.label} className="h-10 rounded flex items-center justify-center border" style={{ backgroundColor: c.color, borderColor: c.ok ? 'transparent' : '#ef4444' }} title={`${c.label} T:${c.target.toFixed(2)} A:${c.actual.toFixed(2)} (${Math.round(c.pct*100)}%)`}>{c.label}</div>
                  ))}
                </div>
                <div className="mt-1 text-xs">{(()=>{ const y = ytd.find(y=> (y.center.id||'sem') === (row.center.id||'sem')); if (!y) return null; const color = y.ok ? '#16a34a' : '#ef4444'; return (<span style={{ color }}>YTD: {y.actual.toFixed(2)} / {y.target.toFixed(2)} ({Math.round(y.pct*100)}%)</span>) })()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

