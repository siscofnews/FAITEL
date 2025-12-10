-- ========================================
-- Migration: Sistema de Permissões Hierárquicas
-- Descrição: Adiciona sistema completo de delegação de permissões
--            com status de manipulador e visibilidade hier árquica
-- ========================================

-- 1. Adicionar campos para delegação de permissões
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_manipulator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS scope_church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_manipulator ON public.user_roles(is_manipulator) WHERE is_manipulator = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON public.user_roles(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_scope_church ON public.user_roles(scope_church_id);

-- 3. Criar tabela de log de permissões (auditoria)
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

-- Índice para auditoria
CREATE INDEX IF NOT EXISTS idx_permission_logs_user ON public.permission_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_logs_granted_by ON public.permission_logs(granted_by);
CREATE INDEX IF NOT EXISTS idx_permission_logs_created_at ON public.permission_logs(created_at DESC);

-- 4. Habilitar RLS na tabela de logs
ALTER TABLE public.permission_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins podem ver todos os logs
CREATE POLICY "Super admins can view all permission logs"
ON public.permission_logs
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Policy: Admins podem ver logs de sua hierarquia
CREATE POLICY "Admins can view logs in their hierarchy"
ON public.permission_logs
FOR SELECT
USING (
  church_id IN (
    WITH RECURSIVE hierarchy AS (
      SELECT c.id
      FROM churches c
      INNER JOIN user_roles ur ON ur.church_id = c.id
      WHERE ur.user_id = auth.uid() AND ur.role IN ('pastor_presidente', 'admin')
      UNION
      SELECT c.id
      FROM churches c
      INNER JOIN hierarchy h ON c.parent_church_id = h.id
    )
    SELECT id FROM hierarchy
  )
);

-- 5. Comentários explicativos
COMMENT ON COLUMN user_roles.is_manipulator IS 'Indica se o usuário tem status de manipulador delegado por um administrador';
COMMENT ON COLUMN user_roles.granted_by IS 'ID do usuário admin que concedeu o status de manipulador';
COMMENT ON COLUMN user_roles.granted_at IS 'Data e hora quando o status foi concedido';
COMMENT ON COLUMN user_roles.scope_church_id IS 'ID da igreja que define o escopo de permissão (igreja do admin que delegou)';

COMMENT ON TABLE permission_logs IS 'Log de auditoria de todas as concessões e revogações de permissões no sistema';
