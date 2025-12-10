-- Create a SECURITY DEFINER function to safely assign pastor role during registration
-- This bypasses RLS to allow role assignment when creating a new church
CREATE OR REPLACE FUNCTION public.assign_initial_pastor_role(
  _user_id uuid,
  _church_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the church exists and has this user as pastor_presidente_id
  -- Only works for unapproved churches (newly registered)
  IF NOT EXISTS (
    SELECT 1 FROM churches 
    WHERE id = _church_id 
    AND pastor_presidente_id = _user_id
    AND is_approved = false
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Insert the pastor role
  INSERT INTO user_roles (user_id, church_id, role)
  VALUES (_user_id, _church_id, 'pastor_presidente')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;