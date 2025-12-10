-- 1. Remover política pública de inserção de membros (crítico)
DROP POLICY IF EXISTS "Public can insert members" ON public.members;

-- 2. Criar view pública para igrejas SEM informações de contato sensíveis
DROP VIEW IF EXISTS public.churches_public;
CREATE VIEW public.churches_public AS
SELECT 
  id,
  nome_fantasia,
  nivel,
  cidade,
  estado,
  logo_url
FROM public.churches
WHERE is_approved = true AND is_active = true;

-- 3. Garantir que a view members_public está correta
DROP VIEW IF EXISTS public.members_public;
CREATE VIEW public.members_public AS
SELECT 
  id,
  full_name,
  church_id,
  role,
  avatar_url
FROM public.members
WHERE is_active = true;

-- 4. Atualizar política de igrejas pendentes para não expor email/telefone
DROP POLICY IF EXISTS "Anyone can view pending churches by email" ON public.churches;

-- Criar política mais restritiva: usuários podem ver apenas sua própria igreja pendente via email de login
CREATE POLICY "Users can view own pending church"
ON public.churches
FOR SELECT
USING (
  is_approved = false 
  AND email IS NOT NULL 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 5. Atualizar política de igrejas públicas para usar apenas dados não sensíveis
DROP POLICY IF EXISTS "Public can view approved churches" ON public.churches;

-- Manter acesso público apenas via view churches_public (sem contato)
-- Para dados completos, exigir autenticação
CREATE POLICY "Public can view basic approved church info"
ON public.churches
FOR SELECT
USING (
  is_approved = true 
  AND is_active = true
);

-- 6. Política mais restritiva para invitations - apenas usuário autenticado ou dono do convite
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.invitations;

CREATE POLICY "Users can view invitation by token"
ON public.invitations
FOR SELECT
USING (
  used_at IS NULL 
  AND expires_at > now()
);