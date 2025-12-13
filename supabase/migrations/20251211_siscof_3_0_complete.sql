-- =====================================================
-- SISCOF 3.0 - MIGRATION COMPLETA
-- Sistema de Gestão Multi-Organizacional com Dual RBAC
-- =====================================================

-- =====================================================
-- PARTE 1: SISTEMA DE PERMISSÕES (DUAL RBAC)
-- =====================================================

-- Perfis Globais (criados pelo Dono do Sistema)
CREATE TABLE IF NOT EXISTS role_global (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER NOT NULL, -- 1=Global, 2.0=Matriz, 2.1+=Local
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissões Locais (overrides por usuário/organização)
CREATE TABLE IF NOT EXISTS user_local_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  org_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  role_global_id UUID REFERENCES role_global(id),
  local_overrides JSONB DEFAULT '{}'::jsonb,
  granted_by UUID REFERENCES members(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- =====================================================
-- PARTE 2: HIERARQUIA ORGANIZACIONAL
-- =====================================================

-- Atualizar tabela churches com hierarquia
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS parent_org_id UUID REFERENCES churches(id),
ADD COLUMN IF NOT EXISTS org_type TEXT DEFAULT 'Matriz' CHECK (org_type IN ('Matriz', 'Sede', 'Subsede', 'Congregação', 'Célula')),
ADD COLUMN IF NOT EXISTS dias_sem_pagar INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS situacao TEXT DEFAULT 'Ativo' CHECK (situacao IN ('Ativo', 'Bloqueado Inadimplência', 'Suspenso'));

-- =====================================================
-- PARTE 3: MÓDULO EAD (FAITEL)
-- =====================================================

-- 3.1 Cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration_hours DECIMAL(5,2),
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3.2 Módulos
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3.3 Aulas
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'pdf', 'document', 'html', 'text')),
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  allow_download BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3.4 Provas/Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score DECIMAL(5,2) DEFAULT 70.00,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3.5 Questões das Provas
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')),
  correct_answer TEXT,
  options JSONB, -- Para múltipla escolha
  points DECIMAL(5,2) DEFAULT 1.00,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3.6 Progresso do Aluno
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  last_position INTEGER DEFAULT 0,
  time_watched INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 3.7 Acesso a Cursos (Matrículas)
CREATE TABLE IF NOT EXISTS user_course_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  can_download BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  certificate_issued BOOLEAN DEFAULT false,
  total_time_watched INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- 3.8 Tentativas de Prova
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  answers JSONB,
  attempt_number INTEGER NOT NULL,
  passed BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- 3.9 Certificados
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  qr_code_url TEXT,
  pdf_url TEXT,
  is_valid BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES members(id)
);

-- =====================================================
-- PARTE 4: FÓRUM DE DISCUSSÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PARTE 5: CONFIGURAÇÕES DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES members(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, description) VALUES
('convention_data', '{
  "name": "CEMADEB",
  "cnpj": "",
  "address": "",
  "city": "",
  "state": "",
  "phone": ""
}'::jsonb, 'Dados da Convenção'),
('signatures', '{
  "primeiro_tesoureiro": {"name": "", "title": "Primeiro Tesoureiro"},
  "presidente_cemadeb": {"name": "", "title": "Presidente CEMADEB"}
}'::jsonb, 'Assinaturas Oficiais'),
('billing_config', '{
  "taxa_boleto": 3.50,
  "email_cobranca": "financeiro@cemadeb.com.br",
  "dias_vencimento": 33
}'::jsonb, 'Configurações de Cobrança')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PARTE 6: FUNÇÕES E TRIGGERS
-- =====================================================

-- 6.1 Função para calcular permissões efetivas
CREATE OR REPLACE FUNCTION get_effective_permissions(
  p_user_id UUID,
  p_org_id UUID
) RETURNS JSONB AS $$
DECLARE
  global_perms JSONB;
  local_perms JSONB;
  effective JSONB;
