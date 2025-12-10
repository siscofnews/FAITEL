-- Migration to fix login permissions for IADMA users V2 (Robust)

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
        -- Fallback to ANY matriz if specific name fails
        SELECT id INTO v_church_id FROM public.churches WHERE nivel = 'matriz' LIMIT 1;
    END IF;

    IF v_church_id IS NULL THEN
        RAISE EXCEPTION 'CRITICAL: No Church found! Cannot grant permissions.';
    END IF;

    RAISE NOTICE 'Target Church ID: %', v_church_id;

    -- 2. Find User IDs by Email
    SELECT id INTO v_user_1 FROM auth.users WHERE email = 'pr.vcsantos@gmail.com';
    SELECT id INTO v_user_2 FROM auth.users WHERE email = 'iadmasede@gmail.com';

    -- 3. Grant Permissions for User 1 (pr.vcsantos@gmail.com)
    IF v_user_1 IS NOT NULL THEN
        RAISE NOTICE 'User found: pr.vcsantos@gmail.com (ID: %). Granting SUPER ADMIN.', v_user_1;
        
        -- Clean existing roles
        DELETE FROM public.user_roles WHERE user_id = v_user_1;

        -- Insert Super Admin Role
        INSERT INTO public.user_roles (user_id, role, church_id)
        VALUES (v_user_1, 'super_admin', v_church_id);
        
        -- Ensure member linkage
        INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
        VALUES (v_church_id, v_user_1, 'Valdinei Santos', 'Pastor', 'pr.vcsantos@gmail.com', true)
        ON CONFLICT (email, church_id) 
        DO UPDATE SET user_id = EXCLUDED.user_id, is_active = true;
        
    ELSE
        RAISE EXCEPTION 'ERROR: User pr.vcsantos@gmail.com DOES NOT EXIST in auth.users. Please Sign Up first!';
    END IF;

    -- 4. Grant Permissions for User 2 (iadmasede@gmail.com)
    IF v_user_2 IS NOT NULL THEN
        RAISE NOTICE 'User found: iadmasede@gmail.com (ID: %). Granting ADMIN.', v_user_2;

        -- Clean existing roles
        DELETE FROM public.user_roles WHERE user_id = v_user_2;

        -- Insert Admin Role
        INSERT INTO public.user_roles (user_id, role, church_id)
        VALUES (v_user_2, 'admin', v_church_id);
        
        -- Ensure member linkage
        INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
        VALUES (v_church_id, v_user_2, 'Admin Sede', 'Administrador', 'iadmasede@gmail.com', true)
        ON CONFLICT (email, church_id) 
        DO UPDATE SET user_id = EXCLUDED.user_id, is_active = true;

    ELSE
        RAISE WARNING 'User iadmasede@gmail.com does not exist. Skipping.';
    END IF;

    RAISE NOTICE 'SUCCESS: Permissions updated successfully!';

END $$;
