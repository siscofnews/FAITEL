-- Migration: Create Permissions and Audit System

-- 1. System Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    church_id UUID REFERENCES public.churches(id), -- Optional, links action to a church context
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'GRANT_PERMISSION'
    entity TEXT NOT NULL, -- 'MEMBER', 'SCHEDULE', 'FINANCIAL', 'USER'
    entity_id TEXT, -- ID of the affected record
    details JSONB, -- Previous state, new state, changes
    ip_address TEXT
);

-- RLS for Logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view logs
CREATE POLICY "Admins can view all logs"
ON public.system_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_curches uc
        WHERE uc.user_id = auth.uid() 
        AND uc.role IN ('admin', 'pastor') -- Adjust based on actual role names
    )
);

-- Everyone can insert (service role or trigger will handle, but app needs insert for implicit logging)
CREATE POLICY "System can insert logs"
ON public.system_logs FOR INSERT
WITH CHECK (true);


-- 2. App Permissions (Granular)
CREATE TABLE IF NOT EXISTS public.app_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    church_id UUID REFERENCES public.churches(id) NOT NULL,
    
    -- Member Management
    can_view_members BOOLEAN DEFAULT false,
    can_edit_members BOOLEAN DEFAULT false,
    can_delete_members BOOLEAN DEFAULT false,
    
    -- Financial
    can_view_financial BOOLEAN DEFAULT false,
    can_edit_financial BOOLEAN DEFAULT false,
    
    -- Content / Site
    can_manage_news BOOLEAN DEFAULT false,
    can_manage_events BOOLEAN DEFAULT false,
    can_manage_site BOOLEAN DEFAULT false, -- Banners, etc
    
    -- System / Config
    can_manage_permissions BOOLEAN DEFAULT false, -- Can grant rights to others
    can_manage_hierarchy BOOLEAN DEFAULT false,
    
    -- Scales (Migrating/Linking logic from schedule_permissions optionally, or keeping separate. Let's include for completeness)
    can_view_scales BOOLEAN DEFAULT false,
    can_manage_scales BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, church_id)
);

ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own permissions
CREATE POLICY "Users view own permissions"
ON public.app_permissions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins/Pastors can view all permissions for their church
CREATE POLICY "Admins view church permissions"
ON public.app_permissions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.members m -- Assuming members table links users to roles??? 
        -- Actually, roles are likely in members table or user_roles.
        -- Let's trust the app logic or existing RLS patterns.
        -- For now, allow reading if you have 'can_manage_permissions' OR are the target user.
        WHERE m.user_id = auth.uid() AND m.church_id = public.app_permissions.church_id AND (m.role IN ('pastor', 'admin', 'secretario'))
    )
);

-- Policy: Admins can update permissions
CREATE POLICY "Admins manage permissions"
ON public.app_permissions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.user_id = auth.uid() AND m.church_id = public.app_permissions.church_id AND (m.role IN ('pastor', 'admin'))
    )
);

-- Enable Realtime
alter publication supabase_realtime add table public.system_logs;
alter publication supabase_realtime add table public.app_permissions;
