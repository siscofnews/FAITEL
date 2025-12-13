CREATE TABLE IF NOT EXISTS public.ead_payment_links (
  payment_id UUID PRIMARY KEY,
  enrollment_id UUID REFERENCES public.ead_enrollments(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.ead_courses(id) ON DELETE CASCADE,
  polo_id UUID REFERENCES public.college_polo(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ead_payment_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY ead_payment_links_read ON public.ead_payment_links FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_payment_links_write ON public.ead_payment_links FOR INSERT TO authenticated WITH CHECK (true);

