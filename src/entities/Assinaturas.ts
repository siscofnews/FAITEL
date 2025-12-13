import { supabase } from "@/integrations/supabase/client";

export interface ModuloItem { key: string; name: string }
export interface PlanoItem { id?: string; name: string }
export interface AssinaturaItem {
  id?: string;
  church_id: string;
  plan_id?: string | null;
  status: 'active' | 'blocked' | 'pending';
  last_payment_at?: string | null;
}

export const Modulos = {
  async list() {
    const { data, error } = await supabase.from('siscof_modules').select('*');
    if (error) throw error;
    return (data || []) as ModuloItem[];
  },
  async upsert(items: ModuloItem[]) {
    const { error } = await supabase.from('siscof_modules').upsert(items);
    if (error) throw error;
    return true;
  }
};

export const Planos = {
  async list() {
    const { data, error } = await supabase.from('siscof_plans').select('*');
    if (error) throw error;
    return (data || []) as PlanoItem[];
  },
};

export const Assinaturas = {
  async listByChurch(church_id: string) {
    const { data, error } = await supabase
      .from('siscof_subscriptions')
      .select('*')
      .eq('church_id', church_id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as AssinaturaItem[];
  },
  async listAll(states?: string[]) {
    const { data, error } = await supabase
      .from('siscof_subscriptions')
      .select('*, church:churches(nome_fantasia, cidade, estado)')
      .in(states && states.length ? 'church.estado' : 'id', states && states.length ? states : undefined as any)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  },
  async setPayment(id: string, dateISO: string) {
    const { data, error } = await supabase
      .from('siscof_subscriptions')
      .update({ last_payment_at: dateISO, status: 'active' })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as AssinaturaItem;
  },
  async block(id: string) {
    const { data, error } = await supabase
      .from('siscof_subscriptions')
      .update({ status: 'blocked' })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as AssinaturaItem;
  },
};

export const PlanModules = {
  async listByPlan(plan_id: string) {
    const { data, error } = await supabase
      .from('siscof_plan_modules')
      .select('*')
      .eq('plan_id', plan_id);
    if (error) throw error;
    return (data || []) as { plan_id: string; module_key: string }[];
  },
  async add(plan_id: string, module_key: string) {
    const { error } = await supabase
      .from('siscof_plan_modules')
      .upsert({ plan_id, module_key });
    if (error) throw error;
    return true;
  },
  async remove(plan_id: string, module_key: string) {
    const { error } = await supabase
      .from('siscof_plan_modules')
      .delete()
      .eq('plan_id', plan_id)
      .eq('module_key', module_key);
    if (error) throw error;
    return true;
  },
};

