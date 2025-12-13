import { supabase } from "@/integrations/supabase/client";

export async function getUserScopeStates(userId: string) {
  const { data, error } = await supabase
    .from('state_scope')
    .select('state_code')
    .eq('user_id', userId);
  if (error) throw error;
  const dbStates = (data || []).map((d: any) => d.state_code);
  try {
    const overrideRaw = localStorage.getItem('siscof_scope_override');
    const override = overrideRaw ? JSON.parse(overrideRaw) : [];
    const set = new Set([...(dbStates || []), ...(override || [])]);
    return Array.from(set);
  } catch {
    return dbStates;
  }
}

export async function filterChurchesByScope(states: string[]) {
  const query = supabase.from('churches').select('id, nome_fantasia, estado').eq('is_approved', true);
  if (states && states.length > 0) return query.in('estado', states);
  return query;
}

export function setScopeOverride(states: string[]) {
  localStorage.setItem('siscof_scope_override', JSON.stringify(states || []));
}


