-- =====================================================
-- SISCOF: Sistema de Notificações e Configurações Visuais
-- Data: 2025-12-11
-- =====================================================

-- Tabela de preferências de notificação dos alunos
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES members(id) ON DELETE CASCADE,
  whatsapp TEXT,
  email TEXT,
  notify_new_classes BOOLEAN DEFAULT true,
  notify_evaluations BOOLEAN DEFAULT true,
  notify_enrollment_status BOOLEAN DEFAULT true,
  notify_new_content BOOLEAN DEFAULT true,
  days_before_class INTEGER DEFAULT 1,
  days_before_evaluation INTEGER DEFAULT 3,
  preferred_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Índice para busca rápida por aluno
CREATE INDEX idx_notification_prefs_student ON notification_preferences(student_id);

-- Tabela de lembretes/notificações agendadas
CREATE TABLE IF NOT EXISTS student_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES members(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'class', 'evaluation', 'enrollment', 'new_content'
  reference_id UUID, -- ID da aula/avaliação/matrícula
  reference_title TEXT, -- Título do item (para facilitar consultas)
  scheduled_date TIMESTAMP NOT NULL,
  sent_date TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  delivery_method TEXT DEFAULT 'email', -- 'email', 'whatsapp', 'both'
  message_content TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para busca eficiente
CREATE INDEX idx_reminders_student ON student_reminders(student_id);
CREATE INDEX idx_reminders_status ON student_reminders(status);
CREATE INDEX idx_reminders_scheduled ON student_reminders(scheduled_date);
CREATE INDEX idx_reminders_type ON student_reminders(reminder_type);

-- Tabela de configurações visuais do sistema
CREATE TABLE IF NOT EXISTS visual_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_type TEXT UNIQUE NOT NULL, -- 'logo', 'primary_color', 'secondary_color', 'header_text', 'certificate_header'
  setting_value TEXT NOT NULL,
  setting_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca por tipo
CREATE INDEX idx_visual_settings_type ON visual_settings(setting_type);

-- Tabela de histórico de notificações enviadas
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id UUID REFERENCES student_reminders(id) ON DELETE CASCADE,
  student_id UUID REFERENCES members(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_to TEXT, -- Email ou número de WhatsApp
  sent_at TIMESTAMP DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'bounced'
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para análise
CREATE INDEX idx_notification_history_student ON notification_history(student_id);
CREATE INDEX idx_notification_history_sent ON notification_history(sent_at);
CREATE INDEX idx_notification_history_status ON notification_history(delivery_status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_reminders_updated_at
    BEFORE UPDATE ON student_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visual_settings_updated_at
    BEFORE UPDATE ON visual_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações visuais padrão
INSERT INTO visual_settings (setting_type, setting_value, setting_description, is_active) VALUES
  ('header_text', 'SISCOF - Sistema de Escola de Culto', 'Texto do cabeçalho principal', true),
  ('primary_color', '#4F46E5', 'Cor primária do sistema (Indigo)', true),
  ('secondary_color', '#7C3AED', 'Cor secundária do sistema (Purple)', true),
  ('certificate_header', 'CERTIFICADO DE CONCLUSÃO', 'Cabeçalho para certificados', true)
ON CONFLICT (setting_type) DO NOTHING;

-- View para estatísticas de notificações
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  student_id,
  COUNT(*) as total_reminders,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
  MAX(sent_date) as last_notification_sent
FROM student_reminders
GROUP BY student_id;

-- Comentários nas tabelas
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação configuradas pelos alunos';
COMMENT ON TABLE student_reminders IS 'Lembretes e notificações agendadas para alunos';
COMMENT ON TABLE visual_settings IS 'Configurações visuais e de branding do sistema';
COMMENT ON TABLE notification_history IS 'Histórico completo de notificações enviadas';

-- Comentários nas colunas importantes
COMMENT ON COLUMN student_reminders.reminder_type IS 'Tipo: class (aula), evaluation (prova), enrollment (matrícula), new_content (novo conteúdo)';
COMMENT ON COLUMN student_reminders.status IS 'Status: pending (pendente), sent (enviado), failed (falhou), cancelled (cancelado)';
COMMENT ON COLUMN visual_settings.setting_type IS 'Tipo: logo, primary_color, secondary_color, header_text, certificate_header';
