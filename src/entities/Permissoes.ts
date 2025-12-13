import { supabase } from "@/integrations/supabase/client";

export interface RoleAssignmentItem {
  id?: string;
  user_id: string;
  scope: 'global' | 'local';
  role_name: string;
  church_id?: string | null;
  org_unit_id?: string | null;
}

export const Permissoes = {
  async listByUser(user_id: string) {
    const { data, error } = await supabase
      .from('role_assignments')
      .select('*')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as RoleAssignmentItem[];
  },

  async assign(payload: RoleAssignmentItem) {
    const { data, error } = await supabase
      .from('role_assignments')
      .insert({
        user_id: payload.user_id,
        scope: payload.scope,
        role_name: payload.role_name,
        church_id: payload.church_id || null,
        org_unit_id: payload.org_unit_id || null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as RoleAssignmentItem;
  },

  async revoke(id: string) {
    const { error } = await supabase
      .from('role_assignments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

