import { supabase } from "@/integrations/supabase/client";

export interface EscalaItem {
  id?: string;
  data: string; // YYYY-MM-DD
  evento?: string;
  nome_escala?: string;
  congregacao?: string | null;
  escalados?: string[];
  observacoes?: string | null;
  publicada?: boolean;
}

const toApp = (row: any): EscalaItem => ({
  id: row.id,
  data: row.data,
  evento: row.titulo || row.tipo,
  nome_escala: row.titulo || row.tipo,
  congregacao: row.congregacao || null,
  escalados: row.escalados || [],
  observacoes: row.observacoes || null,
  publicada: row.publicada ?? true,
});

export const Escala = {
  async filter(filters: Partial<EscalaItem>, orderBy: 'data' | 'created_at' = 'data') {
    let query = supabase.from('service_schedules').select('*');
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined) return;
      if (k === 'publicada') return; // campo não nativo
      query = query.eq(k as any, v as any);
    });
    const { data, error } = await query.order(orderBy, { ascending: false });
    if (error) throw error;
    return (data || []).map(toApp);
  },
};

