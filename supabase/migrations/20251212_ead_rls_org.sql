CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF((auth.jwt() ->> 'org_id'), '')::uuid;
$$;

ALTER TABLE public.ead_modules ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.ead_enrollments ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.ead_exams ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.ead_progress ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.ead_attendance ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE public.ead_exam_results ADD COLUMN IF NOT EXISTS org_id UUID;

CREATE POLICY ead_modules_select_org ON public.ead_modules FOR SELECT TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_modules_write_org ON public.ead_modules FOR INSERT TO authenticated WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_modules_update_org ON public.ead_modules FOR UPDATE TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id()) WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());

CREATE POLICY ead_enrollments_select_org ON public.ead_enrollments FOR SELECT TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_enrollments_write_org ON public.ead_enrollments FOR INSERT TO authenticated WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_enrollments_update_org ON public.ead_enrollments FOR UPDATE TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id()) WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());

CREATE POLICY ead_exams_select_org ON public.ead_exams FOR SELECT TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_exams_write_org ON public.ead_exams FOR INSERT TO authenticated WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_exams_update_org ON public.ead_exams FOR UPDATE TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id()) WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());

CREATE POLICY ead_progress_select_org ON public.ead_progress FOR SELECT TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_progress_write_org ON public.ead_progress FOR INSERT TO authenticated WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_progress_update_org ON public.ead_progress FOR UPDATE TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id()) WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());

CREATE POLICY ead_attendance_select_org ON public.ead_attendance FOR SELECT TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_attendance_write_org ON public.ead_attendance FOR INSERT TO authenticated WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_attendance_update_org ON public.ead_attendance FOR UPDATE TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id()) WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());

CREATE POLICY ead_exam_results_select_org ON public.ead_exam_results FOR SELECT TO authenticated USING (org_id IS NULL OR org_id = public.current_org_id());
CREATE POLICY ead_exam_results_write_org ON public.ead_exam_results FOR INSERT TO authenticated WITH CHECK (org_id IS NULL OR org_id = public.current_org_id());

