import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { listMembersByChurch, listAssignments, assignLocalRole, revokeLocalRole, listPermissionLogs, listStateScope, saveStateScope } from "@/wiring/localRoles";
import { permittedLocalRolesForLevel } from "@/config/permissionTemplates";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const ROLES = [
  { key: 'secretario', label: 'Secretário' },
  { key: 'primeiro_tesoureiro', label: 'Primeiro Tesoureiro' },
  { key: 'segundo_tesoureiro', label: 'Segundo Tesoureiro' },
  { key: 'coordenador', label: 'Coordenador' },
  { key: 'vice_presidente', label: 'Vice Presidente' },
  { key: 'presidente_estadual', label: 'Presidente Estadual' },
];

export default function PerfisLocais() {
  const { churchId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<'matriz'|'sede'|'subsede'|'congregacao'|'celula'|'unknown'>('unknown');
  const [canManage, setCanManage] = useState(false);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [scopeStates, setScopeStates] = useState<string[]>([]);

  const roleKeys = useMemo(() => ROLES.map(r => r.key), []);

  const load = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const [m, a, l, church, myRoles] = await Promise.all([
        listMembersByChurch(churchId),
        listAssignments(churchId, roleKeys),
        listPermissionLogs(churchId, startDate || undefined, endDate || undefined),
        supabase.from('churches').select('nivel').eq('id', churchId).single(),
        user?.id ? supabase.from('user_roles').select('role,is_manipulator').eq('user_id', user.id).eq('church_id', churchId) : Promise.resolve({ data: [] as any[] }),
      ]);
      setMembers(m);
      const map: Record<string, string> = {};
      a.forEach((r: any) => { if (r.is_manipulator) map[r.role] = r.user_id; });
      setAssignments(map);
      setSelected(map);
      setLogs(l);
      if (church?.data?.nivel) setLevel(church.data.nivel);
      const mr: any[] = (myRoles as any).data || [];
      const hasManipulator = mr.some(r => r.is_manipulator);
      const hasAdminRole = mr.some(r => ['pastor_presidente','admin','pastor'].includes(r.role));
      setCanManage(user?.id ? (hasManipulator || hasAdminRole || !!(user as any).isSuperAdmin) : false);
      const ids = new Set<string>();
      m.forEach((x: any) => ids.add(x.user_id));
      (l || []).forEach((x: any) => { if (x.user_id) ids.add(x.user_id); if (x.granted_by) ids.add(x.granted_by); });
      const missing = Array.from(ids).filter(id => !m.find((x: any) => x.user_id === id));
      let profiles: any[] = [];
      if (missing.length) {
        const { data: prof } = await supabase.from('profiles').select('user_id, full_name').in('user_id', missing);
        profiles = prof || [];
      }
      const nameMapLocal: Record<string, string> = {};
      m.forEach((x: any) => { nameMapLocal[x.user_id] = x.full_name; });
      profiles.forEach((x: any) => { if (!nameMapLocal[x.user_id]) nameMapLocal[x.user_id] = x.full_name; });
      setNameMap(nameMapLocal);

      if (church?.data?.nivel === 'matriz' && nameMapLocal[assignments['presidente_estadual']]) {
        const states = await listStateScope(churchId, assignments['presidente_estadual']);
        setScopeStates(states);
      } else {
        setScopeStates([]);
      }
    } catch (e: any) {
      toast({ title: 'Erro ao carregar', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [churchId]);

  const onSave = async (role: string) => {
    if (!churchId || !user?.id) return;
    if (!canManage) return;
    const allowed = level !== 'unknown' ? permittedLocalRolesForLevel(level as any) : ROLES.map(r => r.key);
    if (!allowed.includes(role)) {
      toast({ title: 'Não permitido pelo nível', description: 'Este perfil não pode ser atribuído nesta unidade.', variant: 'destructive' });
      return;
    }
    const target = selected[role];
    try {
      if (!target) {
        const current = assignments[role];
        if (current) await revokeLocalRole(churchId, current, role, user.id);
        toast({ title: 'Perfil revogado' });
      } else {
        await assignLocalRole(churchId, target, role, user.id);
        toast({ title: 'Perfil atribuído' });
      }
      await load();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const applyBulk = async () => {
    if (!canManage || !churchId || !user?.id) return;
    setBulkRunning(true);
    try {
      const allowed = level !== 'unknown' ? permittedLocalRolesForLevel(level as any) : ROLES.map(r => r.key);
      for (const r of ROLES) {
        if (!allowed.includes(r.key)) continue;
        const target = selected[r.key];
        const current = assignments[r.key];
        if (target === current) continue;
        if (!target && current) {
          await revokeLocalRole(churchId, current, r.key, user.id, 'Bulk revoke');
        } else if (target) {
          await assignLocalRole(churchId, target, r.key, user.id, 'Bulk grant');
        }
      }
      await load();
      toast({ title: 'Atribuições em massa aplicadas' });
    } catch (e: any) {
      toast({ title: 'Erro em massa', description: e.message, variant: 'destructive' });
    } finally {
      setBulkRunning(false);
    }
  };

  const BR_STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
  const toggleState = (uf: string) => {
    setScopeStates(prev => prev.includes(uf) ? prev.filter(s => s !== uf) : [...prev, uf]);
  };
  const saveScope = async () => {
    if (!canManage || !churchId) return;
    const uid = selected['presidente_estadual'] || assignments['presidente_estadual'];
    if (!uid) return;
    await saveStateScope(churchId, uid, scopeStates);
    toast({ title: 'Escopo regional salvo' });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Perfis Locais</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Input placeholder="Filtrar membros por nome/email" value={search} onChange={(e) => setSearch(e.target.value)} />
        {!canManage && <Badge variant="outline">Somente leitura</Badge>}
        {canManage && <Button onClick={applyBulk} disabled={loading || bulkRunning}>Aplicar em massa</Button>}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button variant="outline" onClick={() => load()} disabled={loading}>Filtrar auditoria</Button>
        <Button variant="secondary" onClick={exportAuditCSV} disabled={logs.length === 0}>Exportar Auditoria</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ROLES.map(r => (
          <Card key={r.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {r.label}
                {level !== 'unknown' && !permittedLocalRolesForLevel(level as any).includes(r.key) && (
                  <Badge variant="destructive">não disponível neste nível</Badge>
                )}
                {r.key === 'presidente_estadual' && level === 'matriz' && assignments[r.key] && scopeStates.length > 0 && (
                  <Badge variant="outline">Escopo Regional: {scopeStates.join(', ')}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Atual: {members.find(m => m.user_id === assignments[r.key])?.full_name || 'Nenhum'}</Badge>
              </div>
              <Select disabled={!canManage || (level !== 'unknown' && !permittedLocalRolesForLevel(level as any).includes(r.key))} value={selected[r.key] || ''} onValueChange={(v) => setSelected(prev => ({ ...prev, [r.key]: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar membro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {members.filter(m => {
                    const t = search.toLowerCase();
                    return !t || (m.full_name || '').toLowerCase().includes(t) || (m.email || '').toLowerCase().includes(t);
                  }).map(m => (
                    <SelectItem key={m.user_id} value={m.user_id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={() => onSave(r.key)} disabled={loading || !canManage || (level !== 'unknown' && !permittedLocalRolesForLevel(level as any).includes(r.key))}>Salvar</Button>
                {assignments[r.key] && canManage && (
                  <Button variant="destructive" onClick={() => { setSelected(prev => ({ ...prev, [r.key]: '' })); onSave(r.key); }}>Revogar</Button>
                )}
              </div>

              {r.key === 'presidente_estadual' && level === 'matriz' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {BR_STATES.map(uf => (
                      <Button key={uf} variant={scopeStates.includes(uf) ? 'secondary' : 'outline'} size="sm" onClick={() => toggleState(uf)} disabled={!canManage}>{uf}</Button>
                    ))}
                  </div>
                  <Button onClick={saveScope} disabled={!canManage || !(selected['presidente_estadual'] || assignments['presidente_estadual'])}>Salvar Alcance</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Auditoria de Concessões</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Nenhum registro.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{l.action} {l.role_granted} {nameMap[l.granted_by] ? `por ${nameMap[l.granted_by]}` : ''} {nameMap[l.user_id] ? `para ${nameMap[l.user_id]}` : ''}</span>
                    <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

  const exportAuditCSV = () => {
    const rows = [['data','acao','papel','concedido_por','concedido_para']];
    logs.forEach((l: any) => {
      rows.push([
        new Date(l.created_at).toISOString(),
        l.action,
        l.role_granted,
        nameMap[l.granted_by] || l.granted_by || '',
        nameMap[l.user_id] || l.user_id || '',
      ]);
    });
    const csv = rows.map(r => r.map(v => `${String(v).replace(/"/g,'""')}`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${churchId}_${(startDate||'inicio')}_${(endDate||'fim')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
