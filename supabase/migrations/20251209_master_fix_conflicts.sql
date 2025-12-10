-- ==============================================================================
-- MASTER FIX: RESOLUÇÃO DE CONFLITOS E PERMISSÕES (2025-12-09)
-- Execute este script no SQL Editor do Supabase para corrigir o sistema.
-- ==============================================================================

DO $$
DECLARE
    target_email text := 'siscofnews@gmail.com';
    target_user_id uuid;
    target_church_id uuid;
BEGIN
    RAISE NOTICE '🔧 Iniciando Master Fix...';

    -- 1. CORREÇÃO DE SCHEMA: Tabela Churches
    RAISE NOTICE '👉 Verificando tabela churches...';
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'churches' AND column_name = 'numero') THEN
        ALTER TABLE public.churches ADD COLUMN numero text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'churches' AND column_name = 'bairro') THEN
        ALTER TABLE public.churches ADD COLUMN bairro text;
    END IF;

    -- 2. CORREÇÃO DE SCHEMA: Tabela Cells
    RAISE NOTICE '👉 Verificando tabela cells...';
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'cep') THEN
        ALTER TABLE public.cells ADD COLUMN cep text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'endereco') THEN
        ALTER TABLE public.cells ADD COLUMN endereco text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'numero') THEN
        ALTER TABLE public.cells ADD COLUMN numero text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'bairro') THEN
        ALTER TABLE public.cells ADD COLUMN bairro text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'cidade') THEN
        ALTER TABLE public.cells ADD COLUMN cidade text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'estado') THEN
        ALTER TABLE public.cells ADD COLUMN estado text;
    END IF;

    -- 3. CORREÇÃO DE STORAGE: Buckets e Policies
    RAISE NOTICE '👉 Verificando Storage...';
    INSERT INTO storage.buckets (id, name, public) VALUES ('church-logos', 'church-logos', true) ON CONFLICT (id) DO NOTHING;
    INSERT INTO storage.buckets (id, name, public) VALUES ('member-photos', 'member-photos', true) ON CONFLICT (id) DO NOTHING;

    -- Policies para church-logos
    DROP POLICY IF EXISTS "Public Access Logos" ON storage.objects;
    CREATE POLICY "Public Access Logos" ON storage.objects FOR SELECT USING ( bucket_id = 'church-logos' );
    
    DROP POLICY IF EXISTS "Authenticated Upload Logos" ON storage.objects;
    CREATE POLICY "Authenticated Upload Logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'church-logos' );

     -- Policies para member-photos
    DROP POLICY IF EXISTS "Public Access Member Photos" ON storage.objects;
    CREATE POLICY "Public Access Member Photos" ON storage.objects FOR SELECT USING ( bucket_id = 'member-photos' );
    
    DROP POLICY IF EXISTS "Public Upload Member Photos" ON storage.objects;
    CREATE POLICY "Public Upload Member Photos" ON storage.objects FOR INSERT TO public WITH CHECK ( bucket_id = 'member-photos' );
    
    DROP POLICY IF EXISTS "Authenticated Upload Member Photos" ON storage.objects;
    CREATE POLICY "Authenticated Upload Member Photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'member-photos' );

    -- 4. CORREÇÃO DE PERMISSÕES: User Roles
    RAISE NOTICE '👉 Verificando permissões de Super Admin...';
    -- Garante colunas na tabela user_roles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_super_admin') THEN
        ALTER TABLE public.user_roles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'is_manipulator') THEN
        ALTER TABLE public.user_roles ADD COLUMN is_manipulator BOOLEAN DEFAULT false;
    END IF;

    -- Busca usuário alvo
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NOT NULL THEN
        -- Busca uma igreja ativa qualquer para vincular (necessário para FKs, se houver)
        SELECT id INTO target_church_id FROM public.churches WHERE is_active = true LIMIT 1;
        
        -- Atualiza ou Insere permissão
        DELETE FROM public.user_roles WHERE user_id = target_user_id; -- Limpa para garantir clean state
        
        IF target_church_id IS NOT NULL THEN
            INSERT INTO public.user_roles (user_id, role, is_super_admin, church_id)
            VALUES (target_user_id, 'super_admin', true, target_church_id);
            RAISE NOTICE '✅ Usuário % promovido a SUPER ADMIN (vinculado à igreja %)', target_email, target_church_id;
        ELSE
            -- Tenta inserir sem church_id se a constraint permitir, senão avisa
            BEGIN
                INSERT INTO public.user_roles (user_id, role, is_super_admin)
                VALUES (target_user_id, 'super_admin', true);
                RAISE NOTICE '✅ Usuário % promovido a SUPER ADMIN (sem igreja vinculada)', target_email;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Não foi possível promover sem uma igreja criada. Crie uma igreja primeiro manualmente no banco.';
            END;
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Usuário % não encontrado. Pulei a etapa de permissão.', target_email;
    END IF;

    RAISE NOTICE '✅ Master Fix concluído com sucesso!';
END $$;
