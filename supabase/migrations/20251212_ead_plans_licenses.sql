CREATE TABLE IF NOT EXISTS public.ead_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  max_students INTEGER,
  monthly_price NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ead_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES public.college_matriz(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.ead_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active','inactive','suspended')) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  active_students INTEGER DEFAULT 0,
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ead_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY ead_plans_select ON public.ead_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_plans_write ON public.ead_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ead_licenses_select ON public.ead_licenses FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_licenses_write ON public.ead_licenses FOR INSERT TO authenticated WITH CHECK (true);

