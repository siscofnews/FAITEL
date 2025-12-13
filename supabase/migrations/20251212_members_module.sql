CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL
);

CREATE OR REPLACE FUNCTION public.create_default_departments()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.departments (church_id, name, min_age, max_age) VALUES (NEW.id,'CRIANCAS',0,11);
  INSERT INTO public.departments (church_id, name, min_age, max_age) VALUES (NEW.id,'ADOLESCENTES',12,17);
  INSERT INTO public.departments (church_id, name, min_age, max_age) VALUES (NEW.id,'JOVENS',18,29);
  INSERT INTO public.departments (church_id, name, min_age, max_age) VALUES (NEW.id,'ADULTOS',30,200);
  RETURN NEW;
END;$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_create_departments'
  ) THEN
    CREATE TRIGGER trg_create_departments AFTER INSERT ON public.churches
    FOR EACH ROW EXECUTE PROCEDURE public.create_default_departments();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.member_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID UNIQUE NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  father_name TEXT,
  mother_name TEXT,
  naturality TEXT,
  nationality TEXT,
  education_level TEXT,
  marital_status TEXT,
  spouse_name TEXT,
  conversion_date DATE,
  baptism_water_date DATE,
  baptism_spirit_date DATE,
  dating_date DATE,
  engagement_date DATE,
  wedding_date DATE,
  church_position TEXT,
  state_convention TEXT,
  general_convention TEXT,
  theology_course TEXT,
  theology_institution TEXT,
  photo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tithes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.offerings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.member_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type TEXT,
  path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity TEXT,
  entity_id UUID,
  action TEXT,
  performed_by UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.assign_member_department(m_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE bdate DATE; ch_id UUID; age INT; dept UUID;
BEGIN
  SELECT birth_date, church_id INTO bdate, ch_id FROM public.members WHERE id = m_id;
  IF bdate IS NULL THEN RETURN; END IF;
  age := DATE_PART('year', AGE(bdate));
  SELECT id INTO dept FROM public.departments WHERE church_id = ch_id AND min_age <= age AND max_age >= age LIMIT 1;
  IF dept IS NOT NULL THEN UPDATE public.members SET department_id = dept WHERE id = m_id; END IF;
END;$$;

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_tither BOOLEAN DEFAULT FALSE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_offeror BOOLEAN DEFAULT FALSE;

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tithes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "public_insert_member_profiles" ON public.member_profiles;
  CREATE POLICY "public_insert_member_profiles" ON public.member_profiles FOR INSERT WITH CHECK (true);
END $$;

