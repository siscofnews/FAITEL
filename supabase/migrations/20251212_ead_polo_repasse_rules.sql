CREATE TABLE IF NOT EXISTS public.ead_polo_repasse_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  polo_id UUID NOT NULL REFERENCES public.college_polo(id) ON DELETE CASCADE,
  percent_to_matriz NUMERIC(5,2) NOT NULL,
  effective_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(polo_id, effective_date)
);

ALTER TABLE public.ead_polo_repasse_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY ead_polo_repasse_rules_select ON public.ead_polo_repasse_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_polo_repasse_rules_write ON public.ead_polo_repasse_rules FOR INSERT TO authenticated WITH CHECK (true);

