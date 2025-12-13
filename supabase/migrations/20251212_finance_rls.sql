ALTER TABLE public.church_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convention_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convention_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convention_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pole_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS church_read ON public.church_entries;
  CREATE POLICY church_read ON public.church_entries FOR SELECT USING (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.church_id = church_entries.church_id));
  DROP POLICY IF EXISTS church_write ON public.church_entries;
  CREATE POLICY church_write ON public.church_entries FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.church_id = church_entries.church_id));
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS church_read_x ON public.church_expenses;
  CREATE POLICY church_read_x ON public.church_expenses FOR SELECT USING (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.church_id = church_expenses.church_id));
  DROP POLICY IF EXISTS church_write_x ON public.church_expenses;
  CREATE POLICY church_write_x ON public.church_expenses FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.church_id = church_expenses.church_id));
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS conv_read ON public.convention_entries;
  CREATE POLICY conv_read ON public.convention_entries FOR SELECT USING (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.convention_id = convention_entries.convention_id));
  DROP POLICY IF EXISTS conv_write ON public.convention_entries;
  CREATE POLICY conv_write ON public.convention_entries FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.convention_id = convention_entries.convention_id));
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS pole_read ON public.payments;
  CREATE POLICY pole_read ON public.payments FOR SELECT USING (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.pole_id = payments.pole_id));
  DROP POLICY IF EXISTS pole_write ON public.payments;
  CREATE POLICY pole_write ON public.payments FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.pole_id = payments.pole_id));
END $$;

