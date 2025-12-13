import { supabase } from "@/integrations/supabase/client";

export async function listMembersByChurch(churchId: string) {
  const { data, error } = await supabase
    .from('members')
    .select('user_id, full_name, email')
    .eq('church_id', churchId)
    .eq('is_active', true)
    .order('full_name');
  if (error) throw error;
  return data || [];
}

export async function listAssignments(churchId: string, roles: string[]) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role, is_manipulator')
    .eq('church_id', churchId)
    .in('role', roles);
  if (error) throw error;
  return data || [];
}

export async function assignLocalRole(churchId: string, userId: string, roleName: string, grantedBy: string, reason: string = 'Local role assignment') {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role: roleName, church_id: churchId, is_manipulator: true, granted_by: grantedBy, scope_church_id: churchId });
  if (error) throw error;
  const { error: logErr } = await supabase
    .from('permission_logs')
    .insert({ action: 'granted', user_id: userId, granted_by: grantedBy, church_id: churchId, role_granted: roleName, reason });
  if (logErr) throw logErr;
  return true;
}

export async function revokeLocalRole(churchId: string, userId: string, roleName: string, revokedBy: string, reason: string = 'Local role revoke') {
  const { error } = await supabase
    .from('user_roles')
    .update({ is_manipulator: false, granted_by: null, scope_church_id: null })
    .eq('user_id', userId)
    .eq('role', roleName)
    .eq('church_id', churchId);
  if (error) throw error;
  const { error: logErr } = await supabase
    .from('permission_logs')
    .insert({ action: 'revoked', user_id: userId, granted_by: revokedBy, church_id: churchId, role_granted: roleName, reason });
  if (logErr) throw logErr;
  return true;
}

export async function listPermissionLogs(churchId: string, startDate?: string, endDate?: string) {
  const { data, error } = await supabase
    .from('permission_logs')
    .select('*')
    .eq('church_id', churchId)
    .gte(startDate ? 'created_at' : 'created_at', startDate || '1970-01-01')
    .lte(endDate ? 'created_at' : 'created_at', endDate || '2999-12-31')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function listStateScope(churchId: string, userId: string) {
  const { data, error } = await supabase
    .from('state_scope')
    .select('state_code')
    .eq('church_id', churchId)
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((d: any) => d.state_code);
}

export async function saveStateScope(churchId: string, userId: string, states: string[]) {
  const { error: delErr } = await supabase
    .from('state_scope')
    .delete()
    .eq('church_id', churchId)
    .eq('user_id', userId);
  if (delErr) throw delErr;
  if (states.length === 0) return true;
  const rows = states.map(s => ({ church_id: churchId, user_id: userId, state_code: s }));
  const { error } = await supabase.from('state_scope').insert(rows);
  if (error) throw error;
  return true;
}

