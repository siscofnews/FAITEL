-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view own pending church" ON public.churches;

-- Create a security definer function to get current user email
CREATE OR REPLACE FUNCTION public.get_auth_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Recreate the policy using the function
CREATE POLICY "Users can view own pending church" 
ON public.churches 
FOR SELECT 
USING (
  (is_approved = false) 
  AND (email IS NOT NULL) 
  AND (email = public.get_auth_user_email())
);