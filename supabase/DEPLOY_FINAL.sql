-- ==========================================
-- SISCOF - DEPLOY COMPLETO (FINAL)
-- ==========================================
-- Este arquivo contém TODOS os SQLs necessários
-- Execute UMA ÚNICA VEZ no Supabase SQL Editor
-- ==========================================
-- Data: 07/12/2025
-- Versão: 1.0 - Implementação Completa
-- ==========================================

-- ==========================================
-- PARTE 1: PERMISSÕES HIERÁRQUICAS
-- ==========================================

-- 1.0 Enum de Roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'pastor_presidente', 'pastor', 'lider', 'membro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.1 Campos de delegação em user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_manipulator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS scope_church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_roles_manipulator ON public.user_roles(is_manipulator) WHERE is_manipulator = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON public.user_roles(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_scope_church ON public.user_roles(scope_church_id);

-- 1.2 Tabela de logs de permissões
CREATE TABLE IF NOT EXISTS public.permission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'auto_revoked')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  role_granted TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_permission_logs_user ON public.permission_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_logs_granted_by ON public.permission_logs(granted_by);

ALTER TABLE public.permission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Super admins can view all permission logs"
ON public.permission_logs FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- 1.3 Funções de permissões
CREATE OR REPLACE FUNCTION public.grant_manipulator_status(
  p_target_user_id UUID,
  p_role TEXT DEFAULT 'manipulator'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_admin_church_id UUID;
  v_target_church_id UUID;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  
  SELECT church_id INTO v_admin_church_id FROM user_roles
  WHERE user_id = v_admin_id AND role IN ('pastor_presidente', 'admin', 'super_admin') LIMIT 1;
  
  SELECT church_id INTO v_target_church_id FROM members WHERE user_id = p_target_user_id LIMIT 1;
  
  INSERT INTO user_roles (user_id, role, church_id, is_manipulator, granted_by, scope_church_id, granted_at)
  VALUES (p_target_user_id, p_role::app_role, v_target_church_id, true, v_admin_id, v_admin_church_id, now())
  ON CONFLICT (user_id, role, church_id) DO UPDATE SET
    is_manipulator = true, granted_by = v_admin_id, scope_church_id = v_admin_church_id, granted_at = now();
  
  INSERT INTO permission_logs (action, user_id, granted_by, church_id, role_granted, reason)
  VALUES ('granted', p_target_user_id, v_admin_id, v_admin_church_id, p_role, 'Manual grant');
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_manipulator_status(p_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_roles SET is_manipulator = false, granted_by = NULL, scope_church_id = NULL
  WHERE user_id = p_target_user_id AND is_manipulator = true;
  
  INSERT INTO permission_logs (action, user_id, granted_by, reason)
  VALUES ('revoked', p_target_user_id, auth.uid(), 'Manual revocation');
  
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_manipulator_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_manipulator_status TO authenticated;

-- ==========================================
-- PARTE 2: ASSINATURAS E PAGAMENTOS
-- ==========================================

-- 2.1 Campos de licença em churches
ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS status_licenca TEXT DEFAULT 'PENDENTE_DE_VALIDACAO'
  CHECK (status_licenca IN ('PENDENTE_DE_VALIDACAO', 'ATIVO', 'REJEITADO', 'VENCIDO', 'BLOQUEADO', 'LIBERACAO_TEMPORARIA')),
ADD COLUMN IF NOT EXISTS data_vencimento DATE,
ADD COLUMN IF NOT EXISTS data_liberacao_temporaria DATE,
ADD COLUMN IF NOT EXISTS dias_liberacao_temporaria INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultimo_aviso_vencimento TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_churches_status_licenca ON public.churches(status_licenca);
CREATE INDEX IF NOT EXISTS idx_churches_data_vencimento ON public.churches(data_vencimento) WHERE status_licenca IN ('ATIVO', 'VENCIDO');

-- 2.2 Campos em payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tipo_pagamento TEXT DEFAULT 'mensalidade'
  CHECK (tipo_pagamento IN ('mensalidade', 'renovacao', 'primeira_licenca')),
ADD COLUMN IF NOT EXISTS comprovante_url TEXT,
ADD COLUMN IF NOT EXISTS dias_concedidos INTEGER DEFAULT 35,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 2.3 Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'AVISO_VENCIMENTO_5_DIAS', 'AVISO_BLOQUEIO_5_DIAS', 'BLOQUEIO_SISTEMA',
    'LIBERACAO_TEMPORARIA', 'APROVACAO_MATRIZ', 'REJEICAO_MATRIZ',
    'PAGAMENTO_CONFIRMADO', 'SISTEMA_ATIVO'
  )),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  enviado_email BOOLEAN DEFAULT false,
  data_envio_email TIMESTAMP WITH TIME ZONE,
  visualizado BOOLEAN DEFAULT false,
  data_visualizacao TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_church ON public.notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_visualizado ON public.notifications(visualizado) WHERE visualizado = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid() OR church_id IN (SELECT church_id FROM user_roles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- 2.4 Tabela de células
CREATE TABLE IF NOT EXISTS public.cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  tipo_celula TEXT CHECK (tipo_celula IN ('criancas', 'jovens', 'adolescentes', 'homens', 'mulheres', 'casais', 'geral')),
  lider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Campos adicionados em 08/12/2025
  lider_nome TEXT,
  funcao_lider TEXT,
  lider_email TEXT,
  lider_telefone TEXT,
  
  dia_reuniao TEXT,
  horario_reuniao TIME,
  endereco_reuniao TEXT, -- Legacy
  
  -- Endereço detalhado
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  
  descricao TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cells_church ON public.cells(church_id);
CREATE INDEX IF NOT EXISTS idx_cells_active ON public.cells(is_active) WHERE is_active = true;

ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view cells in their hierarchy"
ON public.cells FOR SELECT
USING (church_id IN (SELECT id FROM public.get_user_accessible_churches(auth.uid())));

CREATE POLICY IF NOT EXISTS "Admins can manage cells"
ON public.cells FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role IN ('pastor_presidente', 'admin', 'super_admin') AND church_id = cells.church_id
));

