ALTER TABLE public.distribution_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY dw_select_auth ON public.distribution_weights
FOR SELECT TO authenticated
USING (true);

CREATE POLICY dw_insert_own ON public.distribution_weights
FOR INSERT TO authenticated
WITH CHECK (updated_by = auth.uid());

CREATE POLICY dw_update_own ON public.distribution_weights
FOR UPDATE TO authenticated
USING (updated_by = auth.uid())
WITH CHECK (updated_by = auth.uid());

