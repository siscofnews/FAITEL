-- Advanced RLS using ead_roles
CREATE OR REPLACE VIEW public.ead_user_roles AS
  SELECT user_id, role FROM public.ead_roles;

-- Courses
DROP POLICY IF EXISTS ead_select_all ON public.ead_courses;
CREATE POLICY ead_courses_select ON public.ead_courses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid()));
CREATE POLICY ead_courses_insert ON public.ead_courses FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN')));
CREATE POLICY ead_courses_update ON public.ead_courses FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN'))) WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN')));

-- Modules
CREATE POLICY ead_modules_select ON public.ead_modules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid()));
CREATE POLICY ead_modules_write ON public.ead_modules FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR')));
CREATE POLICY ead_modules_update ON public.ead_modules FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))) WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR')));

-- Questions
CREATE POLICY ead_questions_select ON public.ead_questions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid()));
CREATE POLICY ead_questions_write ON public.ead_questions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR')));
CREATE POLICY ead_questions_update ON public.ead_questions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))) WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR')));

-- Exams
CREATE POLICY ead_exams_select ON public.ead_exams FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_exams_write ON public.ead_exams FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR')));
CREATE POLICY ead_exams_update ON public.ead_exams FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))) WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR')));

-- Enrollments
CREATE POLICY ead_enrollments_select ON public.ead_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_enrollments_write ON public.ead_enrollments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO')));
CREATE POLICY ead_enrollments_update ON public.ead_enrollments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO'))) WITH CHECK (EXISTS (SELECT 1 FROM public.ead_user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO')));

-- Progress
CREATE POLICY ead_progress_select ON public.ead_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_progress_write ON public.ead_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ead_progress_update ON public.ead_progress FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Attendance
CREATE POLICY ead_attendance_select ON public.ead_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_attendance_write ON public.ead_attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ead_attendance_update ON public.ead_attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Exam Results
CREATE POLICY ead_exam_results_select_policy ON public.ead_exam_results FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_exam_results_insert_policy ON public.ead_exam_results FOR INSERT TO authenticated WITH CHECK (true);

