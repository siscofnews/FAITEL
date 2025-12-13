CREATE POLICY ead_modules_select_fac ON public.ead_modules FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_modules.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id)
  )
);
CREATE POLICY ead_modules_write_fac ON public.ead_modules FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_modules.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
);
CREATE POLICY ead_modules_update_fac ON public.ead_modules FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_modules.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_modules.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
);

CREATE POLICY ead_exams_select_fac ON public.ead_exams FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_modules m JOIN public.ead_courses c ON c.id = m.course_id
    WHERE m.id = public.ead_exams.module_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id)
  )
);
CREATE POLICY ead_exams_write_fac ON public.ead_exams FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ead_modules m JOIN public.ead_courses c ON c.id = m.course_id
    WHERE m.id = public.ead_exams.module_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
);
CREATE POLICY ead_exams_update_fac ON public.ead_exams FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_modules m JOIN public.ead_courses c ON c.id = m.course_id
    WHERE m.id = public.ead_exams.module_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ead_modules m JOIN public.ead_courses c ON c.id = m.course_id
    WHERE m.id = public.ead_exams.module_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
);

CREATE POLICY ead_enrollments_select_fac ON public.ead_enrollments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_enrollments.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id)
  )
);
CREATE POLICY ead_enrollments_write_fac ON public.ead_enrollments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_enrollments.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO'))
  )
);
CREATE POLICY ead_enrollments_update_fac ON public.ead_enrollments FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_enrollments.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO'))
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_enrollments.course_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO'))
  )
);

