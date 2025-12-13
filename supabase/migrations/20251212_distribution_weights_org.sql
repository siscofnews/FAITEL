ALTER TABLE public.distribution_weights ADD COLUMN IF NOT EXISTS org_id UUID;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF((auth.jwt() ->> 'org_id'), '')::uuid;
$$;

DROP POLICY IF EXISTS dw_select_auth ON public.distribution_weights;
CREATE POLICY dw_select_org ON public.distribution_weights
FOR SELECT TO authenticated
USING (org_id IS NULL OR org_id = public.current_org_id());

DROP POLICY IF EXISTS dw_insert_own ON public.distribution_weights;
CREATE POLICY dw_insert_org_own ON public.distribution_weights
FOR INSERT TO authenticated
WITH CHECK ((org_id IS NULL OR org_id = public.current_org_id()) AND updated_by = auth.uid());

DROP POLICY IF EXISTS dw_update_own ON public.distribution_weights;
CREATE POLICY dw_update_org_own ON public.distribution_weights
FOR UPDATE TO authenticated
USING ((org_id IS NULL OR org_id = public.current_org_id()) AND updated_by = auth.uid())
WITH CHECK ((org_id IS NULL OR org_id = public.current_org_id()) AND updated_by = auth.uid());

DROP POLICY IF EXISTS dw_delete_own ON public.distribution_weights;
CREATE POLICY dw_delete_org_own ON public.distribution_weights
FOR DELETE TO authenticated
USING ((org_id IS NULL OR org_id = public.current_org_id()) AND updated_by = auth.uid());

