-- Create liturgical functions table
CREATE TABLE public.liturgical_functions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'weekly', 'biweekly', 'monthly'
  recurrence_day_of_week INTEGER, -- 0-6 for Sunday-Saturday
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table (the actual assignments)
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  function_id UUID NOT NULL REFERENCES public.liturgical_functions(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_id, function_id, scheduled_date)
);

-- Enable RLS
ALTER TABLE public.liturgical_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- RLS for liturgical_functions
CREATE POLICY "Super admins can manage all functions"
ON public.liturgical_functions FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Pastors can view functions in their hierarchy"
ON public.liturgical_functions FOR SELECT
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

CREATE POLICY "Pastors can insert functions in their hierarchy"
ON public.liturgical_functions FOR INSERT
WITH CHECK (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

CREATE POLICY "Pastors can update functions in their hierarchy"
ON public.liturgical_functions FOR UPDATE
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

CREATE POLICY "Pastors can delete functions in their hierarchy"
ON public.liturgical_functions FOR DELETE
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- RLS for events
CREATE POLICY "Super admins can manage all events"
ON public.events FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Pastors can view events in their hierarchy"
ON public.events FOR SELECT
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

CREATE POLICY "Pastors can insert events in their hierarchy"
ON public.events FOR INSERT
WITH CHECK (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

CREATE POLICY "Pastors can update events in their hierarchy"
ON public.events FOR UPDATE
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

CREATE POLICY "Pastors can delete events in their hierarchy"
ON public.events FOR DELETE
USING (church_id IN (SELECT get_accessible_church_ids(auth.uid())));

-- RLS for schedules (need to check via event's church_id)
CREATE POLICY "Super admins can manage all schedules"
ON public.schedules FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Pastors can view schedules in their hierarchy"
ON public.schedules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND e.church_id IN (SELECT get_accessible_church_ids(auth.uid()))
  )
);

CREATE POLICY "Pastors can insert schedules in their hierarchy"
ON public.schedules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND e.church_id IN (SELECT get_accessible_church_ids(auth.uid()))
  )
);

CREATE POLICY "Pastors can update schedules in their hierarchy"
ON public.schedules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND e.church_id IN (SELECT get_accessible_church_ids(auth.uid()))
  )
);

CREATE POLICY "Pastors can delete schedules in their hierarchy"
ON public.schedules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_id 
    AND e.church_id IN (SELECT get_accessible_church_ids(auth.uid()))
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_liturgical_functions_updated_at
BEFORE UPDATE ON public.liturgical_functions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();