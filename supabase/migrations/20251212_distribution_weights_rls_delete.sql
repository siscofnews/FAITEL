CREATE POLICY dw_delete_own ON public.distribution_weights
FOR DELETE TO authenticated
USING (updated_by = auth.uid());

