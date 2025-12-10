-- ==============================================================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO - ESCALAS DE CULTO
-- Execute este script para criar TODAS as tabelas e dados necessários.
-- ==============================================================================

-- 1. Enum Types (se não existirem)
DO $$ BEGIN
    CREATE TYPE public.schedule_status AS ENUM ('draft', 'published', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Service Types (Tipos de Culto)
CREATE TABLE IF NOT EXISTS public.service_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    is_system_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read service_types" ON public.service_types;
CREATE POLICY "Public read service_types" ON public.service_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins insert service_types" ON public.service_types;
CREATE POLICY "Admins insert service_types" ON public.service_types FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND (role = 'super_admin' OR is_super_admin = true))
);

-- Seed Service Types
INSERT INTO public.service_types (name, is_system_default) VALUES
('Culto de Domingo', true),
('Culto de Ensino', true),
('Santa Ceia', true),
('Culto de Jovens', true),
('Culto de Oração', true),
('EBD', true)
ON CONFLICT DO NOTHING;

-- 3. Assignment Roles (Funções na Escala: Pregador, Dirigente, etc)
CREATE TABLE IF NOT EXISTS public.assignment_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL, -- 'liturgy', 'worship', 'support', 'other'
    is_multiple boolean DEFAULT false,
    is_system_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assignment_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read assignment_roles" ON public.assignment_roles;
CREATE POLICY "Public read assignment_roles" ON public.assignment_roles FOR SELECT USING (true);

-- Seed Assignment Roles (LISTA COMPLETA)
INSERT INTO public.assignment_roles (name, category, is_multiple, is_system_default) VALUES
-- Liturgia
('Dirigente', 'liturgy', false, true),
('Pregador', 'liturgy', false, true),
('Oração Oferta e Dízimos', 'liturgy', false, true),
('Leitura da Palavra', 'liturgy', false, true),
('Bênção Apostólica', 'liturgy', false, true),
('Oportunidade', 'liturgy', true, true),
-- Louvor
('Líder de Louvor', 'worship', false, true),
('Músicos', 'worship', true, true),
('Backvocal', 'worship', true, true),
('Sonoplastia', 'worship', false, true),
('Mídia / Projeção', 'worship', false, true),
-- Apoio
('Porteiro(a)', 'support', false, true),
('Recepção', 'support', true, true),
('Limpeza', 'support', false, true),
('Servir Água', 'support', false, true),
('Ofertório', 'support', false, true),
('Conferente', 'support', false, true),
('Cantina', 'support', false, true),
('Segurança', 'support', false, true)
ON CONFLICT DO NOTHING;

-- 4. Worship Schedules (Cabeçalho da Escala)
CREATE TABLE IF NOT EXISTS public.worship_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id uuid REFERENCES public.churches(id) ON DELETE CASCADE,
    cell_id uuid REFERENCES public.cells(id) ON DELETE CASCADE,
    date date NOT NULL,
    time time,
    service_type_id uuid REFERENCES public.service_types(id),
    
    youtube_links jsonb DEFAULT '[]'::jsonb,
    department_ids jsonb DEFAULT '[]'::jsonb,
    
    tithes_value decimal(10,2) DEFAULT 0,
    offerings_value decimal(10,2) DEFAULT 0,
    
    status public.schedule_status DEFAULT 'draft',
    attendance_count integer DEFAULT 0,
    notes text,
    
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.worship_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read schedules" ON public.worship_schedules;
CREATE POLICY "Authenticated read schedules" ON public.worship_schedules FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated insert schedules" ON public.worship_schedules;
CREATE POLICY "Authenticated insert schedules" ON public.worship_schedules FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update schedules" ON public.worship_schedules;
CREATE POLICY "Authenticated update schedules" ON public.worship_schedules FOR UPDATE USING (auth.role() = 'authenticated');


-- 5. Worship Assignments (Pessoas escaladas)
CREATE TABLE IF NOT EXISTS public.worship_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    worship_schedule_id uuid REFERENCES public.worship_schedules(id) ON DELETE CASCADE NOT NULL,
    assignment_role_id uuid REFERENCES public.assignment_roles(id) NOT NULL,
    
    member_id uuid REFERENCES public.members(id) ON DELETE SET NULL, 
    custom_name text, 
    
    observation text,
    is_present boolean DEFAULT true, 
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.worship_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read assignments" ON public.worship_assignments;
CREATE POLICY "Authenticated read assignments" ON public.worship_assignments FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated insert assignments" ON public.worship_assignments;
CREATE POLICY "Authenticated insert assignments" ON public.worship_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated update assignments" ON public.worship_assignments;
CREATE POLICY "Authenticated update assignments" ON public.worship_assignments FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated delete assignments" ON public.worship_assignments;
CREATE POLICY "Authenticated delete assignments" ON public.worship_assignments FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_worship_schedules_church_date ON public.worship_schedules(church_id, date);
CREATE INDEX IF NOT EXISTS idx_worship_assignments_schedule ON public.worship_assignments(worship_schedule_id);

