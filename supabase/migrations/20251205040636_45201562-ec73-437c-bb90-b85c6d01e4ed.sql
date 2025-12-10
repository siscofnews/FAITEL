-- Drop and recreate the view with SECURITY INVOKER (safer default)
DROP VIEW IF EXISTS public.churches_public;

CREATE VIEW public.churches_public 
WITH (security_invoker = true) AS
SELECT 
  id, 
  nome_fantasia, 
  cidade, 
  estado, 
  nivel,
  logo_url
FROM public.churches
WHERE is_approved = true AND is_active = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.churches_public TO anon;
GRANT SELECT ON public.churches_public TO authenticated;

-- Comment explaining the view's purpose
COMMENT ON VIEW public.churches_public IS 'Restricted public view of churches - excludes sensitive contact data (email, phone, address, pastor name)';