-- ==============================================================================
-- EMERGENCY FIX: VISIBILIDADE DE MEMBROS (2025-12-09)
-- Execute este script para corrigir o erro de não ver os membros cadastrados.
-- ==============================================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Corrigindo visibilidade da tabela members...';

    -- 1. Remove políticas antigas de SELECT que podem estar bloqueando
    DROP POLICY IF EXISTS "Admins can view members" ON public.members;
    DROP POLICY IF EXISTS "Members can view own profile" ON public.members;
    DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
    
    -- 2. Cria Política de VISUALIZAÇÃO (SELECT)
    -- Opção A: Super Admin vê tudo
    CREATE POLICY "Super Admin View All Members"
    ON public.members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND is_super_admin = true
        )
    );

    -- Opção B: Pastores/Admins veem membros da sua igreja (ou igrejas abaixo, se implementado hierarquia, mas simplificando para igreja atual)
    CREATE POLICY "Admin View Church Members"
    ON public.members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() 
            AND ur.church_id = members.church_id
        )
    );

    -- Opção C: Permissiva para Debug (Se as acima falharem, descomente a linha abaixo para liberar geral para logados)
    -- CREATE POLICY "Authenticated View All" ON public.members FOR SELECT TO authenticated USING (true);

    RAISE NOTICE '✅ Políticas de visualização atualizadas com sucesso!';
END $$;
