import { supabase } from "@/integrations/supabase/client";

export interface HistoricoLembreteItem {
  id?: string;
  refId: string;
  contatoId: string;
  delivery_method?: 'email' | 'whatsapp' | 'both';
  delivery_status?: 'sent' | 'failed' | 'delivered';
  message_content?: string;
  sent_at?: string;
}

const toApp = (row: any): HistoricoLembreteItem => ({
  id: row.id,
  refId: row.ref_id,
  contatoId: row.contato_id,
  delivery_method: row.delivery_method,
  delivery_status: row.delivery_status,
  message_content: row.message_content,
  sent_at: row.sent_at,
});

export class HistoricoLembrete {
  refId: string;
  contatoId: string;
  delivery_method?: 'email' | 'whatsapp' | 'both';
  delivery_status?: 'sent' | 'failed' | 'delivered';
  message_content?: string;

  constructor(payload: {
    refId: string;
    contatoId: string;
    tipoRef?: string;
    mensagem?: string;
    status?: 'enviado' | 'falhado' | 'entregue';
  }) {
    this.refId = payload.refId;
    this.contatoId = payload.contatoId;
    this.delivery_method = 'whatsapp';
    this.delivery_status = payload.status === 'falhado' ? 'failed' : payload.status === 'entregue' ? 'delivered' : 'sent';
    this.message_content = payload.mensagem || '';
  }

  async save() {
    const { data, error } = await supabase
      .from('assistant_send_history')
      .insert({
        ref_id: this.refId,
        contato_id: this.contatoId,
        delivery_method: this.delivery_method,
        delivery_status: this.delivery_status,
        message_content: this.message_content,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toApp(data);
  }

  static async filter(filters: { dataEnvio?: string; contatoId?: string; refId?: string }) {
    let query = supabase.from('assistant_send_history').select('*');
    if (filters.dataEnvio) {
      const start = `${filters.dataEnvio}T00:00:00`;
      const end = `${filters.dataEnvio}T23:59:59.999`;
      query = query.gte('sent_at', start).lte('sent_at', end);
    }
    if (filters.contatoId) query = query.eq('contato_id', filters.contatoId);
    if (filters.refId) query = query.eq('ref_id', filters.refId);
    const { data, error } = await query.order('sent_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toApp);
  }

  static async create(payload: HistoricoLembreteItem) {
    const { data, error } = await supabase
      .from('assistant_send_history')
      .insert({
        ref_id: payload.refId,
        contato_id: payload.contatoId,
        delivery_method: payload.delivery_method || 'whatsapp',
        delivery_status: payload.delivery_status || 'sent',
        message_content: payload.message_content || null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toApp(data);
  }
}

