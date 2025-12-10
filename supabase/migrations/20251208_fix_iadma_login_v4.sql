-- Migration to fix login permissions for IADMA users V4 (Fixed RLS and Enum)

DO $$
DECLARE
    v_church_id UUID;
    v_user_1 UUID;
    v_user_2 UUID;
    v_member_exists BOOLEAN;
BEGIN
    -- 1. Find the Church ID (Matriz preferred)
    SELECT id INTO v_church_id
    FROM public.churches
    WHERE nome_fantasia ILIKE '%assembleia de deus missão apostolica%'
    LIMIT 1;

    IF v_church_id IS NULL THEN
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
        
        -- Handle Member Linkage
        SELECT EXISTS (SELECT 1 FROM public.members WHERE email = 'pr.vcsantos@gmail.com' AND church_id = v_church_id) INTO v_member_exists;
        
        IF v_member_exists THEN
             UPDATE public.members SET user_id = v_user_1, is_active = true WHERE email = 'pr.vcsantos@gmail.com' AND church_id = v_church_id;
        ELSE
             -- Avoid "ON CONFLICT" errors by just trying insert if checks pass, or basic insert
             INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
             VALUES (v_church_id, v_user_1, 'Valdinei Santos', 'Pastor', 'pr.vcsantos@gmail.com', true);
        END IF;
        
    ELSE
        RAISE EXCEPTION 'ERROR: User pr.vcsantos@gmail.com DOES NOT EXIST in auth.users. Please create account using Sign Up first!';
    END IF;

    -- 4. Grant Permissions for User 2 (iadmasede@gmail.com)
    IF v_user_2 IS NOT NULL THEN
        RAISE NOTICE 'User found: iadmasede@gmail.com (ID: %). Granting PASTOR PRESIDENTE (Admin equivalent).', v_user_2;

        -- Clean existing roles
        DELETE FROM public.user_roles WHERE user_id = v_user_2;

        -- Insert Role (using pastor_presidente as admin is not in enum)
        INSERT INTO public.user_roles (user_id, role, church_id)
        VALUES (v_user_2, 'pastor_presidente', v_church_id);
        
        -- Handle Member Linkage
        SELECT EXISTS (SELECT 1 FROM public.members WHERE email = 'iadmasede@gmail.com' AND church_id = v_church_id) INTO v_member_exists;
        
        IF v_member_exists THEN
             UPDATE public.members SET user_id = v_user_2, is_active = true WHERE email = 'iadmasede@gmail.com' AND church_id = v_church_id;
        ELSE
             INSERT INTO public.members (church_id, user_id, full_name, role, email, is_active)
             VALUES (v_church_id, v_user_2, 'Admin Sede', 'Administrador', 'iadmasede@gmail.com', true);
        END IF;

    ELSE
        RAISE WARNING 'User iadmasede@gmail.com does not exist. Skipping.';
    END IF;

    RAISE NOTICE 'SUCCESS: Permissions updated successfully!';

END $$;