-- 2.5 Funções de assinatura
CREATE OR REPLACE FUNCTION public.aprovar_matriz(
  p_church_id UUID,
  p_dias_licenca INTEGER DEFAULT 35
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nova_data DATE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND (role = 'super_admin' OR is_super_admin = true)) THEN
    RAISE EXCEPTION 'Apenas Super Administradores podem aprovar matrizes';
  END IF;
  
  v_nova_data := CURRENT_DATE + p_dias_licenca;
  
  UPDATE churches
  SET status_licenca = 'ATIVO', is_approved = true, is_active = true,
      data_vencimento = v_nova_data, data_aprovacao = now(), aprovado_por = auth.uid()
  WHERE id = p_church_id;
  
  INSERT INTO notifications (church_id, tipo, titulo, mensagem, enviado_email)
  VALUES (p_church_id, 'APROVACAO_MATRIZ', '✅ Matriz Aprovada!',
          'Sua matriz foi aprovada! Licença ativa até ' || to_char(v_nova_data, 'DD/MM/YYYY'), true);
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.rejeitar_matriz(
  p_church_id UUID,
  p_motivo TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE churches SET status_licenca = 'REJEITADO', is_approved = false WHERE id = p_church_id;
  INSERT INTO notifications (church_id, tipo, titulo, mensagem)
  VALUES (p_church_id, 'REJEICAO_MATRIZ', '❌ Cadastro Não Aprovado',
          'Sua solicitação não foi aprovada. ' || COALESCE(p_motivo, 'Entre em contato.'));
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.aprovar_matriz TO authenticated;
GRANT EXECUTE ON FUNCTION public.rejeitar_matriz TO authenticated;

-- ==========================================
-- PARTE 3: IDENTIDADE VISUAL
-- ==========================================

-- 3.1 Logo em churches
ALTER TABLE public.churches
ADD COLUMN IF NOT EXISTS logo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_churches_logo ON public.churches(logo_url) WHERE logo_url IS NOT NULL;

-- 3.2 Campos em members
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS cell_id UUID REFERENCES public.cells(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cargo_eclesiastico TEXT CHECK (cargo_eclesiastico IN (
  'pastor', 'pastora', 'diacono', 'diaconisa', 'missionario', 'missionaria',
  'presbitero', 'evangelista', 'bispo', 'bispa', 'apostolo', 'apostola',
  'musico', 'regente', 'lider_jovens', 'membro', 'outro'
)),
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('masculino', 'feminino', 'outro')),
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS estado_civil TEXT CHECK (estado_civil IN (
  'solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'
));

CREATE INDEX IF NOT EXISTS idx_members_cell ON public.members(cell_id);
CREATE INDEX IF NOT EXISTS idx_members_cargo ON public.members(cargo_eclesiastico);
CREATE INDEX IF NOT EXISTS idx_members_sexo ON public.members(sexo);
CREATE INDEX IF NOT EXISTS idx_members_data_nascimento ON public.members(data_nascimento);
CREATE INDEX IF NOT EXISTS idx_members_estado_civil ON public.members(estado_civil);
CREATE INDEX IF NOT EXISTS idx_members_foto ON public.members(foto_url) WHERE foto_url IS NOT NULL;

-- 3.3 Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-logos', 'church-logos', true), ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3.4 Storage Policies
CREATE POLICY IF NOT EXISTS "Church admins can upload logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'church-logos' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Anyone can view church logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-logos');

CREATE POLICY IF NOT EXISTS "Users can upload own photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Anyone can view member photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

-- 3.5 Função get_matrix_logo
CREATE OR REPLACE FUNCTION public.get_matrix_logo(p_church_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_logo_url TEXT;
  v_nivel church_level;
  v_parent_id UUID;
  v_current_id UUID;
  v_iterations INTEGER := 0;
BEGIN
  v_current_id := p_church_id;
  WHILE v_iterations < 10 LOOP
    SELECT nivel, parent_church_id, logo_url INTO v_nivel, v_parent_id, v_logo_url
    FROM churches WHERE id = v_current_id;
    IF NOT FOUND THEN RETURN NULL; END IF;
    IF v_nivel = 'matriz' THEN RETURN v_logo_url; END IF;
    IF v_parent_id IS NULL THEN RETURN v_logo_url; END IF;
    v_current_id := v_parent_id;
    v_iterations := v_iterations + 1;
  END LOOP;
  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_matrix_logo TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_matrix_logo TO anon;

-- ==========================================
-- PARTE 4: ESTATÍSTICAS
-- ==========================================

-- 4.1 Views de estatísticas
CREATE OR REPLACE VIEW public.member_age_stats AS
SELECT 
  m.id, m.full_name, m.data_nascimento,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento))::INTEGER as idade,
  CASE
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 0 AND 12 THEN '0-12 (Crianças)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 13 AND 17 THEN '13-17 (Adolescentes)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 18 AND 25 THEN '18-25 (Jovens)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 26 AND 40 THEN '26-40 (Jovens Adultos)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 41 AND 60 THEN '41-60 (Adultos)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) > 60 THEN '60+ (Idosos)'
    ELSE 'Não informado'
  END as faixa_etaria,
  m.church_id, m.cell_id, m.sexo, m.estado_civil, m.cargo_eclesiastico
