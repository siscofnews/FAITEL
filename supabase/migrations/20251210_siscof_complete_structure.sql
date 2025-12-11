-- =====================================================================
-- SISCOF - SISTEMA COMPLETO - MIGRATIONS SQL
-- Fase 1: Estrutura Base Completa
-- =====================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- MÓDULO: ESCOLA DE CULTO
-- =====================================================================

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'Bíblica', 'Teológica', 'Ministério', 'Discipulado'
  duration_hours INTEGER,
  image_url TEXT,
  thumbnail_url TEXT,
  level TEXT DEFAULT 'Básico', -- 'Básico', 'Intermediário', 'Avançado'
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_courses_church ON courses(church_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);

-- Tabela de Módulos (dentro de um curso)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Conteúdo escrito da aula
  video_url TEXT,
  video_duration_minutes INTEGER,
  materials_url TEXT[], -- URLs de PDFs, slides, etc
  materials_json JSONB, -- Metadados dos materiais { name, url, type, size }
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false, -- Aula grátis para preview
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- Tabela de Turmas (Classes)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id), -- Pode ser NULL para turmas globais
  professor_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  schedule TEXT, -- Ex: "Terças e Quintas 19h-21h"
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  auto_approve_enrollments BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_course ON classes(course_id);
CREATE INDEX IF NOT EXISTS idx_classes_professor ON classes(professor_id);

-- Tabela de Matrículas (Enrollments)
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'active', 'completed', 'cancelled'
  enrollment_date TIMESTAMP DEFAULT now(),
  approved_date TIMESTAMP,
  completion_date TIMESTAMP,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  final_grade DECIMAL(5,2),
  certificate_issued BOOLEAN DEFAULT false,
  notes TEXT, -- Observações do professor
  UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- =====================================================================
-- MÓDULO: AVALIAÇÕES
-- =====================================================================

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id), -- Pode ser específica para uma turma
  type TEXT NOT NULL, -- 'quiz', 'essay', 'assignment', 'self_evaluation'
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  passing_grade DECIMAL(5,2) DEFAULT 70.00,
  total_points DECIMAL(5,2),
  time_limit_minutes INTEGER, -- NULL = sem limite
  max_attempts INTEGER DEFAULT 1,
  show_correct_answers BOOLEAN DEFAULT false, -- Mostrar gabarito após tentar
  randomize_questions BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  due_date TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_lesson ON evaluations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_class ON evaluations(class_id);

-- Tabela de Questões
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  type TEXT NOT NULL, -- 'multiple_choice', 'true_false', 'essay', 'fill_blank'
  options JSONB, -- Para múltipla escolha: [{"id": "a", "text": "...", "is_correct": true}, ...]
  correct_answer TEXT, -- Resposta correta para autocorreção
  points DECIMAL(5,2) DEFAULT 1.00,
  explanation TEXT, -- Explicação da resposta correta
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_evaluation ON questions(evaluation_id);

-- Tabela de Tentativas de Avaliação
CREATE TABLE IF NOT EXISTS evaluation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  time_spent_minutes INTEGER,
  grade DECIMAL(5,2),
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'graded'
  UNIQUE(evaluation_id, enrollment_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_attempts_evaluation ON evaluation_attempts(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_attempts_enrollment ON evaluation_attempts(enrollment_id);

-- Tabela de Respostas dos Alunos
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_file_url TEXT, -- Para upload de arquivos
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  feedback TEXT, -- Feedback do professor
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_attempt ON student_answers(attempt_id);

-- =====================================================================
-- MÓDULO: CERTIFICADOS
-- =====================================================================

-- Tabela de Certificados
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL, -- Número sequencial
  qr_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  church_name TEXT NOT NULL,
  duration_hours INTEGER,
  final_grade DECIMAL(5,2),
  issued_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  template_id TEXT DEFAULT 'default', -- Para futuros templates personalizados
  is_valid BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP,
  revoked_reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_enrollment ON certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_certificates_qr ON certificates(qr_code);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);

-- =====================================================================
-- MÓDULO: FINANCEIRO
-- =====================================================================

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'SISCOF Start', 'SISCOF Ministerial', 'SISCOF Convenção'
  slug TEXT UNIQUE NOT NULL, -- 'start', 'ministerial', 'convencao'
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB, -- {"cells": "unlimited", "certificates": true, ...}
  max_campuses INTEGER, -- NULL = ilimitado
  max_students INTEGER,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, order_index)
