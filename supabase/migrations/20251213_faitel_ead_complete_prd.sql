-- ============================================
-- MIGRATION: Sistema EAD FAITEL Completo (Baseado no PRD)
-- Data: 2025-12-13
-- Descrição: Implementação completa conforme PRD oficial
-- ============================================

-- ============================================
-- PARTE 1: AJUSTES NAS TABELAS EXISTENTES
-- ============================================

-- Ajustar tabela courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 0;

-- Renomear course_modules para subjects (Matérias)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_modules') THEN
    ALTER TABLE course_modules RENAME TO subjects;
  END IF;
END $$;

-- Ajustar tabela lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS requires_100_percent BOOLEAN DEFAULT true;

-- ============================================
-- PARTE 2: NOVAS TABELAS
-- ============================================

-- Materiais da Aula (PDFs, Word, PowerPoint, etc.)
CREATE TABLE IF NOT EXISTS lesson_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  material_type TEXT CHECK (material_type IN ('pdf', 'word', 'powerpoint', 'excel', 'text', 'notes')),
  title TEXT NOT NULL,
  file_url TEXT,
  text_content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progresso de Vídeo (Tracking detalhado)
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  total_duration_seconds INTEGER NOT NULL,
  watched_seconds INTEGER DEFAULT 0,
  percentage_watched DECIMAL(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_position_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Banco de Questões
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false')) NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  explanation TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Opções de Questões
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Simulados Automáticos
CREATE TABLE IF NOT EXISTS simulados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  trigger_after_lesson_number INTEGER NOT NULL,
  total_questions INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tentativas de Simulado
CREATE TABLE IF NOT EXISTS simulado_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  simulado_id UUID REFERENCES simulados(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_questions INTEGER,
  correct_answers INTEGER,
  percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Respostas do Simulado
CREATE TABLE IF NOT EXISTS simulado_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES simulado_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id),
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- Provas Finais
CREATE TABLE IF NOT EXISTS final_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE UNIQUE,
  total_questions INTEGER DEFAULT 10,
  passing_percentage DECIMAL(5,2) DEFAULT 70.00,
  max_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tentativas de Prova Final
CREATE TABLE IF NOT EXISTS final_exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  final_exam_id UUID REFERENCES final_exams(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number <= 3),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  total_questions INTEGER DEFAULT 10,
  correct_answers INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, final_exam_id, attempt_number)
);

-- Respostas da Prova Final
CREATE TABLE IF NOT EXISTS final_exam_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES final_exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id),
  selected_option_id UUID REFERENCES question_options(id),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- Status Financeiro do Aluno
CREATE TABLE IF NOT EXISTS student_financial_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) UNIQUE,
  enrollment_fee_paid BOOLEAN DEFAULT false,
  enrollment_fee_paid_at TIMESTAMPTZ,
  enrollment_fee_amount DECIMAL(10,2),
  last_payment_date TIMESTAMPTZ,
  next_payment_due DATE,
  monthly_fee_amount DECIMAL(10,2),
  is_blocked BOOLEAN DEFAULT false,
  blocked_at TIMESTAMPTZ,
  days_overdue INTEGER DEFAULT 0,
  total_paid DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Log de Desbloqueios (Auditoria)
CREATE TABLE IF NOT EXISTS access_unlock_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id),
  student_name TEXT,
  unblocked_by UUID REFERENCES auth.users(id),
  unblocked_by_name TEXT,
  unblocked_by_role TEXT CHECK (unblocked_by_role IN ('chanceler', 'diretor')),
  reason TEXT,
  days_overdue INTEGER,
  amount_owed DECIMAL(10,2),
  blocked_at TIMESTAMPTZ,
  unblocked_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PARTE 3: FUNÇÕES DE LÓGICA DE NEGÓCIO
-- ============================================

