-- ==============================================================================
-- SCRIPT FINAL DE CORREÇÃO (AGORA VAI)
-- COPIE E COLE TUDO ISSO NO SUPABASE SQL EDITOR
-- ==============================================================================

DO $$
DECLARE
    meu_email text := 'siscofnews@gmail.com';
    target_user_id uuid;
    target_church_id uuid;
BEGIN
    RAISE NOTICE '🔧 Iniciando correções...';

    -- 1. CORRIGE TABELA (Cria colunas se não existirem)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_super_admin') THEN
        ALTER TABLE public.user_roles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_super_admin criada.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_manipulator') THEN
        ALTER TABLE public.user_roles ADD COLUMN is_manipulator BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Coluna is_manipulator criada.';
    END IF;

    -- 2. BUSCA SEU USUÁRIO
    SELECT id INTO target_user_id FROM auth.users WHERE email = meu_email;
    IF target_user_id IS NULL THEN 
        RAISE EXCEPTION '❌ O usuário % não foi encontrado. Verifique se o email está correto.', meu_email;
    END IF;
    
    -- 3. BUSCA IGREJA (Pega a primeira ativa)
    SELECT id INTO target_church_id FROM public.churches WHERE is_active = true LIMIT 1;
    IF target_church_id IS NULL THEN
        RAISE NOTICE '⚠️ Nenhuma igreja encontrada. Criando permissão sem igreja...';
    END IF;

    -- 4. APLICA PERMISSÃO SUPER ADMIN
    -- Remove permissões antigas conflitantes (opcional, mas limpa o terreno)
    DELETE FROM public.user_roles WHERE user_id = target_user_id;

    -- Insere a permissão suprema
    INSERT INTO public.user_roles (user_id, role, is_super_admin, church_id)
    VALUES (target_user_id, 'super_admin', true, target_church_id);

    RAISE NOTICE '👑 SUCESSO ABSOLUTO! O usuário % agora é SUPER ADMIN.', meu_email;
    RAISE NOTICE '👉 IMPORTANTE: Faça Logout e Login novamente para ver as alterações.';
END $$;