VALUES 
  ('SISCOF Start', 'start', 30.00, 300.00, 
   '{"cells": "unlimited", "escola_culto": true, "escalas": true, "qr_attendance": true}', 1),
  ('SISCOF Ministerial', 'ministerial', 49.00, 490.00,
   '{"cells": "unlimited", "escola_culto": true, "escalas": true, "qr_attendance": true, "trilhas_avancadas": true, "biblioteca": true, "certificados_auto": true}', 2),
  ('SISCOF Convenção', 'convencao', 89.00, 890.00,
   '{"cells": "unlimited", "all_features": true, "bi_global": true, "matriz_control": true, "multi_campus": true}', 3)
ON CONFLICT (slug) DO NOTHING;

-- Tabela de Assinaturas (Subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active', -- 'active', 'suspended', 'cancelled', 'expired'
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
  amount DECIMAL(10,2) NOT NULL,
  started_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  last_payment_date TIMESTAMP,
  next_billing_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  suspended_at TIMESTAMP,
  suspension_reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_church ON subscriptions(church_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Tabela de Faturas (Invoices)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
  plan_name TEXT,
  description TEXT,
  issued_date DATE DEFAULT CURRENT_DATE,
  paid_date TIMESTAMP,
  overdue_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_church ON invoices(church_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Tabela de Pagamentos (Payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT, -- 'pix', 'boleto', 'card', 'manual'
  pix_code TEXT,
  pix_qr_code TEXT,
  pix_expiration TIMESTAMP,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'refunded'
  paid_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================================
-- MÓDULO: PRESENÇA E AULAS AO VIVO
-- =====================================================================

-- Tabela de Presença (Attendance)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  attendance_type TEXT, -- 'online', 'presencial', 'qrcode', 'gps'
  check_in_at TIMESTAMP,
  check_out_at TIMESTAMP,
  watch_duration_minutes INTEGER, -- Para aulas online
  location JSONB, -- {lat, lng} para GPS
  qr_code_scanned TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_enrollment ON attendance(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson ON attendance(lesson_id);

-- Tabela de Aulas ao Vivo (Live Sessions)
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT, -- 'youtube', 'zoom', 'webrtc', 'custom'
  live_url TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INTEGER,
  recording_url TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_lesson ON live_sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_class ON live_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled ON live_sessions(scheduled_at);

-- Tabela de Participantes da Live
CREATE TABLE IF NOT EXISTS live_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT now(),
  left_at TIMESTAMP,
  duration_minutes INTEGER,
  UNIQUE(live_session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_live_participants_session ON live_participants(live_session_id);

-- =====================================================================
-- MÓDULO: COMUNICAÇÃO
-- =====================================================================

-- Tabela de Mensagens (Chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID, -- NULL para mensagens de grupo
  class_id UUID REFERENCES classes(id), -- Chat da turma
  cell_id UUID REFERENCES cells(id), -- Chat da célula
  church_id UUID REFERENCES churches(id), -- Chat geral da igreja
  message_text TEXT NOT NULL,
  attachments JSONB, -- [{url, name, type, size}]
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_class ON messages(class_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_assignment', 'grade_posted', 'new_message', 'payment_due', etc
  title TEXT NOT NULL,
  message TEXT,
  link_url TEXT, -- URL para onde o usuário deve ir
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Tabela de Comunicados (Announcements)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id),
  class_id UUID REFERENCES classes(id), -- NULL = comunicado geral
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  target_audience TEXT, -- 'all', 'students', 'professors', 'leaders'
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_church ON announcements(church_id);
CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(class_id);

-- =====================================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================================

-- Função para atualizar progresso da matrícula
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress DECIMAL(5,2);
BEGIN
  -- Contar total de aulas do curso
  SELECT COUNT(l.id) INTO total_lessons
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  JOIN classes c ON m.course_id = c.course_id
  WHERE c.id = NEW.class_id;

  -- Contar aulas concluídas
  SELECT COUNT(a.id) INTO completed_lessons
  FROM attendance a
  WHERE a.enrollment_id = NEW.enrollment_id
  AND a.attended = true;

  -- Calcular progresso
  IF total_lessons > 0 THEN
    new_progress := (completed_lessons::DECIMAL / total_lessons) * 100;
    
    UPDATE enrollments
    SET progress_percentage = new_progress,
        updated_at = now()
    WHERE id = NEW.enrollment_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso ao marcar presença
DROP TRIGGER IF EXISTS trigger_update_progress ON attendance;
CREATE TRIGGER trigger_update_progress
AFTER INSERT OR UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_progress();

-- Função para verificar inadimplência e bloquear igreja
CREATE OR REPLACE FUNCTION check_overdue_subscriptions()
RETURNS void AS $$
BEGIN
  -- Marcar faturas vencidas
  UPDATE invoices
  SET status = 'overdue',
      overdue_days = CURRENT_DATE - due_date
  WHERE status = 'pending'
  AND due_date < CURRENT_DATE;

  -- Suspender igrejas com mais de 33 dias de atraso
  UPDATE subscriptions s
  SET status = 'suspended',
      suspended_at = now(),
      suspension_reason = 'Inadimplência superior a 33 dias'
  FROM invoices i
  WHERE s.id = i.subscription_id
  AND i.status = 'overdue'
  AND i.overdue_days >= 33
  AND s.status = 'active';

  -- Bloquear acesso da igreja
  UPDATE churches c
  SET is_active = false
  FROM subscriptions s
  WHERE c.id = s.church_id
  AND s.status = 'suspended';
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número de certificado
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM certificates;

  RETURN 'CERT-' || LPAD(next_number::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================================

-- Habilitar RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política: Usuário vê apenas cursos de sua igreja
CREATE POLICY courses_select_policy ON courses
FOR SELECT USING (
  church_id IN (
    SELECT church_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Política: Aluno vê apenas suas matrículas
CREATE POLICY enrollment_select_policy ON enrollments
FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'pastor', 'professor')
  )
);

-- Política: Usuário vê apenas certificados próprios
CREATE POLICY certificates_select_policy ON certificates
FOR SELECT USING (
  enrollment_id IN (
    SELECT id FROM enrollments WHERE student_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);

-- =====================================================================
-- VIEWS ÚTEIS
-- =====================================================================

-- View: Cursos com estatísticas
CREATE OR REPLACE VIEW course_stats AS
SELECT 
  c.id,
  c.name,
  c.church_id,
  COUNT(DISTINCT cl.id) as total_classes,
  COUNT(DISTINCT e.id) as total_students,
  AVG(e.progress_percentage) as avg_progress
FROM courses c
LEFT JOIN classes cl ON c.id = cl.course_id
LEFT JOIN enrollments e ON cl.id = e.class_id
GROUP BY c.id;

-- View: Alunos com progresso
CREATE OR REPLACE VIEW student_progress AS
SELECT 
  e.id as enrollment_id,
  e.student_id,
  u.name as student_name,
  c.name as course_name,
  e.progress_percentage,
  e.final_grade,
  e.status,
  e.enrollment_date
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN classes cl ON e.class_id = cl.id
JOIN courses c ON cl.course_id = c.id;

-- =====================================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================================

COMMENT ON TABLE courses IS 'Cursos da Escola de Culto';
COMMENT ON TABLE modules IS 'Módulos dentro dos cursos';
COMMENT ON TABLE lessons IS 'Aulas individuais';
COMMENT ON TABLE classes IS 'Turmas (grupos de alunos fazendo um curso)';
COMMENT ON TABLE enrollments IS 'Matrículas dos alunos nas turmas';
COMMENT ON TABLE evaluations IS 'Avaliações (provas, trabalhos)';
COMMENT ON TABLE certificates IS 'Certificados emitidos';
COMMENT ON TABLE subscriptions IS 'Assinaturas/planos das igrejas';
COMMENT ON TABLE invoices IS 'Faturas mensais';
COMMENT ON TABLE payments IS 'Pagamentos realizados';
COMMENT ON TABLE attendance IS 'Presença nas aulas';
COMMENT ON TABLE live_sessions IS 'Aulas ao vivo agendadas';

-- =====================================================================
-- FIM DAS MIGRATIONS
-- =====================================================================
