CREATE TABLE IF NOT EXISTS public.state_scope (
  user_id UUID NOT NULL,
  church_id UUID NOT NULL,
  state_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, church_id, state_code)
);

ALTER TABLE public.state_scope ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own state scope" ON public.state_scope;
CREATE POLICY "Read own state scope" ON public.state_scope
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage state scope" ON public.state_scope;
CREATE POLICY "Manage state scope" ON public.state_scope
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.church_id = state_scope.church_id
        AND (ur.is_manipulator = true OR ur.role IN ('admin','pastor_presidente','pastor') OR ur.role = 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Presidente estadual must have scope" ON public.user_roles;
CREATE POLICY "Presidente estadual must have scope" ON public.user_roles
  FOR INSERT WITH CHECK (
    role != 'presidente_estadual' OR EXISTS (
      SELECT 1 FROM public.state_scope s
      WHERE s.user_id = user_roles.user_id AND s.church_id = user_roles.church_id
    )
  )
  FOR UPDATE USING (
    role != 'presidente_estadual' OR EXISTS (
      SELECT 1 FROM public.state_scope s
      WHERE s.user_id = user_roles.user_id AND s.church_id = user_roles.church_id
    )
  );

