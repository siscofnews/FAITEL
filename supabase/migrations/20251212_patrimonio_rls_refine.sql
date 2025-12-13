DO $$ BEGIN
  DROP POLICY IF EXISTS "assets_view_scope" ON public.assets;
  DROP POLICY IF EXISTS "assets_manage_scope" ON public.assets;
END $$;

CREATE POLICY "assets_read_by_role" ON public.assets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.church_id = assets.church_id
      AND ur.role IN ('ADMIN_MATRIZ','PASTOR_LOCAL','SECRETARIO','VISUALIZADOR','admin','pastor_presidente','pastor','super_admin')
  )
);

CREATE POLICY "assets_write_by_role" ON public.assets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.church_id = assets.church_id
      AND ur.role IN ('ADMIN_MATRIZ','PASTOR_LOCAL','SECRETARIO','admin','pastor_presidente','pastor','super_admin')
  )
)
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.church_id = assets.church_id
      AND ur.role IN ('ADMIN_MATRIZ','PASTOR_LOCAL','SECRETARIO','admin','pastor_presidente','pastor','super_admin')
  )
);

CREATE POLICY "movements_write_by_role" ON public.asset_movements
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.assets a ON a.id = asset_movements.asset_id
    WHERE ur.user_id = auth.uid()
      AND ur.church_id = a.church_id
      AND ur.role IN ('ADMIN_MATRIZ','PASTOR_LOCAL','SECRETARIO','admin','pastor_presidente','pastor','super_admin')
  )
);

