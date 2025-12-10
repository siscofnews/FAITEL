-- Create table for church hierarchy movement history
CREATE TABLE public.church_movement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  church_name TEXT NOT NULL,
  previous_parent_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  previous_parent_name TEXT,
  new_parent_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  new_parent_name TEXT NOT NULL,
  moved_by UUID NOT NULL,
  moved_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.church_movement_history ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all history
CREATE POLICY "Super admins can manage all movement history"
ON public.church_movement_history
FOR ALL
USING (is_super_admin(auth.uid()));

-- Pastors can view history of churches in their hierarchy
CREATE POLICY "Pastors can view movement history in their hierarchy"
ON public.church_movement_history
FOR SELECT
USING (
  church_id IN (SELECT get_accessible_church_ids(auth.uid()))
  OR new_parent_id IN (SELECT get_accessible_church_ids(auth.uid()))
);

-- Super admins can insert movement history
CREATE POLICY "Super admins can insert movement history"
ON public.church_movement_history
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));