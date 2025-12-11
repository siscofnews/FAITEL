-- =====================================================================
-- SISCOF - SISTEMA COMPLETO - MIGRATIONS SQL (VERSÃO CORRIGIDA)
-- Fase 1: Estrutura Base Completa - SEM CONFLITOS
-- =====================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  created_by UUID, -- Sem REFERENCES para evitar conflito
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_courses_church ON courses(church_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);

-- Tabela de Módulos (dentro de um curso)
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Conteúdo escrito da aula
  video_url TEXT,
  video_duration_minutes INTEGER,
  materials_json JSONB, -- Metadados dos materiais { name, url, type, size }
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false, -- Aula grátis para preview
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id);

-- Tabela de Turmas (Classes)
CREATE TABLE IF NOT EXISTS course_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  campus_id UUID, -- Pode ser NULL para turmas globais, sem REFERENCES
  professor_id UUID, -- SEM REFERENCES para evitar erro
  professor_name TEXT, -- Nome do professor (redundante mas útil)
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

CREATE INDEX IF NOT EXISTS idx_course_classes_course ON course_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_classes_professor ON course_classes(professor_id);

-- Tabela de Matrículas (Enrollments)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES course_classes(id) ON DELETE CASCADE,
  student_id UUID, -- SEM REFERENCES
  student_name TEXT,
  student_email TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'active', 'completed', 'cancelled'
  enrollment_date TIMESTAMP DEFAULT now(),
  approved_date TIMESTAMP,
  completion_date TIMESTAMP,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  final_grade DECIMAL(5,2),
  certificate_issued BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_class ON course_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- =====================================================================
-- MÓDULO: AVALIAÇÕES
-- =====================================================================

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS course_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  class_id UUID REFERENCES course_classes(id), -- Pode ser específica para uma turma
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
  created_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_evaluations_lesson ON course_evaluations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_evaluations_class ON course_evaluations(class_id);

-- Tabela de Questões
CREATE TABLE IF NOT EXISTS evaluation_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID REFERENCES course_evaluations(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  type TEXT NOT NULL, -- 'multiple_choice', 'true_false', 'essay', 'fill_blank'
  options JSONB, -- Para múltipla escolha: [{"id": "a", "text": "...", "is_correct": true}, ...]
  correct_answer TEXT, -- Resposta correta para autocorreção
  points DECIMAL(5,2) DEFAULT 1.00,
  explanation TEXT, -- Explicação da resposta correta
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_questions_evaluation ON evaluation_questions(evaluation_id);

-- Tabela de Tentativas de Avaliação
CREATE TABLE IF NOT EXISTS evaluation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID REFERENCES course_evaluations(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  time_spent_minutes INTEGER,
  grade DECIMAL(5,2),
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'graded'
  UNIQUE(evaluation_id, enrollment_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_evaluation ON evaluation_attempts(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_enrollment ON evaluation_attempts(enrollment_id);

-- Tabela de Respostas dos Alunos
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES evaluation_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_file_url TEXT, -- Para upload de arquivos
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  feedback TEXT, -- Feedback do professor
  graded_by UUID,
  graded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_student_answers_attempt ON student_answers(attempt_id);

-- =====================================================================
-- MÓDULO: CERTIFICADOS
-- =====================================================================

-- Tabela de Certificados
CREATE TABLE IF NOT EXISTS student_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL, -- Número sequencial
  qr_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  church_name TEXT NOT NULL,
  duration_hours INTEGER,
  final_grade DECIMAL(5,2),
  issued_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  template_id TEXT DEFAULT 'default',
  is_valid BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP,
  revoked_reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_certificates_enrollment ON student_certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_qr ON student_certificates(qr_code);
CREATE INDEX IF NOT EXISTS idx_student_certificates_number ON student_certificates(certificate_number);

-- =====================================================================
-- MÓDULO: FINANCEIRO
-- =====================================================================

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB,
  max_campuses INTEGER,
  max_students INTEGER,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- Inserir planos padrão (apenas se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'start') THEN
    INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, order_index)
    VALUES 
      ('SISCOF Start', 'start', 30.00, 300.00, 
       '{"cells": "unlimited", "escola_culto": true, "escalas": true, "qr_attendance": true}'::jsonb, 1),
      ('SISCOF Ministerial', 'ministerial', 49.00, 490.00,
       '{"cells": "unlimited", "escola_culto": true, "escalas": true, "qr_attendance": true, "trilhas_avancadas": true, "biblioteca": true, "certificados_auto": true}'::jsonb, 2),
      ('SISCOF Convenção', 'convencao', 89.00, 890.00,
       '{"cells": "unlimited", "all_features": true, "bi_global": true, "matriz_control": true, "multi_campus": true}'::jsonb, 3);
  END IF;
END $$;

-- Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS church_subscriptions (
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

CREATE INDEX IF NOT EXISTS idx_church_subscriptions_church ON church_subscriptions(church_id);
CREATE INDEX IF NOT EXISTS idx_church_subscriptions_status ON church_subscriptions(status);

-- Tabela de Faturas
CREATE TABLE IF NOT EXISTS church_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES church_subscriptions(id),
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

CREATE INDEX IF NOT EXISTS idx_church_invoices_church ON church_invoices(church_id);
CREATE INDEX IF NOT EXISTS idx_church_invoices_status ON church_invoices(status);
CREATE INDEX IF NOT EXISTS idx_church_invoices_due_date ON church_invoices(due_date);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES church_invoices(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_status ON invoice_payments(status);

-- =====================================================================
-- MÓDULO: PRESENÇA E AULAS AO VIVO
-- =====================================================================

-- Tabela de Presença
CREATE TABLE IF NOT EXISTS lesson_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  attendance_type TEXT, -- 'online', 'presencial', 'qrcode', 'gps'
  check_in_at TIMESTAMP,
  check_out_at TIMESTAMP,
  watch_duration_minutes INTEGER,
  location JSONB, -- {lat, lng}
  qr_code_scanned TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_attendance_enrollment ON lesson_attendance(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attendance_lesson ON lesson_attendance(lesson_id);

-- Tabela de Aulas ao Vivo
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  class_id UUID REFERENCES course_classes(id),
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
  created_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_lesson ON live_sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_class ON live_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled ON live_sessions(scheduled_at);

-- =====================================================================
-- COMENTÁRIOS
-- =====================================================================

COMMENT ON TABLE courses IS 'Cursos da Escola de Culto';
COMMENT ON TABLE course_modules IS 'Módulos dentro dos cursos';
COMMENT ON TABLE course_lessons IS 'Aulas individuais';
COMMENT ON TABLE course_classes IS 'Turmas (grupos de alunos)';
COMMENT ON TABLE course_enrollments IS 'Matrículas dos alunos';
COMMENT ON TABLE course_evaluations IS 'Avaliações (provas, trabalhos)';
COMMENT ON TABLE student_certificates IS 'Certificados emitidos';
COMMENT ON TABLE subscription_plans IS 'Planos SISCOF (Start, Ministerial, Convenção)';
COMMENT ON TABLE church_subscriptions IS 'Assinaturas das igrejas';
COMMENT ON TABLE church_invoices IS 'Faturas mensais';
COMMENT ON TABLE invoice_payments IS 'Pagamentos realizados';
COMMENT ON TABLE lesson_attendance IS 'Presença nas aulas';
COMMENT ON TABLE live_sessions IS 'Aulas ao vivo agendadas';

-- =====================================================================
-- FIM DAS MIGRATIONS
-- =====================================================================