-- Função: Verificar se aula está liberada
CREATE OR REPLACE FUNCTION is_lesson_unlocked(
  p_enrollment_id UUID,
  p_lesson_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_previous_lesson_id UUID;
  v_previous_completed BOOLEAN;
  v_order_index INTEGER;
BEGIN
  -- Pegar ordem da aula atual
  SELECT order_index INTO v_order_index
  FROM lessons
  WHERE id = p_lesson_id;
  
  -- Se é a primeira aula (ordem 1), está liberada
  IF v_order_index = 1 OR v_order_index = 0 THEN
    RETURN true;
  END IF;
  
  -- Pegar a aula anterior
  SELECT id INTO v_previous_lesson_id
  FROM lessons
  WHERE module_id = (SELECT module_id FROM lessons WHERE id = p_lesson_id)
  AND order_index = v_order_index - 1;
  
  -- Se não há aula anterior, está liberada
  IF v_previous_lesson_id IS NULL THEN
    RETURN true;
  END IF;
  
  -- Verificar se a aula anterior foi 100% concluída (vídeo assistido)
  SELECT vp.completed INTO v_previous_completed
  FROM video_progress vp
  WHERE vp.enrollment_id = p_enrollment_id
  AND vp.lesson_id = v_previous_lesson_id
  AND vp.percentage_watched >= 100;
  
  RETURN COALESCE(v_previous_completed, false);
END;
$$ LANGUAGE plpgsql;

-- Função: Verificar se matéria está concluída
CREATE OR REPLACE FUNCTION is_subject_completed(
  p_enrollment_id UUID,
  p_subject_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_all_lessons_completed BOOLEAN;
  v_final_exam_passed BOOLEAN;
BEGIN
  -- Verificar se TODAS as aulas foram 100% concluídas
  SELECT COALESCE(bool_and(vp.completed AND vp.percentage_watched >= 100), false) 
  INTO v_all_lessons_completed
  FROM lessons l
  LEFT JOIN video_progress vp ON vp.lesson_id = l.id AND vp.enrollment_id = p_enrollment_id
  WHERE l.module_id = p_subject_id;
  
  -- Verificar se passou na prova final (mínimo 70%)
  SELECT COALESCE(bool_or(fea.passed AND fea.percentage >= 70), false) 
  INTO v_final_exam_passed
  FROM final_exams fe
  LEFT JOIN final_exam_attempts fea ON fea.final_exam_id = fe.id AND fea.enrollment_id = p_enrollment_id
  WHERE fe.subject_id = p_subject_id;
  
  RETURN v_all_lessons_completed AND v_final_exam_passed;
END;
$$ LANGUAGE plpgsql;

-- Função: Verificar se simulado deve ser liberado
CREATE OR REPLACE FUNCTION check_simulado_trigger(
  p_enrollment_id UUID,
  p_subject_id UUID
) RETURNS UUID AS $$
DECLARE
  v_lessons_completed INTEGER;
  v_simulado_id UUID;
BEGIN
  -- Contar quantas aulas foram 100% concluídas nesta matéria
  SELECT COUNT(*) INTO v_lessons_completed
  FROM video_progress vp
  INNER JOIN lessons l ON l.id = vp.lesson_id
  WHERE vp.enrollment_id = p_enrollment_id
  AND l.module_id = p_subject_id
  AND vp.completed = true
  AND vp.percentage_watched >= 100;
  
  -- A cada 3 aulas, retornar o simulado disponível
  IF v_lessons_completed % 3 = 0 AND v_lessons_completed > 0 THEN
    SELECT id INTO v_simulado_id
    FROM simulados
    WHERE subject_id = p_subject_id
    AND trigger_after_lesson_number = v_lessons_completed
    AND is_active = true;
    
    RETURN v_simulado_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função: Verificar bloqueio financeiro
CREATE OR REPLACE FUNCTION is_financially_blocked(
  p_enrollment_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_enrollment_fee_paid BOOLEAN;
  v_days_overdue INTEGER;
  v_is_blocked BOOLEAN;
BEGIN
  SELECT 
    enrollment_fee_paid,
    days_overdue,
    is_blocked
  INTO 
    v_enrollment_fee_paid,
    v_days_overdue,
    v_is_blocked
  FROM student_financial_status
  WHERE enrollment_id = p_enrollment_id;
  
  -- Se não pagou matrícula, está bloqueado
  IF NOT COALESCE(v_enrollment_fee_paid, false) THEN
    RETURN true;
  END IF;
  
  -- Se passou 35 dias sem pagamento, bloquear automaticamente
  IF COALESCE(v_days_overdue, 0) >= 35 THEN
    UPDATE student_financial_status
    SET is_blocked = true, 
        blocked_at = COALESCE(blocked_at, now()),
        updated_at = now()
    WHERE enrollment_id = p_enrollment_id;
    RETURN true;
  END IF;
  
  RETURN COALESCE(v_is_blocked, false);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTE 4: TRIGGERS AUTOMÁTICOS
-- ============================================

-- Trigger: Atualizar dias de atraso automaticamente
CREATE OR REPLACE FUNCTION update_days_overdue()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_overdue := GREATEST(0, CURRENT_DATE - NEW.next_payment_due::date);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_days_overdue ON student_financial_status;
CREATE TRIGGER trigger_update_days_overdue
  BEFORE UPDATE ON student_financial_status
  FOR EACH ROW
  EXECUTE FUNCTION update_days_overdue();

-- Trigger: Criar status financeiro ao matricular
CREATE OR REPLACE FUNCTION create_financial_status_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  v_enrollment_fee DECIMAL(10,2);
  v_monthly_fee DECIMAL(10,2);
BEGIN
  -- Buscar valores do curso
  SELECT enrollment_fee, monthly_fee INTO v_enrollment_fee, v_monthly_fee
  FROM courses
  WHERE id = NEW.course_id;
  
  -- Criar registro de status financeiro
  INSERT INTO student_financial_status (
    enrollment_id,
    enrollment_fee_amount,
    monthly_fee_amount,
    next_payment_due
  ) VALUES (
    NEW.id,
    v_enrollment_fee,
    v_monthly_fee,
    CURRENT_DATE + INTERVAL '30 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_financial_status ON enrollments;
CREATE TRIGGER trigger_create_financial_status
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_financial_status_on_enrollment();

-- ============================================
-- PARTE 5: ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_video_progress_enrollment ON video_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_lesson ON video_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON question_bank(subject_id);
CREATE INDEX IF NOT EXISTS idx_simulados_subject ON simulados(subject_id);
CREATE INDEX IF NOT EXISTS idx_final_exams_subject ON final_exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_financial_enrollment ON student_financial_status(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_student_financial_blocked ON student_financial_status(is_blocked);

-- ============================================
-- PARTE 6: RLS POLICIES
-- ============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_financial_status ENABLE ROW LEVEL SECURITY;

-- Políticas para video_progress (aluno pode ver/atualizar seu próprio progresso)
DROP POLICY IF EXISTS "Students manage own video progress" ON video_progress;
CREATE POLICY "Students manage own video progress"
  ON video_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE id = video_progress.enrollment_id
      AND user_id = auth.uid()
    )
  );

-- Políticas para question_bank (apenas admins/professores)
DROP POLICY IF EXISTS "Admins manage question bank" ON question_bank;
CREATE POLICY "Admins manage question bank"
  ON question_bank FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'teacher', 'admin_polo')
    )
  );

-- Políticas para student_financial_status
DROP POLICY IF EXISTS "Students view own financial status" ON student_financial_status;
CREATE POLICY "Students view own financial status"
  ON student_financial_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE id = student_financial_status.enrollment_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage financial status" ON student_financial_status;
CREATE POLICY "Admins manage financial status"
  ON student_financial_status FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'chanceler', 'diretor')
    )
  );

-- ============================================
-- CONCLUÍDO
-- ============================================
-- Sistema EAD FAITEL completo conforme PRD!
-- Total de tabelas criadas: 14
-- Total de funções: 4
-- Total de triggers: 2