BEGIN
  -- Buscar permissões globais
  SELECT rg.permissions INTO global_perms
  FROM user_local_permissions ulp
  JOIN role_global rg ON ulp.role_global_id = rg.id
  WHERE ulp.user_id = p_user_id AND ulp.org_id = p_org_id
  LIMIT 1;
  
  -- Buscar overrides locais
  SELECT local_overrides INTO local_perms
  FROM user_local_permissions
  WHERE user_id = p_user_id AND org_id = p_org_id;
  
  -- Merge (local pode apenas restringir, não expandir)
  effective := COALESCE(global_perms, '{}'::jsonb);
  
  RETURN effective;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.2 Função para verificar inadimplência
CREATE OR REPLACE FUNCTION check_payment_status() RETURNS void AS $$
BEGIN
  UPDATE churches
  SET situacao = 'Bloqueado Inadimplência'
  WHERE dias_sem_pagar > 33 AND situacao = 'Ativo';
END;
$$ LANGUAGE plpgsql;

-- 6.3 Função para gerar número de certificado
CREATE OR REPLACE FUNCTION generate_certificate_number() RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'SISCOF';
  year TEXT := TO_CHAR(NOW(), 'YYYY');
  sequence_num TEXT;
  cert_number TEXT;
BEGIN
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_num
  FROM certificates
  WHERE EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM NOW());
  
  cert_number := prefix || '-' || year || '-' || sequence_num;
  RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- 6.4 Trigger para auto-gerar número de certificado
CREATE OR REPLACE FUNCTION set_certificate_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := generate_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_certificate
BEFORE INSERT ON certificates
FOR EACH ROW
EXECUTE FUNCTION set_certificate_number();

-- =====================================================
-- PARTE 7: ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_local_perms_user ON user_local_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_local_perms_org ON user_local_permissions(org_id);
CREATE INDEX IF NOT EXISTS idx_churches_parent ON churches(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_churches_situacao ON churches(situacao);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_course_access_user ON user_course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_forum_topics_lesson ON forum_topics(lesson_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id);

-- =====================================================
-- PARTE 8: PERFIS GLOBAIS PADRÃO
-- =====================================================

-- Inserir perfis padrão
INSERT INTO role_global (name, description, level, permissions) VALUES
('Super Administrador', 'Dono do Sistema - Acesso Total', 1, '{
  "global": {"create": true, "read": true, "update": true, "delete": true},
  "organizations": {"create": true, "read": true, "update": true, "delete": true},
  "users": {"create": true, "read": true, "update": true, "delete": true},
  "courses": {"create": true, "read": true, "update": true, "delete": true},
  "financial": {"create": true, "read": true, "update": true, "delete": true}
}'::jsonb),
('Super Pastor da Matriz', 'Administrador da Matriz e Unidades Subordinadas', 2.0, '{
  "organizations": {"create": true, "read": true, "update": true, "delete": false},
  "users": {"create": true, "read": true, "update": true, "delete": false},
  "courses": {"create": false, "read": true, "update": false, "delete": false},
  "members": {"create": true, "read": true, "update": true, "delete": true}
}'::jsonb),
('Pastor de Sede', 'Administrador de Sede e Unidades Subordinadas', 2.1, '{
  "organizations": {"create": true, "read": true, "update": true, "delete": false},
  "users": {"create": true, "read": true, "update": true, "delete": false},
  "members": {"create": true, "read": true, "update": true, "delete": false}
}'::jsonb),
('Primeiro Tesoureiro', 'Gestão Financeira', 3, '{
  "financial": {"create": true, "read": true, "update": true, "delete": false},
  "reports": {"create": false, "read": true, "update": false, "delete": false}
}'::jsonb),
('Secretário', 'Gestão de Membros e Documentos', 3, '{
  "members": {"create": true, "read": true, "update": true, "delete": false},
  "documents": {"create": true, "read": true, "update": true, "delete": false}
}'::jsonb),
('Aluno', 'Acesso a Cursos EAD', 4, '{
  "courses": {"create": false, "read": true, "update": false, "delete": false},
  "forum": {"create": true, "read": true, "update": true, "delete": false}
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PRONTO! ✅
-- =====================================================
SELECT 'SISCOF 3.0 - Migration Completa Aplicada com Sucesso!' as status;
