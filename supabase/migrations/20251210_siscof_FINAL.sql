-- =====================================================================
-- SISCOF - TABELAS ESSENCIAIS (VERSÃO FINAL SIMPLIFICADA)
-- Apenas criação de tabelas, sem inserção automática de dados
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ESCOLA DE CULTO

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

-- AVALIAÇÕES

CREATE TABLE IF NOT EXISTS course_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  passing_grade DECIMAL(5,2) DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluation_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID,
  question_text TEXT NOT NULL,
  type TEXT,
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

-- CERTIFICADOS

CREATE TABLE IF NOT EXISTS student_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID,
  certificate_number TEXT,
  qr_code TEXT,
  student_name TEXT,
  course_name TEXT,
  final_grade DECIMAL(5,2),
  issued_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- FINANCEIRO

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

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
  invoice_number TEXT,
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
  payment_method TEXT,
  pix_code TEXT,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- PRESENÇA E LIVES

CREATE TABLE IF NOT EXISTS lesson_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID,
  lesson_id UUID,
  attended BOOLEAN DEFAULT false,
  attendance_type TEXT,
  check_in_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID,
  title TEXT NOT NULL,
  platform TEXT,
  live_url TEXT,
  scheduled_at TIMESTAMP,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT now()
);

-- ÍNDICES

CREATE INDEX IF NOT EXISTS idx_courses_church ON courses(church_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_classes_course ON course_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_class ON course_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_church_invoices_church ON church_invoices(church_id);

-- FIM