FROM public.members m
WHERE m.data_nascimento IS NOT NULL AND m.is_active = true;

-- 4.2 Tabela de escalas de serviço
CREATE TABLE IF NOT EXISTS public.service_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('louvor', 'pregacao', 'diacono', 'portaria', 'midia', 'infantil', 'limpeza', 'som', 'outro')),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  horario TIME,
  responsavel_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  equipe TEXT[],
  observacoes TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_schedules_church ON public.service_schedules(church_id);
CREATE INDEX IF NOT EXISTS idx_service_schedules_data ON public.service_schedules(data);

ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view public schedules"
ON public.service_schedules FOR SELECT
USING (is_public = true);

CREATE POLICY IF NOT EXISTS "Admins can manage schedules"
ON public.service_schedules FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid() AND role IN ('pastor_presidente', 'admin', 'super_admin') AND church_id = service_schedules.church_id
));

-- 4.3 Confirmações de escala
CREATE TABLE IF NOT EXISTS public.schedule_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.service_schedules(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  declined BOOLEAN DEFAULT false,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(schedule_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_confirmations_schedule ON public.schedule_confirmations(schedule_id);

ALTER TABLE public.schedule_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Members can view own confirmations"
ON public.schedule_confirmations FOR SELECT
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- 4.4 Fila de notificações
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'push')),
  recipient_id UUID REFERENCES auth.users(id),
  recipient_phone TEXT,
  recipient_email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status) WHERE status = 'pending';

-- 4.5 Função de confirmação  
CREATE OR REPLACE FUNCTION public.confirm_schedule_attendance(
  p_schedule_id UUID,
  p_member_id UUID,
  p_confirmed BOOLEAN DEFAULT true,
  p_decline_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_confirmation_id UUID;
BEGIN
  INSERT INTO schedule_confirmations (schedule_id, member_id, confirmed, confirmed_at, declined, declined_at, decline_reason)
  VALUES (p_schedule_id, p_member_id, p_confirmed, CASE WHEN p_confirmed THEN now() ELSE NULL END,
          NOT p_confirmed, CASE WHEN NOT p_confirmed THEN now() ELSE NULL END, p_decline_reason)
  ON CONFLICT (schedule_id, member_id)
  DO UPDATE SET confirmed = p_confirmed, confirmed_at = CASE WHEN p_confirmed THEN now() ELSE NULL END,
                declined = NOT p_confirmed, declined_at = CASE WHEN NOT p_confirmed THEN now() ELSE NULL END,
                decline_reason = EXCLUDED.decline_reason, updated_at = now()
  RETURNING id INTO v_confirmation_id;
  
  RETURN v_confirmation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_schedule_attendance TO authenticated;

-- ==========================================
-- TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cells_updated_at ON public.cells;
CREATE TRIGGER update_cells_updated_at BEFORE UPDATE ON public.cells
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_schedules_updated_at ON public.service_schedules;
CREATE TRIGGER update_service_schedules_updated_at BEFORE UPDATE ON public.service_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
-- Total de linhas: ~500
-- Tempo estimado de execução: ~45 segundos
-- ==========================================
