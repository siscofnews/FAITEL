-- Migration: Create church_roles table and seed data
-- Date: 2025-12-09

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.church_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    is_system_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.church_roles ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow Read for everyone (authenticated and public if needed for registration, but let's stick to authenticated for now unless registration is public)
-- Since we have public registration, we might need public read.
CREATE POLICY "Everyone can read roles" ON public.church_roles
    FOR SELECT USING (true);

-- Allow Insert for Admins and Super Admins
CREATE POLICY "Admins can insert roles" ON public.church_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND (role = 'super_admin' OR role = 'pastor_presidente' OR is_super_admin = true)
        )
    );

-- 4. Seed Data
INSERT INTO public.church_roles (name, is_system_default)
VALUES 
    ('Obreiro', true),
    ('Obreira', true),
    ('Diácono', true),
    ('Diaconisa', true),
    ('Missionário', true),
    ('Missionária', true),
    ('Presbítero', true),
    ('Evangelista', true),
    ('Pastor', true),
    ('Pastora', true),
    ('Pastor Presidente', true),
    ('Pastora Vice-Presidente', true),
    ('Bispo', true),
    ('Bispa', true),
    ('Apóstolo', true),
    ('Apóstola', true),
    ('Músicos', true),
    ('Líder de Ministério de Louvor', true),
    ('Líderes de Jovens', true),
    ('Líder de Senhores', true),
    ('Líder de Senhoras', true),
    ('Líder de Crianças', true),
    ('Líderes de Células', true),
    ('Auxiliares', true),
    ('Cooperadores', true),
    ('Porteiro', true),
    ('Líder de Mídia', true)
ON CONFLICT (name) DO NOTHING;
