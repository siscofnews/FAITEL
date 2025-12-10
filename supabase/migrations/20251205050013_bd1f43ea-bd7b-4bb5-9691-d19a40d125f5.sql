-- Create invitations table for user invites
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  email TEXT NOT NULL,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'membro',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create index for token lookups
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

-- RLS Policies

-- Super admins can manage all invitations
CREATE POLICY "Super admins can manage all invitations"
ON public.invitations
FOR ALL
USING (is_super_admin(auth.uid()));

-- Pastors can view invitations in their hierarchy
CREATE POLICY "Pastors can view invitations in their hierarchy"
ON public.invitations
FOR SELECT
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- Pastors can create invitations in their hierarchy
CREATE POLICY "Pastors can create invitations in their hierarchy"
ON public.invitations
FOR INSERT
WITH CHECK (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- Pastors can delete invitations in their hierarchy
CREATE POLICY "Pastors can delete invitations in their hierarchy"
ON public.invitations
FOR DELETE
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- Public can view valid invitations by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
ON public.invitations
FOR SELECT
USING (used_at IS NULL AND expires_at > now());

-- Function to validate and use an invitation
CREATE OR REPLACE FUNCTION public.use_invitation(_token UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation RECORD;
BEGIN
  -- Get the invitation
  SELECT * INTO _invitation
  FROM public.invitations
  WHERE token = _token
    AND used_at IS NULL
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark invitation as used
  UPDATE public.invitations
  SET used_at = now()
  WHERE id = _invitation.id;
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, church_id, role)
  VALUES (_user_id, _invitation.church_id, _invitation.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;