/* Migração para corrigir permissões de login para usuários IADMA com funções VÁLIDAS */
/* Versão corrigida para evitar erro de concatenação de linhas nos comentários */

DO $$
DECLARE
    v_church_id UUID;
    v_user_1 UUID;
    v_user_2 UUID;
    v_member_id UUID;
BEGIN
    /* 1. Encontrar o ID da Igreja */
    SELECT id INTO v_church_id
    FROM public.churches
    WHERE nome_fantasia ILIKE '%assembleia de deus missão apostolica%'
    LIMIT 1;

    IF v_church_id IS NULL THEN
        RAISE NOTICE 'Igreja não encontrada pela busca de nome. Tentando encontrar QUALQUER matriz.';
        SELECT id INTO v_church_id FROM public.churches WHERE nivel = 'matriz' LIMIT 1;
    END IF;

    RAISE NOTICE 'ID da Igreja Alvo: %', v_church_id;

    /* 2. Encontrar IDs de Usuário por E-mail */
    SELECT id INTO v_user_1 FROM auth.users WHERE email = 'pr.vcsantos@gmail.com';
    SELECT id INTO v_user_2 FROM auth.users WHERE email = 'iadmasede@gmail.com';

    /* 3. Conceder Permissões para Usuário 1 (pr.vcsantos@gmail.com) */
    IF v_user_1 IS NOT NULL THEN
        RAISE NOTICE 'Processando pr.vcsantos@gmail.com (%)', v_user_1;
        
        /* Limpar funções existentes */
        DELETE FROM public.user_roles WHERE user_id = v_user_1;

        /* Inserir Função de Super Admin */
        INSERT INTO public.user_roles (user_id, role, church_id)
        VALUES (v_user_1, 'super_admin', v_church_id); 
        
        /* Verificar se já existe como membro nesta igreja */
        SELECT id INTO v_member_id FROM public.members 
        WHERE email = 'pr.vcsantos@gmail.com' AND church_id = v_church_id LIMIT 1;

        IF v_member_id IS NOT NULL THEN
            /* Atualizar existente */
            UPDATE public.members 
            SET role = 'Pastor', is_active = true, user_id = v_user_1
            WHERE id = v_member_id;
        ELSE
            /* Inserir novo */
            INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
            VALUES (v_church_id, v_user_1, 'Valdinei Santos', 'Pastor', 'pr.vcsantos@gmail.com', true);
        END IF;
        
    ELSE
        RAISE WARNING 'Usuário pr.vcsantos@gmail.com não encontrado em auth.users';
    END IF;

    /* 4. Conceder Permissões para Usuário 2 (iadmasede@gmail.com) */
    IF v_user_2 IS NOT NULL THEN
        RAISE NOTICE 'Processando iadmasede@gmail.com (%)', v_user_2;

        /* Limpar funções existentes */
        DELETE FROM public.user_roles WHERE user_id = v_user_2;

        /* Inserir Função PASTOR PRESIDENTE */
        INSERT INTO public.user_roles (user_id, role, church_id)
        VALUES (v_user_2, 'pastor_presidente', v_church_id);
        
        /* Verificar se já existe como membro nesta igreja */
        v_member_id := NULL;
        SELECT id INTO v_member_id FROM public.members 
        WHERE email = 'iadmasede@gmail.com' AND church_id = v_church_id LIMIT 1;

        IF v_member_id IS NOT NULL THEN
            /* Atualizar existente */
            UPDATE public.members 
            SET role = 'Pastor', is_active = true, user_id = v_user_2
            WHERE id = v_member_id;
        ELSE
            /* Inserir novo */
            INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
            VALUES (v_church_id, v_user_2, 'Admin Sede', 'Pastor', 'iadmasede@gmail.com', true);
        END IF;

    ELSE
        RAISE WARNING 'Usuário iadmasede@gmail.com não encontrado em auth.users';
    END IF;

END $$;
