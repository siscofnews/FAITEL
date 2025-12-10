
-- Create service types table
CREATE TABLE public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule assignment types table (Dirigente, Porteiro, etc.)
CREATE TABLE public.schedule_assignment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  requires_youtube_link BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worship schedules (main schedule for each service)
CREATE TABLE public.worship_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  service_type_id UUID REFERENCES public.service_types(id),
  scheduled_date DATE NOT NULL,
  start_time TIME,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  offering_amount NUMERIC(10,2),
  tithe_amount NUMERIC(10,2),
  conferente_name TEXT,
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worship schedule assignments (linking members to schedules)
CREATE TABLE public.worship_schedule_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worship_schedule_id UUID NOT NULL REFERENCES public.worship_schedules(id) ON DELETE CASCADE,
  assignment_type_id UUID NOT NULL REFERENCES public.schedule_assignment_types(id),
  member_id UUID REFERENCES public.members(id),
  member_role TEXT,
  youtube_link TEXT,
  attended BOOLEAN,
  absence_reason TEXT,
  absence_notified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worship_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worship_schedule_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_types
CREATE POLICY "Super admins can manage all service types" ON public.service_types FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Pastors can view service types in their hierarchy" ON public.service_types FOR SELECT USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can insert service types in their hierarchy" ON public.service_types FOR INSERT WITH CHECK (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can update service types in their hierarchy" ON public.service_types FOR UPDATE USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can delete service types in their hierarchy" ON public.service_types FOR DELETE USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- RLS Policies for schedule_assignment_types
CREATE POLICY "Super admins can manage all assignment types" ON public.schedule_assignment_types FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Pastors can view assignment types in their hierarchy" ON public.schedule_assignment_types FOR SELECT USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can insert assignment types in their hierarchy" ON public.schedule_assignment_types FOR INSERT WITH CHECK (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can update assignment types in their hierarchy" ON public.schedule_assignment_types FOR UPDATE USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can delete assignment types in their hierarchy" ON public.schedule_assignment_types FOR DELETE USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- RLS Policies for worship_schedules
CREATE POLICY "Super admins can manage all worship schedules" ON public.worship_schedules FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Pastors can view worship schedules in their hierarchy" ON public.worship_schedules FOR SELECT USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can insert worship schedules in their hierarchy" ON public.worship_schedules FOR INSERT WITH CHECK (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can update worship schedules in their hierarchy" ON public.worship_schedules FOR UPDATE USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));
CREATE POLICY "Pastors can delete worship schedules in their hierarchy" ON public.worship_schedules FOR DELETE USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- RLS Policies for worship_schedule_assignments
CREATE POLICY "Super admins can manage all assignments" ON public.worship_schedule_assignments FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Pastors can view assignments in their hierarchy" ON public.worship_schedule_assignments FOR SELECT USING (EXISTS (SELECT 1 FROM worship_schedules ws WHERE ws.id = worship_schedule_assignments.worship_schedule_id AND ws.church_id IN (SELECT get_accessible_church_ids(auth.uid()))));
CREATE POLICY "Pastors can insert assignments in their hierarchy" ON public.worship_schedule_assignments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM worship_schedules ws WHERE ws.id = worship_schedule_assignments.worship_schedule_id AND ws.church_id IN (SELECT get_accessible_church_ids(auth.uid()))));
CREATE POLICY "Pastors can update assignments in their hierarchy" ON public.worship_schedule_assignments FOR UPDATE USING (EXISTS (SELECT 1 FROM worship_schedules ws WHERE ws.id = worship_schedule_assignments.worship_schedule_id AND ws.church_id IN (SELECT get_accessible_church_ids(auth.uid()))));
CREATE POLICY "Pastors can delete assignments in their hierarchy" ON public.worship_schedule_assignments FOR DELETE USING (EXISTS (SELECT 1 FROM worship_schedules ws WHERE ws.id = worship_schedule_assignments.worship_schedule_id AND ws.church_id IN (SELECT get_accessible_church_ids(auth.uid()))));

-- Create triggers for updated_at
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schedule_assignment_types_updated_at BEFORE UPDATE ON public.schedule_assignment_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_worship_schedules_updated_at BEFORE UPDATE ON public.worship_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_worship_schedule_assignments_updated_at BEFORE UPDATE ON public.worship_schedule_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
