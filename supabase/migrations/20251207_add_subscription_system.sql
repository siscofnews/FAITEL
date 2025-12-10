-- ========================================
-- Migration: Sistema de Assinaturas e Controle de Pagamento
-- Descrição: Adiciona campos de controle de licença, vencimento,
--            status de pagamento e notificações
-- ========================================

-- 1. Adicionar campos de controle de licença na tabela churches
ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS status_licenca TEXT DEFAULT 'PENDENTE_DE_VALIDACAO'
  CHECK (status_licenca IN (
    'PENDENTE_DE_VALIDACAO',
    'ATIVO',
    'REJEITADO',
    'VENCIDO',
    'BLOQUEADO',
    'LIBERACAO_TEMPORARIA'
  )),
ADD COLUMN IF NOT EXISTS data_vencimento DATE,
ADD COLUMN IF NOT EXISTS data_liberacao_temporaria DATE,
ADD COLUMN IF NOT EXISTS dias_liberacao_temporaria INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultimo_aviso_vencimento TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_churches_status_licenca ON public.churches(status_licenca);
CREATE INDEX IF NOT EXISTS idx_churches_data_vencimento ON public.churches(data_vencimento) WHERE status_licenca IN ('ATIVO', 'VENCIDO');

-- 2. Aprimorar tabela payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tipo_pagamento TEXT DEFAULT 'mensalidade'
  CHECK (tipo_pagamento IN ('mensalidade', 'renovacao', 'primeira_licenca')),
ADD COLUMN IF NOT EXISTS comprovante_url TEXT,
ADD COLUMN IF NOT EXISTS dias_concedidos INTEGER DEFAULT 35,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 3. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'AVISO_VENCIMENTO_5_DIAS',
    'AVISO_BLOQUEIO_5_DIAS',
    'BLOQUEIO_SISTEMA',
    'LIBERACAO_TEMPORARIA',
    'APROVACAO_MATRIZ',
    'REJEICAO_MATRIZ',
    'PAGAMENTO_CONFIRMADO',
    'SISTEMA_ATIVO'
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

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notifications_church ON public.notifications(church_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_visualizado ON public.notifications(visualizado) WHERE visualizado = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 4. Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem notificações da sua igreja ou pessoais
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  church_id IN (
    SELECT church_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Policy: Super admins veem todas
CREATE POLICY "Super admins can view all notifications"
ON public.notifications
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Policy: Sistema pode inserir notificações
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true); -- Permitir inserção (será controlado por funções SECURITY DEFINER)

-- 5. Criar tabela de células (para formulário de membros)
CREATE TABLE IF NOT EXISTS public.cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  tipo_celula TEXT CHECK (tipo_celula IN (
    'criancas', 
    'jovens', 
    'adolescentes', 
    'homens', 
    'mulheres', 
    'casais', 
    'geral'
  )),
  lider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dia_reuniao TEXT,
  horario_reuniao TIME,
  endereco_reuniao TEXT,
  descricao TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para células
CREATE INDEX IF NOT EXISTS idx_cells_church ON public.cells(church_id);
CREATE INDEX IF NOT EXISTS idx_cells_active ON public.cells(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cells_tipo ON public.cells(tipo_celula);

-- RLS para cells
ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cells in their hierarchy"
ON public.cells
FOR SELECT
USING (
  church_id IN (
    SELECT id FROM public.get_user_accessible_churches(auth.uid())
  )
);

CREATE POLICY "Admins can manage cells"
ON public.cells
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('pastor_presidente', 'admin', 'super_admin')
      AND church_id = cells.church_id
  )
);

-- 6. Adicionar campos aos membros
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS cell_id UUID REFERENCES public.cells(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cargo_eclesiastico TEXT CHECK (cargo_eclesiastico IN (
  'pastor', 'pastora', 'diacono', 'diaconisa',
  'missionario', 'missionaria', 'presbitero',
  'evangelista', 'bispo', 'bispa', 'apostolo', 'apostola',
  'musico', 'regente', 'lider_jovens', 'membro', 'outro'
));

CREATE INDEX IF NOT EXISTS idx_members_cell ON public.members(cell_id);
CREATE INDEX IF NOT EXISTS idx_members_cargo ON public.members(cargo_eclesiastico);

-- 7. Comentários descritivos
COMMENT ON COLUMN churches.status_licenca IS 'Status da licença do sistema: PENDENTE, ATIVO, VENCIDO, BLOQUEADO, etc';
COMMENT ON COLUMN churches.data_vencimento IS 'Data de vencimento da licença (35 dias padrão)';
COMMENT ON COLUMN churches.data_liberacao_temporaria IS 'Data até quando a liberação temporária é válida';
COMMENT ON COLUMN churches.dias_liberacao_temporaria IS 'Quantidade de dias concedidos na liberação temporária';

COMMENT ON TABLE notifications IS 'Notificações do sistema para avisos de vencimento, bloqueio, etc';
COMMENT ON TABLE cells IS 'Células das igrejas (grupos de jovens, crianças, homens, mulheres, etc)';

COMMENT ON COLUMN members.cell_id IS 'Célula à qual o membro pertence';
COMMENT ON COLUMN members.cargo_eclesiastico IS 'Cargo/função eclesiástica do membro na igreja';

-- 8. Trigger para atualizar updated_at em cells
CREATE TRIGGER update_cells_updated_at
  BEFORE UPDATE ON public.cells
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
