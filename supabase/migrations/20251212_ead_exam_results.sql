CREATE TABLE IF NOT EXISTS public.ead_exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.ead_exams(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.ead_enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.ead_modules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  attempt INTEGER DEFAULT 1,
  score NUMERIC(4,2) DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ead_exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY ead_exam_results_select ON public.ead_exam_results FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_exam_results_insert ON public.ead_exam_results FOR INSERT TO authenticated WITH CHECK (true);

