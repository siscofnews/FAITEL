-- ============================================
-- MIGRATION: Estrutura de Cursos FAITEL
-- Data: 2025-12-13
-- Descrição: Cria estrutura completa de cursos EAD da FAITEL
-- ============================================

-- 1. Verificar e criar tabela de instituições EAD (Matriz, Polos, Núcleos)
CREATE TABLE IF NOT EXISTS public.ead_institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  institution_type TEXT CHECK (institution_type IN ('matriz', 'polo', 'nucleo')),
  parent_id UUID REFERENCES ead_institutions(id),
  logo_url TEXT,
  video_url TEXT,
  address JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Garantir que a tabela courses existe com todos os campos necessários
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER,
  level TEXT CHECK (level IN ('basic', 'intermediate', 'undergraduate', 'postgraduate')),
  institution_id UUID REFERENCES ead_institutions(id),
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Garantir que a tabela course_modules existe
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Garantir que a tabela lessons existe
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  pdf_url TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Garantir que a tabela enrollments existe
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  institution_id UUID REFERENCES ead_institutions(id),
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled', 'suspended')) DEFAULT 'active',
  completion_percentage INTEGER DEFAULT 0,
  certificate_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Garantir que a tabela lesson_progress existe
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  watch_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- 7. Tabela de biblioteca digital
CREATE TABLE IF NOT EXISTS public.library_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  cycle TEXT CHECK (cycle IN ('ciclo_i', 'ciclo_ii', 'especializacao')),
  subject TEXT,
  pdf_url TEXT NOT NULL,
  cover_image_url TEXT,
  requires_enrollment BOOLEAN DEFAULT true,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE ead_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;

-- Políticas para courses (todos podem ver cursos ativos)
DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;
CREATE POLICY "Anyone can view active courses"
  ON courses FOR SELECT
  USING (is_active = true);

-- Admins e professores podem gerenciar cursos
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin_polo', 'teacher')
    )
  );

-- Políticas para lessons (apenas alunos matriculados)
DROP POLICY IF EXISTS "Students can view enrolled lessons" ON lessons;
CREATE POLICY "Students can view enrolled lessons"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      INNER JOIN course_modules cm ON cm.course_id = e.course_id
      WHERE cm.id = lessons.module_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
    )
  );

-- Professores podem gerenciar aulas
DROP POLICY IF EXISTS "Teachers can manage lessons" ON lessons;
CREATE POLICY "Teachers can manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin_polo', 'teacher')
    )
  );

-- Políticas para enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;
CREATE POLICY "Admins can manage enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin_polo')
    )
  );

-- Políticas para lesson_progress
DROP POLICY IF EXISTS "Users can manage own progress" ON lesson_progress;
CREATE POLICY "Users can manage own progress"
  ON lesson_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE id = lesson_progress.enrollment_id
      AND user_id = auth.uid()
    )
  );

-- Políticas para library_books
DROP POLICY IF EXISTS "Anyone can view books" ON library_books;
CREATE POLICY "Anyone can view books"
  ON library_books FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage books" ON library_books;
CREATE POLICY "Admins can manage books"
  ON library_books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin_polo')
    )
  );

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courses_institution ON courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_library_books_cycle ON library_books(cycle);

-- ============================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_ead_institutions_updated_at ON ead_institutions;
CREATE TRIGGER update_ead_institutions_updated_at BEFORE UPDATE ON ead_institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_modules_updated_at ON course_modules;
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONCLUÍDO
-- ============================================
-- Estrutura de banco de dados EAD criada com sucesso!
-- Próximo passo: Executar FAITEL_COURSES_STRUCTURE.sql para popular os cursos
