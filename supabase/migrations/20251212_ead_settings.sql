CREATE TABLE IF NOT EXISTS public.ead_settings (
  faculty_id UUID PRIMARY KEY REFERENCES public.college_matriz(id) ON DELETE CASCADE,
  block_hours_on_fail INTEGER NOT NULL DEFAULT 24,
  max_reprobations INTEGER NOT NULL DEFAULT 3,
  min_view_percentage NUMERIC(5,2) NOT NULL DEFAULT 90,
  org_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ead_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY ead_settings_select ON public.ead_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_settings_write ON public.ead_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ead_settings_update ON public.ead_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

