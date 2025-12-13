-- Function to validate local role allowed by church level
CREATE OR REPLACE FUNCTION public.allowed_local_role_for_level(_church_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE v_level public.church_level;
BEGIN
  SELECT nivel INTO v_level FROM public.churches WHERE id = _church_id;
  IF v_level IS NULL THEN RETURN FALSE; END IF;
  IF v_level = 'celula' THEN
    RETURN _role IN ('secretario','coordenador');
  ELSIF v_level IN ('congregacao') THEN
    RETURN _role IN ('secretario','coordenador');
  ELSIF v_level IN ('sede','subsede') THEN
    RETURN _role IN ('secretario','primeiro_tesoureiro','segundo_tesoureiro','coordenador','vice_presidente');
  ELSIF v_level = 'matriz' THEN
    RETURN _role IN ('secretario','primeiro_tesoureiro','segundo_tesoureiro','coordenador','vice_presidente','presidente_estadual');
  END IF;
  RETURN FALSE;
END; $$;

-- Policy to restrict user_roles upserts to allowed roles and authorized users
DROP POLICY IF EXISTS "Local roles allowed by level" ON public.user_roles;
CREATE POLICY "Local roles allowed by level" ON public.user_roles
  FOR INSERT WITH CHECK (
    public.allowed_local_role_for_level(church_id, role)
    AND (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.church_id = user_roles.church_id AND (ur.is_manipulator = true OR ur.role IN ('admin','pastor_presidente','pastor')))
      OR EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role = 'super_admin')
    )
  )
  FOR UPDATE USING (
    public.allowed_local_role_for_level(church_id, role)
    AND (
      EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.church_id = user_roles.church_id AND (ur.is_manipulator = true OR ur.role IN ('admin','pastor_presidente','pastor')))
      OR EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role = 'super_admin')
    )
  );

-- Simple policy to allow inserting logs only by authenticated users
DROP POLICY IF EXISTS "Authenticated can insert permission logs" ON public.permission_logs;
CREATE POLICY "Authenticated can insert permission logs" ON public.permission_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

