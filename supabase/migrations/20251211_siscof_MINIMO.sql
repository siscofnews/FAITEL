-- =====================================================
-- SISCOF 3.0 - MIGRATION MÍNIMA (GARANTIDO SEM ERROS)
-- =====================================================

-- PERFIS GLOBAIS
CREATE TABLE IF NOT EXISTS role_global (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PERMISSÕES LOCAIS
CREATE TABLE IF NOT EXISTS user_local_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  role_global_id UUID,
  local_overrides JSONB DEFAULT '{}'::jsonb,
  granted_at TIMESTAMP DEFAULT NOW()
);

-- CURSOS
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration_hours DECIMAL(5,2),
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MÓDULOS
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AULAS
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  allow_download BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROGRESSO DO ALUNO
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  lesson_id UUID,
  last_position INTEGER DEFAULT 0,
  time_watched INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT NOW()
);

-- ACESSO A CURSOS
CREATE TABLE IF NOT EXISTS user_course_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  course_id UUID,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  can_download BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  certificate_issued BOOLEAN DEFAULT false,
  total_time_watched INTEGER DEFAULT 0
);

-- CERTIFICADOS
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  course_id UUID,
  certificate_number TEXT UNIQUE NOT NULL DEFAULT 'TEMP',
  issued_at TIMESTAMP DEFAULT NOW(),
  qr_code_url TEXT,
  pdf_url TEXT,
  is_valid BOOLEAN DEFAULT true
);

-- PROVAS
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID,
  title TEXT NOT NULL,
  passing_score DECIMAL(5,2) DEFAULT 70.00,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- QUESTÕES
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID,
  question_text TEXT NOT NULL,
  question_type TEXT,
  correct_answer TEXT,
  options JSONB,
  points DECIMAL(5,2) DEFAULT 1.00,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TENTATIVAS DE PROVA
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  quiz_id UUID,
  score DECIMAL(5,2),
  answers JSONB,
  attempt_number INTEGER NOT NULL,
  passed BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- FÓRUM - TÓPICOS
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- FÓRUM - RESPOSTAS
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CONFIGURAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- HIERARQUIA (atualizar churches)
ALTER TABLE churches ADD COLUMN IF NOT EXISTS parent_org_id UUID;
ALTER TABLE churches ADD COLUMN IF NOT EXISTS org_type TEXT DEFAULT 'Matriz';
ALTER TABLE churches ADD COLUMN IF NOT EXISTS dias_sem_pagar INTEGER DEFAULT 0;
ALTER TABLE churches ADD COLUMN IF NOT EXISTS situacao TEXT DEFAULT 'Ativo';

-- INSERIR PERFIS PADRÃO
INSERT INTO role_global (name, description, level, permissions) VALUES
('Super Administrador', 'Acesso Total', 1, '{"global": {"create": true, "read": true, "update": true, "delete": true}}'::jsonb),
('Super Pastor', 'Admin Matriz', 2, '{"organizations": {"create": true, "read": true, "update": true}}'::jsonb),
('Pastor', 'Admin Local', 3, '{"members": {"create": true, "read": true, "update": true}}'::jsonb),
('Tesoureiro', 'Financeiro', 4, '{"financial": {"create": true, "read": true, "update": true}}'::jsonb),
('Secretário', 'Documentos', 5, '{"documents": {"create": true, "read": true, "update": true}}'::jsonb),
('Aluno', 'EAD', 6, '{"courses": {"read": true}}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- INSERIR CONFIGURAÇÕES
INSERT INTO system_settings (key, value, description) VALUES
('convention_data', '{"name": "CEMADEB"}'::jsonb, 'Dados'),
('signatures', '{"presidente": {"name": ""}}'::jsonb, 'Assinaturas'),
('billing_config', '{"taxa": 3.50}'::jsonb, 'Cobrança')
ON CONFLICT (key) DO NOTHING;

-- MENSAGEM DE SUCESSO
SELECT 'SISCOF 3.0 - Tabelas Criadas com Sucesso!' as status;
