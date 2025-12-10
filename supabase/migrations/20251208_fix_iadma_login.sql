-- Migration to fix login permissions for IADMA users

DO $$
DECLARE
    v_church_id UUID;
    v_user_1 UUID;
    v_user_2 UUID;
BEGIN
    -- 1. Find the Church ID
    SELECT id INTO v_church_id
    FROM public.churches
    WHERE nome_fantasia ILIKE '%assembleia de deus missão apostolica%'
    LIMIT 1;

    IF v_church_id IS NULL THEN
        RAISE NOTICE 'Church not found via name search. Trying to find ANY matriz.';
        SELECT id INTO v_church_id FROM public.churches WHERE nivel = 'matriz' LIMIT 1;
    END IF;

    RAISE NOTICE 'Target Church ID: %', v_church_id;

    -- 2. Find User IDs by Email
    SELECT id INTO v_user_1 FROM auth.users WHERE email = 'pr.vcsantos@gmail.com';
    SELECT id INTO v_user_2 FROM auth.users WHERE email = 'iadmasede@gmail.com';

    -- 3. Grant Permissions for User 1 (pr.vcsantos@gmail.com)
    IF v_user_1 IS NOT NULL THEN
        RAISE NOTICE 'Granting permissions to pr.vcsantos@gmail.com (%)', v_user_1;
        
        -- Clean existing roles to avoid conflicts/confusion
        DELETE FROM public.user_roles WHERE user_id = v_user_1;

        -- Insert Super Admin Role (Global Access)
        INSERT INTO public.user_roles (user_id, role, church_id)
        VALUES (v_user_1, 'super_admin', v_church_id); -- Associates with church but role is global super_admin helper
        
        -- Also ensure they are a 'member' of this church so RLS involving members table works
        -- (Optional but good for consistency)
        INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
        VALUES (v_church_id, v_user_1, 'Valdinei Santos', 'Pastor', 'pr.vcsantos@gmail.com', true)
        ON CONFLICT (email, church_id) DO NOTHING;
        
    ELSE
        RAISE WARNING 'User pr.vcsantos@gmail.com not found in auth.users';
    END IF;

    -- 4. Grant Permissions for User 2 (iadmasede@gmail.com)
    IF v_user_2 IS NOT NULL THEN
        RAISE NOTICE 'Granting permissions to iadmasede@gmail.com (%)', v_user_2;

        -- Clean existing roles
        DELETE FROM public.user_roles WHERE user_id = v_user_2;

        -- Insert Admin Role for the specific Church
        INSERT INTO public.user_roles (user_id, role, church_id)
        VALUES (v_user_2, 'admin', v_church_id);
        
        -- Also ensure member linkage
        INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
        VALUES (v_church_id, v_user_2, 'Admin Sede', 'Administrador', 'iadmasede@gmail.com', true)
        ON CONFLICT (email, church_id) DO NOTHING;

    ELSE
        RAISE WARNING 'User iadmasede@gmail.com not found in auth.users';
    END IF;

END $$;
