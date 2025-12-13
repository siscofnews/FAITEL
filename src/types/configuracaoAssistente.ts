export interface ConfiguracaoAssistente {
    horarioPadraoEnvio: string;
    diasAntecedenciaPadrao: number;
    mensagemPersonalizadaWhatsApp?: string;
    lembretesAutomaticosAtivos: boolean;
    notificarAdminSobreEnvios: boolean;
    emailAdminNotificacao?: string;
    recorrenciaLembretes: boolean;
}

export const configuracaoAssistenteDefault: ConfiguracaoAssistente = {
    horarioPadraoEnvio: "09:00",
    diasAntecedenciaPadrao: 3,
    lembretesAutomaticosAtivos: true,
    notificarAdminSobreEnvios: false,
    recorrenciaLembretes: true
};
