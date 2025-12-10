-- ==============================================================================
-- SCRIPT DE CORREÇÃO COMPLETO (SiscofNEWs)
-- Inclui criação da coluna is_super_admin se não existir
-- ==============================================================================

DO $$
DECLARE
    meu_email text := 'siscofnews@gmail.com';
    target_user_id uuid;
    target_church_id uuid;
BEGIN
    -- 1. GARANTIR QUE A COLUNA EXISTA
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_super_admin') THEN
        RAISE NOTICE '⚠️ Coluna is_super_admin não existia. Criando agora...';
        ALTER TABLE public.user_roles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
    END IF;

    -- 2. Busca o usuário
    SELECT id INTO target_user_id FROM auth.users WHERE email = meu_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Usuário % não encontrado.', meu_email;
    END IF;

    -- 3. Tenta achar uma igreja Matriz (ou qualquer uma)
    SELECT id INTO target_church_id FROM public.churches WHERE is_active = true AND nivel = 'matriz' LIMIT 1;
    
    IF target_church_id IS NULL THEN
        SELECT id INTO target_church_id FROM public.churches WHERE is_active = true LIMIT 1;
    END IF;

    -- 4. Dá permissão de Super Admin e Pastor Presidente
    INSERT INTO public.user_roles (user_id, role, is_super_admin, church_id)
    VALUES (target_user_id, 'super_admin', true, target_church_id)
    ON CONFLICT (user_id, role, church_id) DO UPDATE
    SET is_super_admin = true;

    INSERT INTO public.user_roles (user_id, role, church_id)
    VALUES (target_user_id, 'pastor_presidente', target_church_id)
    ON CONFLICT (user_id, role, church_id) DO NOTHING;

    RAISE NOTICE '✅ SUCESSO! Correção aplicada completa.';
END $$;
