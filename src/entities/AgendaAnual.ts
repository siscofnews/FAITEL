import { supabase } from "@/integrations/supabase/client";

export interface AgendaAnualItem {
  id?: string;
  church_id?: string | null;
  titulo: string;
  data_inicio: string; // ISO date
  data_fim?: string | null; // ISO date
  horario?: string | null;
  local?: string | null;
  descricao?: string | null;
  escalados?: string[];
  cor?: string; // 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal'
  publicado?: boolean;
  is_cemadeb?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const AgendaAnual = {
  async list(orderBy: 'data_inicio' | 'created_at' = 'data_inicio') {
    const { data, error } = await supabase
      .from('annual_agenda')
      .select('*')
      .order(orderBy, { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...row,
      nome_evento: row.titulo,
    })) as AgendaAnualItem[];
  },

  async filter(filters: Partial<AgendaAnualItem>, orderBy: 'data_inicio' | 'created_at' = 'data_inicio') {
    let query = supabase.from('annual_agenda').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined) return;
      query = query.eq(key as any, value as any);
    });
    const { data, error } = await query.order(orderBy, { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...row,
      nome_evento: row.titulo,
    })) as AgendaAnualItem[];
  },

  async create(payload: AgendaAnualItem) {
    const { data, error } = await supabase
      .from('annual_agenda')
      .insert({
        church_id: payload.church_id || null,
        titulo: payload.titulo,
        data_inicio: payload.data_inicio,
        data_fim: payload.data_fim || null,
        horario: payload.horario || null,
        local: payload.local || null,
        descricao: payload.descricao || null,
        escalados: payload.escalados || [],
        cor: payload.cor || 'blue',
        publicado: payload.publicado ?? true,
        is_cemadeb: payload.is_cemadeb ?? false,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as AgendaAnualItem;
  },

  async update(id: string, changes: Partial<AgendaAnualItem>) {
    const { data, error } = await supabase
      .from('annual_agenda')
      .update({
        titulo: changes.titulo,
        data_inicio: changes.data_inicio,
        data_fim: changes.data_fim,
        horario: changes.horario,
        local: changes.local,
        descricao: changes.descricao,
        escalados: changes.escalados,
        cor: changes.cor,
        publicado: changes.publicado,
        is_cemadeb: changes.is_cemadeb,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as AgendaAnualItem;
  },

  async delete(id: string) {
    const { error } = await supabase.from('annual_agenda').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

