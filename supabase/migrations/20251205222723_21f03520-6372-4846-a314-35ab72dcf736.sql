
-- Add RLS policies for public read access to worship schedules (only closed/published ones)
CREATE POLICY "Public can view closed worship schedules" 
ON public.worship_schedules 
FOR SELECT 
USING (status = 'closed' OR status = 'open');

-- Add RLS policy for public read access to schedule assignments
CREATE POLICY "Public can view schedule assignments" 
ON public.worship_schedule_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM worship_schedules ws 
    WHERE ws.id = worship_schedule_assignments.worship_schedule_id
  )
);

-- Add RLS policy for public read access to service types
CREATE POLICY "Public can view service types" 
ON public.service_types 
FOR SELECT 
USING (is_active = true);

-- Add RLS policy for public read access to assignment types
CREATE POLICY "Public can view assignment types" 
ON public.schedule_assignment_types 
FOR SELECT 
USING (is_active = true);

-- Add RLS policy for public read access to members (only name for schedules)
CREATE POLICY "Public can view member names for schedules" 
ON public.members 
FOR SELECT 
USING (is_active = true);
