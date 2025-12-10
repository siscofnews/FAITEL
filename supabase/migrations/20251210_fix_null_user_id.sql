-- Migration: Fix NULL user_id error in user_roles
-- Date: 2025-12-10
-- This script properly validates user existence before attempting role assignment

DO $$
DECLARE
    v_user_id UUID;
    v_church_id UUID;
    v_email TEXT := 'siscofnews@gmail.com'; -- Target email for super admin
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Starting user role assignment...';
    RAISE NOTICE '========================================';
    
    -- 1. Find the user by email
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email;
    
    -- 2. Validate user exists
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Usuário com email % NÃO EXISTE na tabela auth.users. Por favor, crie a conta primeiro usando o formulário de cadastro!', v_email;
    END IF;
    
    RAISE NOTICE '✓ Usuário encontrado: % (ID: %)', v_email, v_user_id;
    
    -- 3. Find a church (Matriz preferred)
    SELECT id INTO v_church_id 
    FROM public.churches 
    WHERE nivel = 'matriz' 
      AND is_active = true 
    LIMIT 1;
    
    -- Fallback: any active church
    IF v_church_id IS NULL THEN
        SELECT id INTO v_church_id 
        FROM public.churches 
        WHERE is_active = true 
        LIMIT 1;
    END IF;
    
    -- 4. Validate church exists
    IF v_church_id IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Nenhuma igreja ativa encontrada no sistema!';
    END IF;
    
    RAISE NOTICE '✓ Igreja encontrada (ID: %)', v_church_id;
    
    -- 5. Ensure is_super_admin column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'user_roles' 
          AND column_name = 'is_super_admin'
    ) THEN
        RAISE NOTICE '⚠️ Coluna is_super_admin não existe. Criando...';
        ALTER TABLE public.user_roles 
        ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
    END IF;
    
    -- 6. Clean existing roles for this user
    DELETE FROM public.user_roles 
    WHERE user_id = v_user_id;
    
    RAISE NOTICE '✓ Roles antigas removidas';
    
    -- 7. Insert super_admin role
    INSERT INTO public.user_roles (user_id, role, church_id, is_super_admin)
    VALUES (v_user_id, 'super_admin', v_church_id, true);
    
    RAISE NOTICE '✓ Role super_admin atribuída';
    
    -- 8. Insert pastor_presidente role
    INSERT INTO public.user_roles (user_id, role, church_id)
    VALUES (v_user_id, 'pastor_presidente', v_church_id)
    ON CONFLICT (user_id, role, church_id) DO NOTHING;
    
    RAISE NOTICE '✓ Role pastor_presidente atribuída';
    
    -- 9. Update or create member record
    INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
    VALUES (v_church_id, v_user_id, 'Super Admin', 'Pastor Presidente', v_email, true)
    ON CONFLICT (email, church_id) 
    DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        is_active = true,
        role = EXCLUDED.role;
    
    RAISE NOTICE '✓ Registro de membro atualizado';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SUCESSO! Permissões atribuídas com sucesso!';
    RAISE NOTICE '========================================';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '❌ ERRO DURANTE EXECUÇÃO:';
        RAISE NOTICE 'Mensagem: %', SQLERRM;
        RAISE NOTICE 'Detalhe: %', SQLSTATE;
        RAISE NOTICE '========================================';
        RAISE;
END $$;
