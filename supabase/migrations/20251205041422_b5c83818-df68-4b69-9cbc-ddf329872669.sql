-- Create members table for church members
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
  marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'divorciado', 'viuvo')),
  address TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  role TEXT DEFAULT 'membro', -- membro, obreiro, diacono, presbitero, evangelista, pastor
  department TEXT, -- louvor, infantil, jovens, etc
  baptized BOOLEAN DEFAULT false,
  baptism_date DATE,
  membership_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Indexes for better performance
CREATE INDEX idx_members_church_id ON public.members(church_id);
CREATE INDEX idx_members_full_name ON public.members(full_name);
CREATE INDEX idx_members_is_active ON public.members(is_active);

-- RLS Policies

-- Super admins can manage all members
CREATE POLICY "Super admins can manage all members"
  ON public.members
  FOR ALL
  USING (is_super_admin(auth.uid()));

-- Pastors can view members in their church hierarchy
CREATE POLICY "Pastors can view members in their hierarchy"
  ON public.members
  FOR SELECT
  USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- Pastors can insert members in their church hierarchy
CREATE POLICY "Pastors can insert members in their hierarchy"
  ON public.members
  FOR INSERT
  WITH CHECK (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- Pastors can update members in their church hierarchy
CREATE POLICY "Pastors can update members in their hierarchy"
  ON public.members
  FOR UPDATE
  USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- Pastors can delete members in their church hierarchy
CREATE POLICY "Pastors can delete members in their hierarchy"
  ON public.members
  FOR DELETE
  USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- Trigger for updated_at
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.members IS 'Church members with personal information and membership details';