CREATE TYPE public.ead_question_level AS ENUM ('basico','intermediario','avancado');
CREATE TYPE public.ead_question_type AS ENUM ('multipla_escolha','verdadeiro_falso','alternativa_unica','alternativa_multipla','discursiva');

CREATE TABLE IF NOT EXISTS public.ead_professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  faculty_id UUID NOT NULL REFERENCES public.college_matriz(id) ON DELETE CASCADE,
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, faculty_id)
);

CREATE TABLE IF NOT EXISTS public.ead_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','FACULDADE_ADMIN','DIRETOR_POLO','PROFESSOR','ALUNO')),
  faculty_id UUID REFERENCES public.college_matriz(id),
  polo_id UUID REFERENCES public.college_polo(id),
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ead_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES public.college_matriz(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  carga_horaria INTEGER,
  categoria TEXT CHECK (categoria IN ('teologico','academico','livre','extensao')),
  valor NUMERIC(14,2) DEFAULT 0,
  forma_pagamento TEXT,
  modules_count INTEGER DEFAULT 0,
  professor_id UUID REFERENCES public.ead_professors(id),
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ead_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.ead_courses(id) ON DELETE CASCADE,
  index_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  content_url TEXT,
  video_url TEXT,
  required_quiz BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, index_order)
);

CREATE TABLE IF NOT EXISTS public.ead_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES public.college_matriz(id) ON DELETE CASCADE,
  area TEXT,
  disciplina TEXT,
  nivel public.ead_question_level NOT NULL,
  tipo public.ead_question_type NOT NULL,
  enunciado TEXT NOT NULL,
  opcoes JSONB,
  resposta JSONB,
  ativa BOOLEAN DEFAULT true,
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ead_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.ead_modules(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.ead_professors(id),
  num_questoes INTEGER NOT NULL,
  peso_por_questao NUMERIC(6,2) DEFAULT 1,
  tempo_minutos INTEGER DEFAULT 30,
  tentativas_permitidas INTEGER DEFAULT 1,
  nota_maxima NUMERIC(4,2) DEFAULT 10,
  nota_aprovacao NUMERIC(4,2) DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ead_exam_questions (
  exam_id UUID NOT NULL REFERENCES public.ead_exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.ead_questions(id) ON DELETE RESTRICT,
  peso NUMERIC(6,2) DEFAULT 1,
  PRIMARY KEY (exam_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.ead_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.ead_courses(id) ON DELETE CASCADE,
  polo_id UUID REFERENCES public.college_polo(id),
  status TEXT DEFAULT 'ativo',
  termo_aceite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ead_terms_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.ead_enrollments(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  accepted BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.ead_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.ead_enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.ead_modules(id) ON DELETE CASCADE,
  score NUMERIC(4,2) DEFAULT 0,
  status TEXT DEFAULT 'pendente',
  attempts INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  last_attempt_at TIMESTAMPTZ,
  UNIQUE(enrollment_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.ead_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.ead_enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.ead_modules(id) ON DELETE CASCADE,
  time_watched_seconds INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  UNIQUE(enrollment_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.ead_locale_preferences (
  user_id UUID PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ead_professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ead_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY ead_select_all ON public.ead_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY ead_insert_admin ON public.ead_courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ead_update_admin ON public.ead_courses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

