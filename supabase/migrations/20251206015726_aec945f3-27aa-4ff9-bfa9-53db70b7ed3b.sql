-- Remove the overly permissive public policy that exposes all member data
DROP POLICY IF EXISTS "Public can view member names for schedules" ON public.members;

-- Create a restricted view that only exposes necessary fields for public schedule consultation
CREATE OR REPLACE VIEW public.members_public AS
SELECT 
  id,
  full_name,
  church_id,
  role,
  avatar_url
FROM public.members 
WHERE is_active = true;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.members_public TO anon, authenticated;