-- ==============================================================================
-- SISCOF - DIAGNÓSTICO DE LOGIN (EMERGÊNCIA)
-- ==============================================================================
-- Execute este script no Supabase SQL Editor para verificar o estado dos usuários
-- ==============================================================================
-- Data: 10/12/2025
-- Problema: Usuário não consegue fazer login com nenhum email
-- ==============================================================================

-- 1. VERIFICAR USUÁRIOS CADASTRADOS NO AUTH
-- Mostra todos os usuários registrados no sistema
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email não confirmado'
        ELSE '✅ Email confirmado'
    END as status_confirmacao
FROM auth.users
ORDER BY created_at DESC;

-- ==============================================================================

-- 2. VERIFICAR ROLES DOS USUÁRIOS
-- Mostra quais permissões cada usuário tem
SELECT 
    u.email,
    ur.role,
    ur.is_super_admin,
    c.nome_fantasia as igreja,
    ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.churches c ON c.id = ur.church_id
ORDER BY u.email;

-- ==============================================================================

-- 3. VERIFICAR IGREJAS CADASTRADAS
-- Lista todas as igrejas para identificar IDs
SELECT 
    id,
    nome_fantasia,
    nivel,
    is_approved,
    is_active,
    created_at
FROM public.churches
ORDER BY created_at DESC;

-- ==============================================================================

-- 4. VERIFICAR SE MIGRATIONS DE LOGIN FORAM APLICADAS
-- Verifica políticas RLS críticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('members', 'user_roles', 'churches')
ORDER BY tablename, policyname;

-- ==============================================================================

-- 5. CRIAR USUÁRIO SUPER ADMIN MANUALMENTE (SE NECESSÁRIO)
-- ATENÇÃO: Só execute isso se você já tiver criado a conta no Supabase Auth primeiro!
-- Primeiro, vá em Authentication > Users > Add User no dashboard do Supabase
-- Depois, pegue o UUID do usuário criado e substitua abaixo

DO $$
DECLARE
    v_user_id UUID;
    v_church_id UUID;
    v_user_email TEXT := 'seu_email@gmail.com'; -- SUBSTITUA PELO SEU EMAIL
BEGIN
    -- Buscar ID do usuário pelo email
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Usuário com email % não foi encontrado no auth.users. Crie a conta primeiro no Dashboard do Supabase!', v_user_email;
    END IF;

    RAISE NOTICE 'Usuário encontrado: % (ID: %)', v_user_email, v_user_id;

    -- Buscar uma igreja matriz existente (ou qualquer igreja)
    SELECT id INTO v_church_id 
    FROM public.churches 
    WHERE nivel = 'matriz' 
    LIMIT 1;

    IF v_church_id IS NULL THEN
        -- Se não houver matriz, pega qualquer igreja
        SELECT id INTO v_church_id 
        FROM public.churches 
        LIMIT 1;
    END IF;

    IF v_church_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Nenhuma igreja encontrada no banco! Cadastre uma igreja primeiro!';
    END IF;

    RAISE NOTICE 'Igreja selecionada: %', v_church_id;

    -- Limpar roles existentes
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    RAISE NOTICE 'Roles antigas removidas';

    -- Criar role de Super Admin
    INSERT INTO public.user_roles (user_id, role, church_id, is_super_admin)
    VALUES (v_user_id, 'super_admin', v_church_id, true);
    RAISE NOTICE '✅ Super Admin criado com sucesso!';

    -- Criar/atualizar membro
    INSERT INTO public.members (church_id, user_id, full_name, email, is_active)
    VALUES (v_church_id, v_user_id, 'Administrador', v_user_email, true)
    ON CONFLICT (church_id, email) 
    DO UPDATE SET user_id = v_user_id, is_active = true;
    RAISE NOTICE '✅ Membro criado/atualizado!';

    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ SUCESSO! Agora você pode fazer login com:';
    RAISE NOTICE 'Email: %', v_user_email;
    RAISE NOTICE 'Senha: (a que você cadastrou no Supabase)';
    RAISE NOTICE '====================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO: %', SQLERRM;
END $$;

-- ==============================================================================

-- 6. VERIFICAR FUNÇÕES SQL CRÍTICAS
-- Verifica se as funções necessárias existem
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'create_child_church',
    'aprovar_matriz',
    'grant_manipulator_status',
    'get_user_accessible_churches'
)
ORDER BY routine_name;

-- ==============================================================================

-- 7. TESTE RÁPIDO: Verificar se consigo buscar usuários
-- Deve retornar pelo menos 1 linha
SELECT COUNT(*) as total_usuarios FROM auth.users;
SELECT COUNT(*) as total_roles FROM public.user_roles;
SELECT COUNT(*) as total_igrejas FROM public.churches;

-- ==============================================================================
-- FIM DO DIAGNÓSTICO
-- ==============================================================================

/*
PRÓXIMOS PASSOS baseado nos resultados:

CENÁRIO 1: Nenhum usuário aparece em auth.users
- Ação: Criar conta manualmente no Dashboard do Supabase
- Caminho: Authentication > Users > Add User
- Depois: Executar bloco 5 deste script substituindo o email

CENÁRIO 2: Usuário existe mas sem roles
- Ação: Executar bloco 5 deste script

CENÁRIO 3: Usuário existe com roles mas login falha
- Possível causa: Email não confirmado
- Ação: No Dashboard > Authentication > Users > clicar no usuário > Confirm email

CENÁRIO 4: Nenhuma igreja existe
- Ação: Primeiro criar uma igreja manualmente
- Depois executar bloco 5

CENÁRIO 5: Tudo existe mas ainda falha
- Verificar políticas RLS (bloco 4)
- Pode ser necessário aplicar migrations pendentes
*/
