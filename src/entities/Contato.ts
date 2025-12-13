import { supabase } from "@/integrations/supabase/client";

export interface ContatoItem {
  id?: string;
  nome: string;
  email?: string | null;
  whatsapp?: string | null;
  ativo: boolean;
  preferencia_notificacao?: 'email' | 'whatsapp' | 'ambos';
  dias_antecedencia?: number;
  horario_lembrete?: string | null;
  updated_at?: string;
}

const toApp = (row: any): ContatoItem => ({
  id: row.id,
  nome: row.nome,
  email: row.email,
  whatsapp: row.whatsapp,
  ativo: !!row.ativo,
  preferencia_notificacao: row.preferencia_notificacao || 'ambos',
  dias_antecedencia: row.dias_antecedencia || 3,
  horario_lembrete: row.horario_lembrete,
  updated_at: row.updated_at,
});

export const Contato = {
  async list(order: string = '-updated_at') {
    const ascending = !order.startsWith('-');
    const field = order.replace(/^-/, '') || 'updated_at';
    const { data, error } = await supabase.from('people_contacts').select('*').order(field, { ascending });
    if (error) throw error;
    return (data || []).map(toApp);
  },

  async filter(filters: { ativo?: boolean }) {
    let query = supabase.from('people_contacts').select('*');
    if (typeof filters.ativo === 'boolean') query = query.eq('ativo', filters.ativo);
    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toApp);
  },

  async create(payload: ContatoItem) {
    const { data, error } = await supabase
      .from('people_contacts')
      .insert({
        nome: payload.nome,
        email: payload.email || null,
        whatsapp: payload.whatsapp || null,
        ativo: payload.ativo,
        preferencia_notificacao: payload.preferencia_notificacao || 'ambos',
        dias_antecedencia: payload.dias_antecedencia || 3,
        horario_lembrete: payload.horario_lembrete || null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toApp(data);
  },

  async update(id: string, payload: ContatoItem) {
    const { data, error } = await supabase
      .from('people_contacts')
      .update({
        nome: payload.nome,
        email: payload.email || null,
        whatsapp: payload.whatsapp || null,
        ativo: payload.ativo,
        preferencia_notificacao: payload.preferencia_notificacao || 'ambos',
        dias_antecedencia: payload.dias_antecedencia || 3,
        horario_lembrete: payload.horario_lembrete || null,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return toApp(data);
  },

  async delete(id: string) {
    const { error } = await supabase.from('people_contacts').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async search(term: string) {
    const like = `%${term}%`;
    const { data, error } = await supabase
      .from('people_contacts')
      .select('*')
      .or(`nome.ilike.${like},email.ilike.${like},whatsapp.ilike.${like}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toApp);
  },
};

