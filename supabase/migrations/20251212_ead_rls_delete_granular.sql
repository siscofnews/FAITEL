CREATE POLICY ead_modules_delete_fac_org ON public.ead_modules FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_modules.course_id
      AND (public.ead_modules.org_id IS NULL OR public.ead_modules.org_id = public.current_org_id())
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
);

CREATE POLICY ead_exams_delete_fac_org ON public.ead_exams FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_modules m JOIN public.ead_courses c ON c.id = m.course_id
    WHERE m.id = public.ead_exams.module_id
      AND (public.ead_exams.org_id IS NULL OR public.ead_exams.org_id = public.current_org_id())
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR'))
  )
);

CREATE POLICY ead_enrollments_delete_fac_org ON public.ead_enrollments FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.ead_courses c
    WHERE c.id = public.ead_enrollments.course_id
      AND (public.ead_enrollments.org_id IS NULL OR public.ead_enrollments.org_id = public.current_org_id())
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO'))
  )
);

