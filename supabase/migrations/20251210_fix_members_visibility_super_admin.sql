-- Migration: Fix RLS policies for members visibility (2025-12-10)
-- Ensures Super Admin can see ALL members across all churches

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fixing Members Visibility...';
    RAISE NOTICE '========================================';

    -- 1. Drop ALL existing SELECT policies on members
    DROP POLICY IF EXISTS "Super Admin View All Members" ON public.members;
    DROP POLICY IF EXISTS "Admin View Church Members" ON public.members;
    DROP POLICY IF EXISTS "Admins can view members" ON public.members;
    DROP POLICY IF EXISTS "Members can view own profile" ON public.members;
    DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
    DROP POLICY IF EXISTS "Authenticated View All" ON public.members;
    DROP POLICY IF EXISTS "Users can view members of their church" ON public.members;
    DROP POLICY IF EXISTS "Allow public member registration" ON public.members;
    
    RAISE NOTICE '✓ Old SELECT policies removed';

    -- 2. Create COMPREHENSIVE SELECT policy
    -- Super Admin sees EVERYTHING
    CREATE POLICY "super_admin_view_all_members"
    ON public.members 
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND (is_super_admin = true OR role = 'super_admin')
        )
    );
    
    RAISE NOTICE '✓ Super Admin view policy created';

    -- 3. Pastor/Admin sees their church + all child churches
    CREATE POLICY "pastor_view_hierarchy_members"
    ON public.members 
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.user_roles ur
            JOIN public.churches user_church ON user_church.id = ur.church_id
            JOIN public.churches member_church ON member_church.id = members.church_id
            WHERE ur.user_id = auth.uid()
            AND (
                -- Same church
                member_church.id = user_church.id
                OR
                -- Member church is child of user church
                member_church.parent_id = user_church.id
                OR
                -- Member church is in the hierarchy below (grandchild, etc)
                member_church.parent_id IN (
                    SELECT id FROM public.churches WHERE parent_id = user_church.id
                )
            )
        )
    );
    
    RAISE NOTICE '✓ Hierarchical view policy created';

    -- 4. Member can view their own profile
    CREATE POLICY "member_view_own_profile"
    ON public.members 
    FOR SELECT
    USING (
        auth.uid() = user_id
    );
    
    RAISE NOTICE '✓ Self-view policy created';

    -- 5. Verify RLS is enabled
    ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✓ RLS enabled on members table';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SUCCESS! Member visibility fixed!';
    RAISE NOTICE 'Super Admins can now see ALL members';
    RAISE NOTICE '========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '❌ ERROR: %', SQLERRM;
        RAISE NOTICE '========================================';
        RAISE;
END $$;
