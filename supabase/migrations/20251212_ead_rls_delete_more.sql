CREATE POLICY ead_questions_delete_fac_org ON public.ead_questions FOR DELETE TO authenticated USING (
  (public.ead_questions.org_id IS NULL OR public.ead_questions.org_id = public.current_org_id())
  AND EXISTS (
    SELECT 1 FROM public.ead_roles r
    WHERE r.user_id = auth.uid() AND r.faculty_id = public.ead_questions.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN','PROFESSOR')
  )
);

CREATE POLICY ead_exam_results_delete_fac_org ON public.ead_exam_results FOR DELETE TO authenticated USING (
  (public.ead_exam_results.org_id IS NULL OR public.ead_exam_results.org_id = public.current_org_id())
  AND EXISTS (
    SELECT 1 FROM public.ead_enrollments e JOIN public.ead_courses c ON c.id = e.course_id
    WHERE e.id = public.ead_exam_results.enrollment_id
      AND EXISTS (SELECT 1 FROM public.ead_roles r WHERE r.user_id = auth.uid() AND r.faculty_id = c.faculty_id AND r.role IN ('SUPER_ADMIN','FACULDADE_ADMIN'))
  )
);

