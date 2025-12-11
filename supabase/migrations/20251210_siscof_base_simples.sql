-- =====================================================================
-- SISCOF - ESTRUTURA BASE SIMPLIFICADA (SEM ERROS)
-- Apenas tabelas, sem triggers complexos
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- ESCOLA DE CULTO
-- =====================================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_hours INTEGER,
  image_url TEXT,
  level TEXT DEFAULT 'Básico',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration_minutes INTEGER,
  materials_json JSONB,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID,
  professor_id UUID,
  professor_name TEXT,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  schedule TEXT,
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID,
  student_id UUID,
  student_name TEXT,
  status TEXT DEFAULT 'pending',
  enrollment_date TIMESTAMP DEFAULT now(),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  final_grade DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================================
-- AVALIAÇÕES
-- =====================================================================

CREATE TABLE IF NOT EXISTS course_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'quiz', 'essay', 'assignment'
  passing_grade DECIMAL(5,2) DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluation_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID,
  question_text TEXT NOT NULL,
  type TEXT, -- 'multiple_choice', 'essay'
  options JSONB,
  correct_answer TEXT,
  points DECIMAL(5,2) DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID,
  student_id UUID,
  question_id UUID,
  answer_text TEXT,
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================================
-- CERTIFICADOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS student_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID,
  certificate_number TEXT UNIQUE,
  qr_code TEXT UNIQUE,
  student_name TEXT,
  course_name TEXT,
  final_grade DECIMAL(5,2),
  issued_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================================
-- FINANCEIRO
-- =====================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Inserir planos padrão (usa ON CONFLICT para evitar duplicatas)
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features)
VALUES 
  ('SISCOF Start', 'start', 30.00, 300.00, 
   '{"cells": "unlimited", "escola_culto": true}'::jsonb),
  ('SISCOF Ministerial', 'ministerial', 49.00, 490.00,
   '{"cells": "unlimited", "escola_culto": true, "certificados": true}'::jsonb),
  ('SISCOF Convenção', 'convencao', 89.00, 890.00,
   '{"all_features": true, "bi_global": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS church_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID,
  plan_id UUID,
  status TEXT DEFAULT 'active',
  amount DECIMAL(10,2),
  next_billing_date DATE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS church_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID,
  invoice_number TEXT UNIQUE,
  amount DECIMAL(10,2),
  due_date DATE,
  status TEXT DEFAULT 'pending',
  overdue_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID,
  amount DECIMAL(10,2),
  payment_method TEXT, -- 'pix', 'boleto', 'card'
  pix_code TEXT,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================================
-- PRESENÇA E LIVES
-- =====================================================================

CREATE TABLE IF NOT EXISTS lesson_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID,
  lesson_id UUID,
  attended BOOLEAN DEFAULT false,
  attendance_type TEXT, -- 'online', 'presencial', 'qrcode'
  check_in_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID,
  title TEXT NOT NULL,
  platform TEXT, -- 'youtube', 'zoom'
  live_url TEXT,
  scheduled_at TIMESTAMP,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================================
-- ÍNDICES (para performance)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_courses_church ON courses(church_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_classes_course ON course_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_class ON course_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_church_invoices_church ON church_invoices(church_id);
CREATE INDEX IF NOT EXISTS idx_church_invoices_status ON church_invoices(status);

-- =====================================================================
-- COMENTÁRIOS
-- =====================================================================

COMMENT ON TABLE courses IS 'Cursos da Escola de Culto';
COMMENT ON TABLE course_modules IS 'Módulos dos cursos';
COMMENT ON TABLE course_lessons IS 'Aulas (vídeos, materiais)';
COMMENT ON TABLE course_classes IS 'Turmas';
COMMENT ON TABLE course_enrollments IS 'Matrículas dos alunos';
COMMENT ON TABLE course_evaluations IS 'Avaliações/Provas';
COMMENT ON TABLE student_certificates IS 'Certificados emitidos';
COMMENT ON TABLE subscription_plans IS 'Planos SISCOF';
COMMENT ON TABLE church_invoices IS 'Faturas mensais';

-- FIM
