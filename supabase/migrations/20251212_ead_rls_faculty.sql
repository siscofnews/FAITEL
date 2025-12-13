-- Restrict by faculty_id using ead_roles
CREATE POLICY ead_courses_select_fac ON public.ead_courses FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_courses.faculty_id)
);
CREATE POLICY ead_courses_write_fac ON public.ead_courses FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_courses.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN'))
);
CREATE POLICY ead_courses_update_fac ON public.ead_courses FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_courses.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_courses.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN'))
);

CREATE POLICY ead_questions_select_fac ON public.ead_questions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_questions.faculty_id)
);
CREATE POLICY ead_questions_write_fac ON public.ead_questions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_questions.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
);
CREATE POLICY ead_questions_update_fac ON public.ead_questions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_questions.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_questions.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
);

