import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

type Sys = 'IGREJA'|'CONVENCAO'|'FACULDADE';

export default function MultiLevelReports() {
  const [sys, setSys] = useState<Sys>('IGREJA');
  const [roots, setRoots] = useState<any[]>([]);
  const [rootId, setRootId] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [periodError, setPeriodError] = useState<string>("");
  const [centers, setCenters] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [ccId, setCcId] = useState<string>("");
  const [acct, setAcct] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [levelTotals, setLevelTotals] = useState<Record<string,{ entries:number, expenses:number, balance:number }>>({});
  const [targets, setTargets] = useState<{ receita:number, despesa:number }>({ receita:0, despesa:0 });
  const [levelTargets, setLevelTargets] = useState<Record<string,{ receita:number, despesa:number, real_entries:number, real_expenses:number }>>({});
  const [distMode, setDistMode] = useState<'equal'|'children'|'weights'>('equal');
  const [weightsText, setWeightsText] = useState<string>("");
  const [weightByNode, setWeightByNode] = useState<Record<string, number>>({});
  const [persistWeights, setPersistWeights] = useState<boolean>(false);
  const [normalizeWeights, setNormalizeWeights] = useState<boolean>(true);
  const [inheritWeights, setInheritWeights] = useState<boolean>(false);
  const [levelTrendData, setLevelTrendData] = useState<any[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [nodeTrendData, setNodeTrendData] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [weightViewStatus, setWeightViewStatus] = useState<'published'|'draft'>('published');
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmType, setConfirmType] = useState<'publish'|'delete'|'none'>('none');
  const [previewEnabled, setPreviewEnabled] = useState<boolean>(false);
  const [previewDraft, setPreviewDraft] = useState<Record<string, number>>({});
  const [previewPublished, setPreviewPublished] = useState<Record<string, number>>({});
  const within = (d:string) => { if (!start || !end) return true; const x = new Date(d).getTime(); return x >= new Date(start).getTime() && x <= new Date(end).getTime(); };
  const validPeriod = () => { if (!start || !end) return true; return new Date(start).getTime() <= new Date(end).getTime(); };
  const loadRoots = async () => {
    if (sys==='IGREJA') { const { data } = await supabase.from('church_matriz').select('id,name').order('name'); setRoots(data||[]); }
    if (sys==='CONVENCAO') { const { data } = await supabase.from('convention_national').select('id,name').order('name'); setRoots(data||[]); }
    if (sys==='FACULDADE') { const { data } = await supabase.from('college_matriz').select('id,name').order('name'); setRoots(data||[]); }
  };
  const loadFilters = async () => {
    setCenters([]); setAccounts([]);
    if (!rootId) return;
    if (sys==='IGREJA') {
      const root = (await supabase.from('church_matriz').select('finance_church_id').eq('id', rootId).maybeSingle()).data as any;
      const fid = root?.finance_church_id; if (!fid) return;
      const { data: c } = await supabase.from('cost_centers').select('*').eq('entity','IGREJA').eq('entity_id', fid);
      const { data: a } = await supabase.from('chart_accounts').select('*').eq('entity','IGREJA').eq('entity_id', fid);
      setCenters(c||[]); setAccounts(a||[]);
    }
    if (sys==='CONVENCAO') {
      const root = (await supabase.from('convention_national').select('finance_convention_id').eq('id', rootId).maybeSingle()).data as any;
      const fid = root?.finance_convention_id; if (!fid) return;
      const { data: c } = await supabase.from('cost_centers').select('*').eq('entity','CONVENCAO').eq('entity_id', fid);
      const { data: a } = await supabase.from('chart_accounts').select('*').eq('entity','CONVENCAO').eq('entity_id', fid);
      setCenters(c||[]); setAccounts(a||[]);
    }
    if (sys==='FACULDADE') {
      const root = (await supabase.from('college_matriz').select('finance_faculty_id').eq('id', rootId).maybeSingle()).data as any;
      const fid = root?.finance_faculty_id; if (!fid) return;
      const { data: c } = await supabase.from('cost_centers').select('*').eq('entity','FACULDADE').eq('entity_id', fid);
      setCenters(c||[]);
    }
  };
  const loadWeights = async () => {
    if (!persistWeights || !rootId) return;
    const { data: sessionData } = await supabase.auth.getSession();
    let orgId = (sessionData.session?.user?.user_metadata as any)?.org_id || (sessionData.session?.user?.app_metadata as any)?.org_id || null;
    if (!orgId) { const jwt = sessionData.session?.access_token; if (jwt) { const p = jwt.split('.')[1]; const b = p?.replace(/-/g,'+')?.replace(/_/g,'/'); const pad = b ? b + '==='.slice((b.length+3)%4) : ''; try { const payload = JSON.parse(atob(pad)); orgId = payload?.org_id||null; } catch {} } }
    const q = supabase.from('distribution_weights').select('node_id,level,weight').eq('entity', sys).eq('root_id', rootId);
    const scoped = q.eq('cost_center_id', ccId||null).eq('account_code', acct||null).eq('period_start', start||null).eq('period_end', end||null).eq('status', weightViewStatus);
    const { data } = orgId ? await scoped.eq('org_id', orgId) : await scoped;
    const map: Record<string, number> = {};
    (data||[]).forEach((r:any)=>{ map[r.node_id] = Number(r.weight||1); });
    setWeightByNode(map);
  };
  const loadWeightsPreview = async () => {
    if (!persistWeights || !previewEnabled || !rootId) { setPreviewDraft({}); setPreviewPublished({}); return; }
    const { data: sessionData } = await supabase.auth.getSession();
    let orgId = (sessionData.session?.user?.user_metadata as any)?.org_id || (sessionData.session?.user?.app_metadata as any)?.org_id || null;
    if (!orgId) { const jwt = sessionData.session?.access_token; if (jwt) { const p = jwt.split('.')[1]; const b = p?.replace(/-/g,'+')?.replace(/_/g,'/'); const pad = b ? b + '==='.slice((b.length+3)%4) : ''; try { const payload = JSON.parse(atob(pad)); orgId = payload?.org_id||null; } catch {} } }
    const base = supabase.from('distribution_weights').select('node_id,level,weight').eq('entity', sys).eq('root_id', rootId).eq('cost_center_id', ccId||null).eq('account_code', acct||null).eq('period_start', start||null).eq('period_end', end||null);
    const { data: d } = orgId ? await base.eq('status','draft').eq('org_id', orgId) : await base.eq('status','draft');
    const { data: p } = orgId ? await base.eq('status','published').eq('org_id', orgId) : await base.eq('status','published');
    const md: Record<string, number> = {}; (d||[]).forEach((r:any)=>{ md[r.node_id] = Number(r.weight||1) });
    const mp: Record<string, number> = {}; (p||[]).forEach((r:any)=>{ mp[r.node_id] = Number(r.weight||1) });
    setPreviewDraft(md); setPreviewPublished(mp);
  };
  const loadRows = async () => {
    if (!rootId) { setRows([]); return; }
    if (!validPeriod()) { setPeriodError('Período inválido: data inicial maior que a final'); setRows([]); return; } else setPeriodError('');
    if (sys==='IGREJA') {
      const { data: sedes } = await supabase.from('church_sede').select('id,name,matriz_id,finance_church_id').eq('matriz_id', rootId);
      const { data: subs } = await supabase.from('church_subsede').select('id,name,sede_id,finance_church_id');
      const { data: congs } = await supabase.from('church_congregation').select('id,name,subsede_id,finance_church_id');
      const { data: e } = await supabase.from('church_entries').select('amount,date,church_id,cost_center_id,account_code');
      const { data: x } = await supabase.from('church_expenses').select('total_value,date,church_id,cost_center_id,account_code');
      const filtE = (e||[]).filter((r:any)=>(!ccId||r.cost_center_id===ccId) && (!acct||r.account_code===acct));
      const filtX = (x||[]).filter((r:any)=>(!ccId||r.cost_center_id===ccId) && (!acct||r.account_code===acct));
      const calc = (fid:string) => { const ent = (filtE||[]).filter((r:any)=>r.church_id===fid && within(r.date)).reduce((s:number,r:any)=>s+Number(r.amount||0),0); const exp = (filtX||[]).filter((r:any)=>r.church_id===fid && within(r.date)).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); return { ent, exp, bal: ent-exp } };
      const list:any[] = [];
      const root = (await supabase.from('church_matriz').select('id,name,finance_church_id').eq('id', rootId).maybeSingle()).data;
      if (root) { const f = root.finance_church_id ? calc(root.finance_church_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'MATRIZ', id:root.id, name:root.name, parent:'', parent_id:'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: root.finance_church_id||'' }); }
      (sedes||[]).forEach((s:any)=>{ const f = s.finance_church_id ? calc(s.finance_church_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'SEDE', id:s.id, name:s.name, parent:root?.name||'', parent_id:root?.id||'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: s.finance_church_id||'' }); });
      (subs||[]).filter((sb:any)=> (sedes||[]).some((s:any)=>s.id===sb.sede_id)).forEach((sb:any)=>{ const parent = (sedes||[]).find((s:any)=>s.id===sb.sede_id); const f = sb.finance_church_id ? calc(sb.finance_church_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'SUBSEDE', id:sb.id, name:sb.name, parent:parent?.name||'', parent_id:parent?.id||'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: sb.finance_church_id||'' }); });
      (congs||[]).filter((cg:any)=> (subs||[]).some((sb:any)=>sb.id===cg.subsede_id)).forEach((cg:any)=>{ const parent = (subs||[]).find((sb:any)=>sb.id===cg.subsede_id); const f = cg.finance_church_id ? calc(cg.finance_church_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'CONGREGACAO', id:cg.id, name:cg.name, parent:parent?.name||'', parent_id:parent?.id||'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: cg.finance_church_id||'' }); });
      setRows(list);
      const lt: any = {}; list.forEach((r:any)=>{ lt[r.level] ||= { entries:0, expenses:0, balance:0 }; lt[r.level].entries += r.entries; lt[r.level].expenses += r.expenses; lt[r.level].balance += r.balance; }); setLevelTotals(lt);
      const financeIds = list.map((r:any)=>r.finance_id).filter((id:string)=>!!id);
      const { data: tgNodes } = financeIds.length? await supabase.from('monthly_targets').select('*').eq('entity','IGREJA').in('entity_id', financeIds): { data: [] } as any;
      const inRangeNode = (t:any)=>{ if (!start||!end) return true; const d = new Date(`${t.year}-${String(t.month).padStart(2,'0')}-01`).getTime(); return d >= new Date(start).getTime() && d <= new Date(end).getTime(); };
      const targetById: Record<string,{ receita:number, despesa:number }> = {};
      (tgNodes||[]).filter(inRangeNode).forEach((t:any)=>{ const key=t.entity_id; targetById[key] ||= { receita:0, despesa:0 }; if (t.nature==='RECEITA') targetById[key].receita += Number(t.target_amount||0); else targetById[key].despesa += Number(t.target_amount||0); });
      const childMap: Record<string,string> = { MATRIZ:'SEDE', SEDE:'SUBSEDE', SUBSEDE:'CONGREGACAO' };
      const distributeChildren = (parent:any) => {
        const childLv = childMap[parent.level]; if (!childLv) return;
        const children = list.filter((r:any)=>r.parent_id===parent.id && r.level===childLv);
        if (!children.length) return;
        const explicitRec = children.reduce((s:number,c:any)=> s + (targetById[c.finance_id]?.receita||0), 0);
        const explicitDes = children.reduce((s:number,c:any)=> s + (targetById[c.finance_id]?.despesa||0), 0);
        const remRec = Math.max(0, (parent.meta_receita||0) - explicitRec);
        const remDes = Math.max(0, (parent.meta_despesa||0) - explicitDes);
        const vals = children.map((c:any)=>{ return distMode==='weights' ? (weightByNode[c.id]||1) : 1; });
        const sum = vals.reduce((s:number,v:number)=>s+v,0)||1;
        children.forEach((c:any,idx:number)=>{ const rec = targetById[c.finance_id]?.receita ?? (remRec * ((vals[idx]||1)/sum)); const des = targetById[c.finance_id]?.despesa ?? (remDes * ((vals[idx]||1)/sum)); c.meta_receita = rec; c.meta_despesa = des; c.diff_receita = c.entries - rec; c.diff_despesa = c.expenses - des; c.diff_balance = c.balance - (rec - des); distributeChildren(c); });
      };
      const rootNode = list.find((r:any)=>r.level==='MATRIZ'); if (rootNode) { rootNode.meta_receita = targets.receita; rootNode.meta_despesa = targets.despesa; distributeChildren(rootNode); }
      const lvlTargets: Record<string,{ receita:number, despesa:number, real_entries:number, real_expenses:number }> = {};
      list.forEach((r:any)=>{ const rec = r.meta_receita||0, des = r.meta_despesa||0; lvlTargets[r.level] ||= { receita:0, despesa:0, real_entries:0, real_expenses:0 }; lvlTargets[r.level].receita += rec; lvlTargets[r.level].despesa += des; lvlTargets[r.level].real_entries += r.entries; lvlTargets[r.level].real_expenses += r.expenses; if (r.meta_receita===undefined) { r.meta_receita = rec; r.meta_despesa = des; r.diff_receita = r.entries - rec; r.diff_despesa = r.expenses - des; r.diff_balance = r.balance - (rec - des); } });
      setLevelTargets(lvlTargets);
      const monthKey = (d:string) => { const nd=new Date(d); return `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}` };
      const m: Record<string,{ ent:number, des:number, meta:number }> = {};
      (filtE||[]).forEach((r:any)=>{ const k=monthKey(r.date); m[k] ||= { ent:0, des:0, meta:0 }; m[k].ent += Number(r.amount||0); });
      (filtX||[]).forEach((r:any)=>{ const k=monthKey(r.date); m[k] ||= { ent:0, des:0, meta:0 }; m[k].des += Number(r.total_value||0); });
      (tgNodes||[]).filter(inRangeNode).forEach((t:any)=>{ const k=`${t.year}-${String(t.month).padStart(2,'0')}`; m[k] ||= { ent:0, des:0, meta:0 }; m[k].meta += Number(t.nature==='RECEITA'?t.target_amount||0:-(t.target_amount||0)); });
      setTrend(Object.keys(m).sort().map(k=>({ month:k, real_balance: (m[k].ent - m[k].des), meta_balance: m[k].meta })));
      const lvSet = Array.from(new Set(rows.map((r:any)=>r.level)));
      const byMonthLevel: Record<string, any> = {};
      (filtE||[]).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; lvSet.forEach(lv=>{ byMonthLevel[k][`real_${lv}`] ||= 0 }); });
      rows.forEach((n:any)=>{
        const fid = n.finance_id; if (!fid) return;
        (filtE||[]).filter((r:any)=>r.church_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; byMonthLevel[k][`real_${n.level}`] = (byMonthLevel[k][`real_${n.level}`]||0) + Number(r.amount||0); });
        (filtX||[]).filter((r:any)=>r.church_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; byMonthLevel[k][`real_${n.level}`] = (byMonthLevel[k][`real_${n.level}`]||0) - Number(r.total_value||0); });
      });
      setLevelTrendData(Object.keys(byMonthLevel).sort().map(k=>({ month:k, ...byMonthLevel[k], meta_balance: m[k]?.meta||0 })));
      if (selectedNodeIds.length) {
        const nodeMapName: Record<string,string> = {}; rows.forEach((n:any)=>{ nodeMapName[n.id] = n.name });
        const months = Object.keys(m).sort(); const itemByMonth: Record<string, any> = {}; months.forEach(k=>{ itemByMonth[k] = { month:k } });
        selectedNodeIds.forEach((nid)=>{
          const node = rows.find((n:any)=>n.id===nid); const fid = node?.finance_id; const labelReal = `real_${nid}`; const labelMeta = `meta_${nid}`;
          (filtE||[]).filter((r:any)=>fid && r.church_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); itemByMonth[k][labelReal] = (itemByMonth[k][labelReal]||0) + Number(r.amount||0); });
          (filtX||[]).filter((r:any)=>fid && r.church_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); itemByMonth[k][labelReal] = (itemByMonth[k][labelReal]||0) - Number(r.total_value||0); });
          (tgNodes||[]).filter((t:any)=>fid && t.entity_id===fid).forEach((t:any)=>{ const k=`${t.year}-${String(t.month).padStart(2,'0')}`; const v = Number(t.nature==='RECEITA'?t.target_amount||0:-(t.target_amount||0)); itemByMonth[k][labelMeta] = (itemByMonth[k][labelMeta]||0) + v; });
        });
        setNodeTrendData(months.map(k=>itemByMonth[k]));
      } else setNodeTrendData([]);
      const rootF = (root as any)?.finance_church_id; if (rootF) {
        const y0 = start ? new Date(start).getFullYear() : undefined; const m0 = start ? (new Date(start).getMonth()+1) : undefined; const y1 = end ? new Date(end).getFullYear() : undefined; const m1 = end ? (new Date(end).getMonth()+1) : undefined;
        const { data: tg } = await supabase.from('monthly_targets').select('*').eq('entity','IGREJA').eq('entity_id', rootF);
        const inRange = (t:any)=>{ if (!start||!end) return true; const d = new Date(`${t.year}-${String(t.month).padStart(2,'0')}-01`).getTime(); return d >= new Date(`${y0}-${String(m0).padStart(2,'0')}-01`).getTime() && d <= new Date(`${y1}-${String(m1).padStart(2,'0')}-01`).getTime(); };
        const rec = (tg||[]).filter((t:any)=>t.nature==='RECEITA' && inRange(t)).reduce((s:number,t:any)=>s+Number(t.target_amount||0),0);
        const des = (tg||[]).filter((t:any)=>t.nature==='DESPESA' && inRange(t)).reduce((s:number,t:any)=>s+Number(t.target_amount||0),0);
        setTargets({ receita: rec, despesa: des });
      } else setTargets({ receita:0, despesa:0 });
    }
    if (sys==='CONVENCAO') {
      const { data: states } = await supabase.from('convention_state').select('id,name,national_id,finance_convention_id').eq('national_id', rootId);
      const { data: coords } = await supabase.from('convention_coordination').select('id,name,state_id,finance_convention_id');
      const { data: e } = await supabase.from('convention_entries').select('amount,date,convention_id,cost_center_id,account_code');
      const { data: x } = await supabase.from('convention_expenses').select('total_value,date,convention_id,cost_center_id,account_code');
      const filtE = (e||[]).filter((r:any)=>(!ccId||r.cost_center_id===ccId) && (!acct||r.account_code===acct));
      const filtX = (x||[]).filter((r:any)=>(!ccId||r.cost_center_id===ccId) && (!acct||r.account_code===acct));
      const calc = (fid:string) => { const ent = (filtE||[]).filter((r:any)=>r.convention_id===fid && within(r.date)).reduce((s:number,r:any)=>s+Number(r.amount||0),0); const exp = (filtX||[]).filter((r:any)=>r.convention_id===fid && within(r.date)).reduce((s:number,r:any)=>s+Number(r.total_value||0),0); return { ent, exp, bal: ent-exp } };
      const list:any[] = [];
      const root = (await supabase.from('convention_national').select('id,name,finance_convention_id').eq('id', rootId).maybeSingle()).data;
      if (root) { const f = root.finance_convention_id ? calc(root.finance_convention_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'NACIONAL', id:root.id, name:root.name, parent:'', parent_id:'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: root.finance_convention_id||'' }); }
      (states||[]).forEach((s:any)=>{ const f = s.finance_convention_id ? calc(s.finance_convention_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'ESTADUAL', id:s.id, name:s.name, parent:root?.name||'', parent_id:root?.id||'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: s.finance_convention_id||'' }); });
      (coords||[]).filter((c:any)=> (states||[]).some((s:any)=>s.id===c.state_id)).forEach((c:any)=>{ const parent = (states||[]).find((s:any)=>s.id===c.state_id); const f = c.finance_convention_id ? calc(c.finance_convention_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'COORDENACAO', id:c.id, name:c.name, parent:parent?.name||'', parent_id:parent?.id||'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: c.finance_convention_id||'' }); });
      setRows(list);
      const lt: any = {}; list.forEach((r:any)=>{ lt[r.level] ||= { entries:0, expenses:0, balance:0 }; lt[r.level].entries += r.entries; lt[r.level].expenses += r.expenses; lt[r.level].balance += r.balance; }); setLevelTotals(lt);
      const financeIds = list.map((r:any)=>r.finance_id).filter((id:string)=>!!id);
      const { data: tgNodes } = financeIds.length? await supabase.from('monthly_targets').select('*').eq('entity','CONVENCAO').in('entity_id', financeIds): { data: [] } as any;
      const inRangeNode = (t:any)=>{ if (!start||!end) return true; const d = new Date(`${t.year}-${String(t.month).padStart(2,'0')}-01`).getTime(); return d >= new Date(start).getTime() && d <= new Date(end).getTime(); };
      const targetById: Record<string,{ receita:number, despesa:number }> = {};
      (tgNodes||[]).filter(inRangeNode).forEach((t:any)=>{ const key=t.entity_id; targetById[key] ||= { receita:0, despesa:0 }; if (t.nature==='RECEITA') targetById[key].receita += Number(t.target_amount||0); else targetById[key].despesa += Number(t.target_amount||0); });
      const childMap: Record<string,string> = { NACIONAL:'ESTADUAL', ESTADUAL:'COORDENACAO' };
      const distributeChildren = (parent:any) => {
        const childLv = childMap[parent.level]; if (!childLv) return;
        const children = list.filter((r:any)=>r.parent_id===parent.id && r.level===childLv);
        if (!children.length) return;
        const explicitRec = children.reduce((s:number,c:any)=> s + (targetById[c.finance_id]?.receita||0), 0);
        const explicitDes = children.reduce((s:number,c:any)=> s + (targetById[c.finance_id]?.despesa||0), 0);
        const remRec = Math.max(0, (parent.meta_receita||0) - explicitRec);
        const remDes = Math.max(0, (parent.meta_despesa||0) - explicitDes);
        const vals = children.map((c:any)=>{ return distMode==='weights' ? (weightByNode[c.id]||1) : 1; });
        const sum = vals.reduce((s:number,v:number)=>s+v,0)||1;
        children.forEach((c:any,idx:number)=>{ const rec = targetById[c.finance_id]?.receita ?? (remRec * ((vals[idx]||1)/sum)); const des = targetById[c.finance_id]?.despesa ?? (remDes * ((vals[idx]||1)/sum)); c.meta_receita = rec; c.meta_despesa = des; c.diff_receita = c.entries - rec; c.diff_despesa = c.expenses - des; c.diff_balance = c.balance - (rec - des); distributeChildren(c); });
      };
      const rootNode = list.find((r:any)=>r.level==='NACIONAL'); if (rootNode) { rootNode.meta_receita = targets.receita; rootNode.meta_despesa = targets.despesa; distributeChildren(rootNode); }
      const lvlTargets: Record<string,{ receita:number, despesa:number, real_entries:number, real_expenses:number }> = {};
      list.forEach((r:any)=>{ const rec = r.meta_receita||0, des = r.meta_despesa||0; lvlTargets[r.level] ||= { receita:0, despesa:0, real_entries:0, real_expenses:0 }; lvlTargets[r.level].receita += rec; lvlTargets[r.level].despesa += des; lvlTargets[r.level].real_entries += r.entries; lvlTargets[r.level].real_expenses += r.expenses; if (r.meta_receita===undefined) { r.meta_receita = rec; r.meta_despesa = des; r.diff_receita = r.entries - rec; r.diff_despesa = r.expenses - des; r.diff_balance = r.balance - (rec - des); } });
      setLevelTargets(lvlTargets);
      const monthKey = (d:string) => { const nd=new Date(d); return `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}` };
      const m: Record<string,{ ent:number, des:number, meta:number }> = {};
      (filtE||[]).forEach((r:any)=>{ const k=monthKey(r.date); m[k] ||= { ent:0, des:0, meta:0 }; m[k].ent += Number(r.amount||0); });
      (filtX||[]).forEach((r:any)=>{ const k=monthKey(r.date); m[k] ||= { ent:0, des:0, meta:0 }; m[k].des += Number(r.total_value||0); });
      (tgNodes||[]).filter(inRangeNode).forEach((t:any)=>{ const k=`${t.year}-${String(t.month).padStart(2,'0')}`; m[k] ||= { ent:0, des:0, meta:0 }; m[k].meta += Number(t.nature==='RECEITA'?t.target_amount||0:-(t.target_amount||0)); });
      setTrend(Object.keys(m).sort().map(k=>({ month:k, real_balance: (m[k].ent - m[k].des), meta_balance: m[k].meta })));
      const lvSet = Array.from(new Set(rows.map((r:any)=>r.level)));
      const byMonthLevel: Record<string, any> = {};
      (filtE||[]).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; lvSet.forEach(lv=>{ byMonthLevel[k][`real_${lv}`] ||= 0 }); });
      rows.forEach((n:any)=>{
        const fid = n.finance_id; if (!fid) return;
        (filtE||[]).filter((r:any)=>r.convention_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; byMonthLevel[k][`real_${n.level}`] = (byMonthLevel[k][`real_${n.level}`]||0) + Number(r.amount||0); });
        (filtX||[]).filter((r:any)=>r.convention_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; byMonthLevel[k][`real_${n.level}`] = (byMonthLevel[k][`real_${n.level}`]||0) - Number(r.total_value||0); });
      });
      setLevelTrendData(Object.keys(byMonthLevel).sort().map(k=>({ month:k, ...byMonthLevel[k], meta_balance: m[k]?.meta||0 })));
      if (selectedNodeIds.length) {
        const nodeMapName: Record<string,string> = {}; rows.forEach((n:any)=>{ nodeMapName[n.id] = n.name });
        const months = Object.keys(m).sort(); const itemByMonth: Record<string, any> = {}; months.forEach(k=>{ itemByMonth[k] = { month:k } });
        selectedNodeIds.forEach((nid)=>{
          const node = rows.find((n:any)=>n.id===nid); const fid = node?.finance_id; const labelReal = `real_${nid}`; const labelMeta = `meta_${nid}`;
          (filtE||[]).filter((r:any)=>fid && r.convention_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); itemByMonth[k][labelReal] = (itemByMonth[k][labelReal]||0) + Number(r.amount||0); });
          (filtX||[]).filter((r:any)=>fid && r.convention_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); itemByMonth[k][labelReal] = (itemByMonth[k][labelReal]||0) - Number(r.total_value||0); });
          (tgNodes||[]).filter((t:any)=>fid && t.entity_id===fid).forEach((t:any)=>{ const k=`${t.year}-${String(t.month).padStart(2,'0')}`; const v = Number(t.nature==='RECEITA'?t.target_amount||0:-(t.target_amount||0)); itemByMonth[k][labelMeta] = (itemByMonth[k][labelMeta]||0) + v; });
        });
        setNodeTrendData(months.map(k=>itemByMonth[k]));
      } else setNodeTrendData([]);
      const rootF = (root as any)?.finance_convention_id; if (rootF) {
        const y0 = start ? new Date(start).getFullYear() : undefined; const m0 = start ? (new Date(start).getMonth()+1) : undefined; const y1 = end ? new Date(end).getFullYear() : undefined; const m1 = end ? (new Date(end).getMonth()+1) : undefined;
        const { data: tg } = await supabase.from('monthly_targets').select('*').eq('entity','CONVENCAO').eq('entity_id', rootF);
        const inRange = (t:any)=>{ if (!start||!end) return true; const d = new Date(`${t.year}-${String(t.month).padStart(2,'0')}-01`).getTime(); return d >= new Date(`${y0}-${String(m0).padStart(2,'0')}-01`).getTime() && d <= new Date(`${y1}-${String(m1).padStart(2,'0')}-01`).getTime(); };
        const rec = (tg||[]).filter((t:any)=>t.nature==='RECEITA' && inRange(t)).reduce((s:number,t:any)=>s+Number(t.target_amount||0),0);
        const des = (tg||[]).filter((t:any)=>t.nature==='DESPESA' && inRange(t)).reduce((s:number,t:any)=>s+Number(t.target_amount||0),0);
        setTargets({ receita: rec, despesa: des });
      } else setTargets({ receita:0, despesa:0 });
    }
    if (sys==='FACULDADE') {
      const { data: polos } = await supabase.from('college_polo').select('id,name,matriz_id,finance_pole_id').eq('matriz_id', rootId);
      const { data: nucleos } = await supabase.from('college_nucleo').select('id,name,polo_id,finance_nucleo_id');
      const { data: pays } = await supabase.from('payments').select('amount,date,pole_id,cost_center_id');
      const filtPays = (pays||[]).filter((r:any)=>!ccId || r.cost_center_id===ccId);
      const calcPole = (fid:string) => { const ent = (filtPays||[]).filter((r:any)=>r.pole_id===fid && within(r.date)).reduce((s:number,r:any)=>s+Number(r.amount||0),0); return { ent, exp:0, bal:ent } };
      const list:any[] = [];
      const root = (await supabase.from('college_matriz').select('id,name,finance_faculty_id').eq('id', rootId).maybeSingle()).data;
      if (root) { const f = { ent:0,exp:0,bal:0 }; list.push({ level:'MATRIZ_EAD', id:root.id, name:root.name, parent:'', parent_id:'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: root.finance_faculty_id||'' }); }
      (polos||[]).forEach((p:any)=>{ const f = p.finance_pole_id ? calcPole(p.finance_pole_id) : { ent:0,exp:0,bal:0 }; list.push({ level:'POLO', id:p.id, name:p.name, parent:root?.name||'', parent_id:root?.id||'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: p.finance_pole_id||'' }); });
      (nucleos||[]).filter((n:any)=> (polos||[]).some((p:any)=>p.id===n.polo_id)).forEach((n:any)=>{ const parent = (polos||[]).find((p:any)=>p.id===n.polo_id); const f = { ent:0,exp:0,bal:0 }; list.push({ level:'NUCLEO', id:n.id, name:n.name, parent:parent?.name||'', parent_id:parent?.id||'', entries:f.ent, expenses:f.exp, balance:f.bal, finance_id: n.finance_nucleo_id||'' }); });
      setRows(list);
      const lt: any = {}; list.forEach((r:any)=>{ lt[r.level] ||= { entries:0, expenses:0, balance:0 }; lt[r.level].entries += r.entries; lt[r.level].expenses += r.expenses; lt[r.level].balance += r.balance; }); setLevelTotals(lt);
      const financeIds = list.map((r:any)=>r.finance_id).filter((id:string)=>!!id);
      const { data: tgFac } = financeIds.length? await supabase.from('monthly_targets').select('*').eq('entity','FACULDADE').in('entity_id', financeIds): { data: [] } as any;
      const { data: tgPol } = financeIds.length? await supabase.from('monthly_targets').select('*').eq('entity','POLO').in('entity_id', financeIds): { data: [] } as any;
      const { data: tgNuc } = financeIds.length? await supabase.from('monthly_targets').select('*').eq('entity','NUCLEO').in('entity_id', financeIds): { data: [] } as any;
      const inRangeNode = (t:any)=>{ if (!start||!end) return true; const d = new Date(`${t.year}-${String(t.month).padStart(2,'0')}-01`).getTime(); return d >= new Date(start).getTime() && d <= new Date(end).getTime(); };
      const targetById: Record<string,{ receita:number, despesa:number }> = {};
      [ ...(tgFac||[]), ...(tgPol||[]), ...(tgNuc||[]) ].filter(inRangeNode).forEach((t:any)=>{ const key=t.entity_id; targetById[key] ||= { receita:0, despesa:0 }; if (t.nature==='RECEITA') targetById[key].receita += Number(t.target_amount||0); else targetById[key].despesa += Number(t.target_amount||0); });
      const childMap: Record<string,string> = { MATRIZ_EAD:'POLO', POLO:'NUCLEO' };
      const distributeChildren = (parent:any) => {
        const childLv = childMap[parent.level]; if (!childLv) return;
        const children = list.filter((r:any)=>r.parent_id===parent.id && r.level===childLv);
        if (!children.length) return;
        const explicitRec = children.reduce((s:number,c:any)=> s + (targetById[c.finance_id]?.receita||0), 0);
        const explicitDes = children.reduce((s:number,c:any)=> s + (targetById[c.finance_id]?.despesa||0), 0);
        const remRec = Math.max(0, (parent.meta_receita||0) - explicitRec);
        const remDes = Math.max(0, (parent.meta_despesa||0) - explicitDes);
        const vals = children.map((c:any)=>{ return distMode==='weights' ? (weightByNode[c.id]||1) : 1; });
        const sum = vals.reduce((s:number,v:number)=>s+v,0)||1;
        children.forEach((c:any,idx:number)=>{ const rec = targetById[c.finance_id]?.receita ?? (remRec * ((vals[idx]||1)/sum)); const des = targetById[c.finance_id]?.despesa ?? (remDes * ((vals[idx]||1)/sum)); c.meta_receita = rec; c.meta_despesa = des; c.diff_receita = c.entries - rec; c.diff_despesa = c.expenses - des; c.diff_balance = c.balance - (rec - des); distributeChildren(c); });
      };
      const rootNode = list.find((r:any)=>r.level==='MATRIZ_EAD'); if (rootNode) { rootNode.meta_receita = targets.receita; rootNode.meta_despesa = targets.despesa; distributeChildren(rootNode); }
      const lvlTargets: Record<string,{ receita:number, despesa:number, real_entries:number, real_expenses:number }> = {};
      list.forEach((r:any)=>{ const rec = r.meta_receita||0, des = r.meta_despesa||0; lvlTargets[r.level] ||= { receita:0, despesa:0, real_entries:0, real_expenses:0 }; lvlTargets[r.level].receita += rec; lvlTargets[r.level].despesa += des; lvlTargets[r.level].real_entries += r.entries; lvlTargets[r.level].real_expenses += r.expenses; if (r.meta_receita===undefined) { r.meta_receita = rec; r.meta_despesa = des; r.diff_receita = r.entries - rec; r.diff_despesa = r.expenses - des; r.diff_balance = r.balance - (rec - des); } });
      setLevelTargets(lvlTargets);
      const monthKey = (d:string) => { const nd=new Date(d); return `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}` };
      const m: Record<string,{ ent:number, meta:number }> = {};
      (filtPays||[]).forEach((r:any)=>{ const k=monthKey(r.date); m[k] ||= { ent:0, meta:0 }; m[k].ent += Number(r.amount||0); });
      [ ...(tgFac||[]), ...(tgPol||[]), ...(tgNuc||[]) ].filter(inRangeNode).forEach((t:any)=>{ const k=`${t.year}-${String(t.month).padStart(2,'0')}`; m[k] ||= { ent:0, meta:0 }; const v = Number(t.nature==='RECEITA'?t.target_amount||0:-(t.target_amount||0)); m[k].meta += v; });
      setTrend(Object.keys(m).sort().map(k=>({ month:k, real_balance: m[k].ent, meta_balance: m[k].meta })));
      const lvSet = Array.from(new Set(rows.map((r:any)=>r.level)));
      const byMonthLevel: Record<string, any> = {};
      (filtPays||[]).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; lvSet.forEach(lv=>{ byMonthLevel[k][`real_${lv}`] ||= 0 }); });
      rows.forEach((n:any)=>{
        const fid = n.finance_id; if (!fid) return;
        (filtPays||[]).filter((r:any)=>r.pole_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); byMonthLevel[k] ||= {}; byMonthLevel[k][`real_${n.level}`] = (byMonthLevel[k][`real_${n.level}`]||0) + Number(r.amount||0); });
      });
      setLevelTrendData(Object.keys(byMonthLevel).sort().map(k=>({ month:k, ...byMonthLevel[k], meta_balance: m[k]?.meta||0 })));
      if (selectedNodeIds.length) {
        const nodeMapName: Record<string,string> = {}; rows.forEach((n:any)=>{ nodeMapName[n.id] = n.name });
        const months = Object.keys(m).sort(); const itemByMonth: Record<string, any> = {}; months.forEach(k=>{ itemByMonth[k] = { month:k } });
        selectedNodeIds.forEach((nid)=>{
          const node = rows.find((n:any)=>n.id===nid); const fid = node?.finance_id; const labelReal = `real_${nid}`; const labelMeta = `meta_${nid}`;
          (filtPays||[]).filter((r:any)=>fid && r.pole_id===fid).forEach((r:any)=>{ const k=monthKey(r.date); itemByMonth[k][labelReal] = (itemByMonth[k][labelReal]||0) + Number(r.amount||0); });
          [ ...(tgFac||[]), ...(tgPol||[]), ...(tgNuc||[]) ].filter((t:any)=>fid && t.entity_id===fid).forEach((t:any)=>{ const k=`${t.year}-${String(t.month).padStart(2,'0')}`; const v = Number(t.nature==='RECEITA'?t.target_amount||0:-(t.target_amount||0)); itemByMonth[k][labelMeta] = (itemByMonth[k][labelMeta]||0) + v; });
        });
        setNodeTrendData(months.map(k=>itemByMonth[k]));
      } else setNodeTrendData([]);
      const rootF = (root as any)?.finance_faculty_id; if (rootF) {
        const y0 = start ? new Date(start).getFullYear() : undefined; const m0 = start ? (new Date(start).getMonth()+1) : undefined; const y1 = end ? new Date(end).getFullYear() : undefined; const m1 = end ? (new Date(end).getMonth()+1) : undefined;
        const { data: tg } = await supabase.from('monthly_targets').select('*').eq('entity','FACULDADE').eq('entity_id', rootF);
        const inRange = (t:any)=>{ if (!start||!end) return true; const d = new Date(`${t.year}-${String(t.month).padStart(2,'0')}-01`).getTime(); return d >= new Date(`${y0}-${String(m0).padStart(2,'0')}-01`).getTime() && d <= new Date(`${y1}-${String(m1).padStart(2,'0')}-01`).getTime(); };
        const rec = (tg||[]).filter((t:any)=>t.nature==='RECEITA' && inRange(t)).reduce((s:number,t:any)=>s+Number(t.target_amount||0),0);
        const des = (tg||[]).filter((t:any)=>t.nature==='DESPESA' && inRange(t)).reduce((s:number,t:any)=>s+Number(t.target_amount||0),0);
        setTargets({ receita: rec, despesa: des });
      } else setTargets({ receita:0, despesa:0 });
    }
  };
  useEffect(()=>{ loadRoots(); },[sys]);
  useEffect(()=>{ loadFilters(); },[sys, rootId]);
  useEffect(()=>{ loadWeights(); },[sys, rootId, persistWeights, ccId, start, end, weightViewStatus]);
  useEffect(()=>{ loadWeightsPreview(); },[sys, rootId, persistWeights, ccId, start, end, previewEnabled]);
  useEffect(()=>{ loadRows(); },[rootId, start, end, ccId, acct]);
  const exportCsv = () => {
    const meta = [`#meta,${sys},${rootId},${start||''},${end||''},${ccId||''},${acct||''},${distMode}`];
    const lines = [...meta, 'system,level,id,name,parent,entries,expenses,balance,meta_receita,meta_despesa,diff_receita,diff_despesa,diff_balance'];
    rows.forEach((r:any)=>lines.push(`${sys},${r.level},${r.id},${r.name},${r.parent},${r.entries},${r.expenses},${r.balance},${r.meta_receita||0},${r.meta_despesa||0},${r.diff_receita||0},${r.diff_despesa||0},${r.diff_balance||0}`));
    const blob = new Blob([lines.join('\n')], { type:'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `relatorio_multinivel_${sys}_${rootId}.csv`; a.click();
  };
  useEffect(()=>{
    const map: Record<string, number> = {};
    weightsText.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach(line=>{
      const [lv,id,w] = line.split(','); const num = Number(w||'0'); if (id && !isNaN(num)) map[id] = num;
    });
    setWeightByNode(map);
  },[weightsText]);
  const totals = rows.reduce((agg:any,r:any)=>({ entries: agg.entries + r.entries, expenses: agg.expenses + r.expenses, balance: agg.balance + r.balance }), { entries:0, expenses:0, balance:0 });
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Relatórios Multi‑Nível</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={sys} onValueChange={(v:any)=>{ setSys(v); setRootId(''); }}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IGREJA">Igreja</SelectItem><SelectItem value="CONVENCAO">Convenção</SelectItem><SelectItem value="FACULDADE">Faculdade</SelectItem></SelectContent></Select>
            <Select value={rootId} onValueChange={setRootId}><SelectTrigger className="w-64"><SelectValue placeholder="Raiz" /></SelectTrigger><SelectContent>{roots.map((r:any)=>(<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}</SelectContent></Select>
            <input type="date" value={start} onChange={(e)=>setStart(e.target.value)} />
            <input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} />
            <Select value={ccId} onValueChange={setCcId}><SelectTrigger className="w-56"><SelectValue placeholder="Centro de Custo" /></SelectTrigger><SelectContent>{centers.map((c:any)=>(<SelectItem key={c.id} value={c.id}>{c.code} • {c.name}</SelectItem>))}</SelectContent></Select>
            <Select value={acct} onValueChange={setAcct}><SelectTrigger className="w-56"><SelectValue placeholder="Conta" /></SelectTrigger><SelectContent>{accounts.map((a:any)=>(<SelectItem key={a.code} value={a.code}>{a.code} • {a.name}</SelectItem>))}</SelectContent></Select>
            <Select value={distMode} onValueChange={(v:any)=>setDistMode(v)}><SelectTrigger className="w-56"><SelectValue placeholder="Distribuição" /></SelectTrigger><SelectContent><SelectItem value="equal">Igual</SelectItem><SelectItem value="children">Por filhos</SelectItem><SelectItem value="weights">Por pesos</SelectItem></SelectContent></Select>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={normalizeWeights} onChange={(e)=>setNormalizeWeights(e.target.checked)} />Normalizar</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={inheritWeights} onChange={(e)=>setInheritWeights(e.target.checked)} />Herdar pesos</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={persistWeights} onChange={(e)=>setPersistWeights(e.target.checked)} />Persistir pesos</label>
            <Select value={weightViewStatus} onValueChange={setWeightViewStatus}><SelectTrigger className="w-40"><SelectValue placeholder="Visualização" /></SelectTrigger><SelectContent><SelectItem value="published">Publicado</SelectItem><SelectItem value="draft">Rascunho</SelectItem></SelectContent></Select>
            <button onClick={exportCsv} disabled={!rows.length || !!periodError}>Exportar CSV</button>
          </div>
          {distMode==='weights' && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Pesos: linhas "level,id,weight" (id do nó)</div>
              <textarea className="w-full h-24 border rounded p-2 text-xs" value={weightsText} onChange={(e)=>setWeightsText(e.target.value)} />
              {persistWeights && (
                <div>
                  <div className="flex items-center gap-2">
                    <button className="border rounded px-2 py-1 text-xs" onClick={async()=>{
                      const { data: sessionData } = await supabase.auth.getSession(); const uid = sessionData.session?.user?.id; let orgId = (sessionData.session?.user?.user_metadata as any)?.org_id || (sessionData.session?.user?.app_metadata as any)?.org_id || null; if (!orgId) { const jwt = sessionData.session?.access_token; if (jwt) { const p = jwt.split('.')[1]; const b = p?.replace(/-/g,'+')?.replace(/_/g,'/'); const pad = b ? b + '==='.slice((b.length+3)%4) : ''; try { const payload = JSON.parse(atob(pad)); orgId = payload?.org_id||null; } catch {} } }
                      const rowsToSave = rows.filter((r:any)=> typeof weightByNode[r.id] === 'number').map((r:any)=>({ entity: sys, root_id: rootId, level: r.level, node_id: r.id, weight: weightByNode[r.id], updated_by: uid, cost_center_id: ccId||null, account_code: acct||null, period_start: start||null, period_end: end||null, org_id: orgId, status: 'draft' }));
                      if (rowsToSave.length) await supabase.from('distribution_weights').upsert(rowsToSave, { onConflict: 'entity,root_id,level,node_id,cost_center_id,account_code,period_start,period_end' });
                    }}>Salvar rascunho</button>
                    <button className="border rounded px-2 py-1 text-xs" onClick={()=>{ setConfirmType('publish'); setConfirmOpen(true); }}>Publicar</button>
                    <button className="border rounded px-2 py-1 text-xs" onClick={()=>{ setConfirmType('delete'); setConfirmOpen(true); }}>Excluir pesos</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {['MATRIZ','SEDE','SUBSEDE','CONGREGACAO','NACIONAL','ESTADUAL','COORDENACAO','MATRIZ_EAD','POLO','NUCLEO'].map(lv=> (
                  <div key={`wl-${lv}`} className="border p-2 rounded">
                    <div className="text-xs mb-1">{lv}</div>
                    {rows.filter((r:any)=>r.level===lv).map((r:any)=>(
                      <div key={r.id} className="flex items-center gap-2 mb-1">
                        <span className="text-xs flex-1 truncate">{r.name}</span>
                        <input className="border rounded px-2 py-1 text-xs w-24" type="number" min="0" step="0.01" value={weightByNode[r.id]||''} onChange={(e)=>setWeightByNode({ ...weightByNode, [r.id]: Number(e.target.value||'0') })} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Switch checked={previewEnabled} onCheckedChange={setPreviewEnabled} />
                <span className="text-xs">Exibir preview published/draft</span>
              </div>
              {previewEnabled && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="border p-2 rounded">
                    <div className="text-xs mb-1">Draft</div>
                    {rows.map((r:any)=>(
                      <div key={`pd-${r.id}`} className="flex items-center justify-between text-xs">
                        <span className="truncate mr-2">{r.name}</span>
                        <span>{previewDraft[r.id]??''}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border p-2 rounded">
                    <div className="text-xs mb-1">Published</div>
                    {rows.map((r:any)=>(
                      <div key={`pp-${r.id}`} className="flex items-center justify-between text-xs">
                        <span className="truncate mr-2">{r.name}</span>
                        <span>{previewPublished[r.id]??''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {!!periodError && <div className="text-xs text-red-600">{periodError}</div>}
          <div className="grid grid-cols-3 gap-2">
            <div className="border p-2 rounded"><div className="text-xs">Entradas (subárvore)</div><div className="text-lg font-semibold">{totals.entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>
            <div className="border p-2 rounded"><div className="text-xs">Despesas (subárvore)</div><div className="text-lg font-semibold">{totals.expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>
            <div className="border p-2 rounded"><div className="text-xs">Saldo (subárvore)</div><div className="text-lg font-semibold">{totals.balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(levelTotals).map((lv)=> (
              <div key={lv} className="border p-2 rounded"><div className="text-xs">Total {lv}</div><div className="text-sm">{levelTotals[lv].entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • {levelTotals[lv].expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • {levelTotals[lv].balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>
            ))}
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.keys(levelTotals).map(lv=>({ level: lv, real_entries: levelTotals[lv].entries, real_expenses: levelTotals[lv].expenses, meta_receita: levelTargets[lv]?.receita||0, meta_despesa: levelTargets[lv]?.despesa||0 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="real_entries" name="Entradas Real" fill="#16a34a" />
                <Bar dataKey="meta_receita" name="Meta Receita" fill="#86efac" />
                <Bar dataKey="real_expenses" name="Despesas Real" fill="#ef4444" />
                <Bar dataKey="meta_despesa" name="Meta Despesa" fill="#fecaca" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 320 }} className="mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.keys(levelTotals).map(lv=>({ level: lv, real_balance: levelTotals[lv].balance, meta_balance: (levelTargets[lv]?.receita||0) - (levelTargets[lv]?.despesa||0) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="real_balance" name="Saldo Real" fill="#0ea5e9" />
                <Bar dataKey="meta_balance" name="Saldo Meta" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 280 }} className="mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={levelTrendData.length? levelTrendData : trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(levelTotals).map((lv,idx)=> (
                  <Line key={`rl-${lv}`} type="monotone" dataKey={`real_${lv}`} name={`Real ${lv}`} stroke={["#0ea5e9","#10b981","#f59e0b","#ef4444","#6366f1","#22c55e","#14b8a6","#f97316","#e11d48","#84cc16"][idx%10]} dot={false} />
                ))}
                <Line type="monotone" dataKey="meta_balance" name="Saldo Meta (período)" stroke="#93c5fd" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            <div className="text-xs">Selecionar nós para tendência por nó</div>
            <div className="grid grid-cols-3 gap-2">
              {rows.map((n:any)=>(
                <label key={`sel-${n.id}`} className="flex items-center gap-1 text-xs border rounded p-1">
                  <input type="checkbox" checked={selectedNodeIds.includes(n.id)} onChange={(e)=>{
                    const s = new Set(selectedNodeIds); if (e.target.checked) s.add(n.id); else s.delete(n.id); setSelectedNodeIds(Array.from(s));
                  }} />
                  <span className="truncate">{n.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ height: 280 }} className="mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={nodeTrendData.length? nodeTrendData : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedNodeIds.map((nid, idx)=> (
                  <>
                    <Line key={`rn-${nid}`} type="monotone" dataKey={`real_${nid}`} name={`Real ${rows.find(r=>r.id===nid)?.name||nid}`} stroke={["#0ea5e9","#10b981","#f59e0b","#ef4444","#6366f1","#22c55e","#14b8a6","#f97316","#e11d48","#84cc16"][idx%10]} dot={false} />
                    <Line key={`mn-${nid}`} type="monotone" dataKey={`meta_${nid}`} name={`Meta ${rows.find(r=>r.id===nid)?.name||nid}`} stroke="#93c5fd" dot={false} />
                  </>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border p-2 rounded"><div className="text-xs">Meta Receita</div><div className="text-lg font-semibold">{targets.receita.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>
            <div className="border p-2 rounded"><div className="text-xs">Meta Despesa</div><div className="text-lg font-semibold">{targets.despesa.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(levelTargets).map((lv)=> (
              <div key={`mt-${lv}`} className="border p-2 rounded">
                <div className="text-xs">Meta {lv}</div>
                <div className="text-sm">{levelTargets[lv].receita.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • {levelTargets[lv].despesa.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
                <div className="text-xs mt-1">Real • Meta • Dif</div>
                <div className="text-sm">R:{levelTargets[lv].real_entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} / M:{levelTargets[lv].receita.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} / D:{(levelTargets[lv].real_entries - levelTargets[lv].receita).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
                <div className="text-sm">R:{levelTargets[lv].real_expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} / M:{levelTargets[lv].despesa.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} / D:{(levelTargets[lv].real_expenses - levelTargets[lv].despesa).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {rows.map((r:any)=>(
              <div key={`${r.level}-${r.id}`} className="border p-2 rounded grid grid-cols-7 gap-2">
                <span>{r.level}</span>
                <span>{r.name}</span>
                <span>{r.entries.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                <span>{r.expenses.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                <span>{r.balance.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                <span>{(r.meta_receita||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} • {(r.meta_despesa||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                <span>{(r.diff_balance||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmType==='publish'?'Confirmar publicação':'Confirmar exclusão'}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async()=>{
              if (confirmType==='publish') {
                const { data: sessionData } = await supabase.auth.getSession(); const uid = sessionData.session?.user?.id; let orgId = (sessionData.session?.user?.user_metadata as any)?.org_id || (sessionData.session?.user?.app_metadata as any)?.org_id || null; if (!orgId) { const jwt = sessionData.session?.access_token; if (jwt) { const p = jwt.split('.')[1]; const b = p?.replace(/-/g,'+')?.replace(/_/g,'/'); const pad = b ? b + '==='.slice((b.length+3)%4) : ''; try { const payload = JSON.parse(atob(pad)); orgId = payload?.org_id||null; } catch {} } }
                const now = new Date().toISOString();
                const rowsToSave = rows.filter((r:any)=> typeof weightByNode[r.id] === 'number').map((r:any)=>({ entity: sys, root_id: rootId, level: r.level, node_id: r.id, weight: weightByNode[r.id], updated_by: uid, cost_center_id: ccId||null, account_code: acct||null, period_start: start||null, period_end: end||null, org_id: orgId, status: 'published', published_by: uid, published_at: now }));
                if (rowsToSave.length) await supabase.from('distribution_weights').upsert(rowsToSave, { onConflict: 'entity,root_id,level,node_id,cost_center_id,account_code,period_start,period_end' });
              }
              if (confirmType==='delete') {
                const { data: sessionData } = await supabase.auth.getSession(); let orgId = (sessionData.session?.user?.user_metadata as any)?.org_id || (sessionData.session?.user?.app_metadata as any)?.org_id || null; if (!orgId) { const jwt = sessionData.session?.access_token; if (jwt) { const p = jwt.split('.')[1]; const b = p?.replace(/-/g,'+')?.replace(/_/g,'/'); const pad = b ? b + '==='.slice((b.length+3)%4) : ''; try { const payload = JSON.parse(atob(pad)); orgId = payload?.org_id||null; } catch {} } }
                const q = supabase.from('distribution_weights').delete().eq('entity', sys).eq('root_id', rootId).eq('cost_center_id', ccId||null).eq('account_code', acct||null).eq('period_start', start||null).eq('period_end', end||null);
                await (orgId ? q.eq('org_id', orgId) : q);
                await loadWeights();
              }
              setConfirmOpen(false); setConfirmType('none');
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

