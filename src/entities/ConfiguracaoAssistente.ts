import { supabase } from "@/integrations/supabase/client";

export interface ConfiguracaoAssistenteItem {
  id?: string;
  horarioPadraoEnvio: string;
  diasAntecedenciaPadrao: number;
  mensagemPersonalizadaWhatsApp?: string;
  lembretesAutomaticosAtivos: boolean;
  notificarAdminSobreEnvios: boolean;
  emailAdminNotificacao?: string;
  recorrenciaLembretes: boolean;
}

const toApp = (row: any): ConfiguracaoAssistenteItem => ({
  id: row.id,
  horarioPadraoEnvio: row.horario_padrao_envio ?? "09:00",
  diasAntecedenciaPadrao: row.dias_antecedencia_padrao ?? 3,
  mensagemPersonalizadaWhatsApp: row.mensagem_personalizada_whatsapp ?? "",
  lembretesAutomaticosAtivos: !!row.lembretes_automaticos_ativos,
  notificarAdminSobreEnvios: !!row.notificar_admin_sobre_envios,
  emailAdminNotificacao: row.email_admin_notificacao ?? "",
  recorrenciaLembretes: !!row.recorrencia_lembretes,
});

const toRow = (item: Partial<ConfiguracaoAssistenteItem>) => ({
  horario_padrao_envio: item.horarioPadraoEnvio,
  dias_antecedencia_padrao: item.diasAntecedenciaPadrao,
  mensagem_personalizada_whatsapp: item.mensagemPersonalizadaWhatsApp,
  lembretes_automaticos_ativos: item.lembretesAutomaticosAtivos,
  notificar_admin_sobre_envios: item.notificarAdminSobreEnvios,
  email_admin_notificacao: item.emailAdminNotificacao,
  recorrencia_lembretes: item.recorrenciaLembretes,
});

export const ConfiguracaoAssistente = {
  async list() {
    const { data, error } = await supabase
      .from("assistant_settings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(toApp);
  },

  async find() {
    const list = await this.list();
    return list[0] || null;
  },

  async create(payload: ConfiguracaoAssistenteItem) {
    const { data, error } = await supabase
      .from("assistant_settings")
      .insert(toRow(payload))
      .select("*")
      .single();
    if (error) throw error;
    return toApp(data);
  },

  async update(id: string, changes: Partial<ConfiguracaoAssistenteItem>) {
    const { data, error } = await supabase
      .from("assistant_settings")
      .update(toRow(changes))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return toApp(data);
  },
};

