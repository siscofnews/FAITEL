-- 1. Custom Types
CREATE TYPE public.schedule_status AS ENUM ('draft', 'published', 'completed');

-- 2. Service Types (Tipos de Culto)
CREATE TABLE IF NOT EXISTS public.service_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    is_system_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service_types" ON public.service_types FOR SELECT USING (true);
CREATE POLICY "Admins insert service_types" ON public.service_types FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'super_admin' OR is_super_admin = true))
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
CREATE POLICY "Public read assignment_roles" ON public.assignment_roles FOR SELECT USING (true);

-- Seed Assignment Roles
INSERT INTO public.assignment_roles (name, category, is_multiple, is_system_default) VALUES
-- Liturgy
('Dirigente', 'liturgy', false, true),
('Pregador', 'liturgy', false, true),
('Oração Oferta e Dízimos', 'liturgy', false, true),
('Leitura da Palavra', 'liturgy', false, true),
('Bênção Apostólica', 'liturgy', false, true),
('Oportunidade', 'liturgy', true, true),
-- Worship
('Líder de Louvor', 'worship', false, true),
('Músicos', 'worship', true, true),
-- Support
('Porteiro(a)', 'support', false, true),
('Limpeza', 'support', false, true),
('Servir Água', 'support', false, true),
('Ofertório', 'support', false, true),
('Conferente', 'support', false, true)
ON CONFLICT DO NOTHING;

-- 4. Worship Schedules (Cabeçalho da Escala)
CREATE TABLE IF NOT EXISTS public.worship_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id uuid REFERENCES public.churches(id) ON DELETE CASCADE,
    cell_id uuid REFERENCES public.cells(id) ON DELETE CASCADE, -- Nullable, set if it's a cell service
    date date NOT NULL,
    time time,
    service_type_id uuid REFERENCES public.service_types(id),
    
    -- Specifics
    youtube_links jsonb DEFAULT '[]'::jsonb, -- Array of strings
    department_ids jsonb DEFAULT '[]'::jsonb, -- Array of IDs ? Or text names? Let's use text for simplicity or just store ID references if needed. Storing simplified list for now.
    
    -- Financials
    tithes_value decimal(10,2) DEFAULT 0,
    offerings_value decimal(10,2) DEFAULT 0,
    
    -- Control
    status public.schedule_status DEFAULT 'draft',
    attendance_count integer DEFAULT 0,
    notes text,
    
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.worship_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for Schedules (Simplified: Authenticated users can read/write for now, ideal would be per church)
CREATE POLICY "Authenticated read schedules" ON public.worship_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert schedules" ON public.worship_schedules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update schedules" ON public.worship_schedules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete schedules" ON public.worship_schedules FOR DELETE USING (auth.role() = 'authenticated');


-- 5. Worship Assignments (Pessoas escaladas)
CREATE TABLE IF NOT EXISTS public.worship_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    worship_schedule_id uuid REFERENCES public.worship_schedules(id) ON DELETE CASCADE NOT NULL,
    assignment_role_id uuid REFERENCES public.assignment_roles(id) NOT NULL,
    
    member_id uuid REFERENCES public.members(id) ON DELETE SET NULL, -- Link to member
    custom_name text, -- For external guests or "Músicos extras" not in DB
    
    observation text, -- "Justificativa", "Instrumento", etc.
    is_present boolean DEFAULT true, -- For attendance check
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.worship_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read assignments" ON public.worship_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert assignments" ON public.worship_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update assignments" ON public.worship_assignments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete assignments" ON public.worship_assignments FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_worship_schedules_church_date ON public.worship_schedules(church_id, date);
CREATE INDEX idx_worship_assignments_schedule ON public.worship_assignments(worship_schedule_id);
