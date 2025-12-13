-- Enhance get_accessible_church_ids to account for state_scope
CREATE OR REPLACE FUNCTION public.get_accessible_church_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scoped AS (
    SELECT c.id FROM public.churches c
    INNER JOIN public.state_scope s ON s.state_code = c.estado AND s.user_id = _user_id
  ), roles AS (
    SELECT c.id FROM public.churches c
    INNER JOIN public.user_roles ur ON ur.church_id = c.id
    WHERE ur.user_id = _user_id
  ), unioned AS (
    SELECT id FROM scoped
    UNION
    SELECT id FROM roles
  ), hierarchy AS (
    SELECT id FROM unioned
    UNION
    SELECT c.id FROM public.churches c INNER JOIN hierarchy h ON c.parent_church_id = h.id
  )
  SELECT id FROM hierarchy;
$$;

