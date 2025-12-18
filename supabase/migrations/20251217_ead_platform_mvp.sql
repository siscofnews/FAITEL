-- =====================================================
-- PLATAFORMA EAD FAITEL - FASE 1 MVP
-- Sistema Completo de Ensino a Distância
-- =====================================================

-- EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PERFIS E USUÁRIOS EAD
-- =====================================================

-- Tabela de perfis/roles EAD
CREATE TABLE IF NOT EXISTS ead_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'coordenador', 'professor', 'aluno', 'avaliador')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS ead_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nome_completo TEXT NOT NULL,
    foto_url TEXT,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    data_nascimento DATE,
    cpf TEXT UNIQUE,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de professores
CREATE TABLE IF NOT EXISTS ead_professors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nome_completo TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    especialidade TEXT,
    biografia TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ESTRUTURA HIERÁRQUICA INSTITUCIONAL
-- =====================================================

-- Faculdades (Matriz)
CREATE TABLE IF NOT EXISTS ead_faculdades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia TEXT NOT NULL,
    razao_social TEXT,
    cnpj TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    diretor_nome TEXT NOT NULL,
    diretor_email TEXT,
    logo_url TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    site TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Polos (ligados à Faculdade)
CREATE TABLE IF NOT EXISTS ead_polos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculdade_id UUID REFERENCES ead_faculdades(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    codigo TEXT UNIQUE,
    email TEXT NOT NULL,
    telefone TEXT,
    diretor_nome TEXT NOT NULL,
    diretor_email TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Núcleos (ligados ao Polo)
CREATE TABLE IF NOT EXISTS ead_nucleos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    polo_id UUID REFERENCES ead_polos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    codigo TEXT UNIQUE,
    email TEXT NOT NULL,
    telefone TEXT,
    diretor_nome TEXT NOT NULL,
    diretor_email TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CURSOS (MELHORANDO TABELA EXISTENTE)
-- =====================================================

-- Adicionar campos à tabela courses existente
ALTER TABLE courses ADD COLUMN IF NOT EXISTS codigo TEXT UNIQUE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS carga_horaria INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS modalidade TEXT DEFAULT 'EAD' CHECK (modalidade IN ('EAD', 'Híbrido', 'Presencial'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS nivel TEXT CHECK (nivel IN ('Livre', 'Técnico', 'Graduação', 'Teológico', 'Pós-Graduação'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS publico_alvo TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pre_requisitos TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificacao_tipo TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificacao_validade INTEGER; -- meses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'rascunho'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS professor_responsavel_id UUID REFERENCES ead_professors(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instituicao_id UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instituicao_tipo TEXT CHECK (instituicao_tipo IN ('faculdade', 'polo', 'nucleo'));

-- =====================================================
-- 4. MÓDULOS (MELHORANDO TABELA EXISTENTE)
-- =====================================================

ALTER TABLE modules ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 1;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS carga_horaria INTEGER; -- horas
ALTER TABLE modules ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES ead_professors(id);
ALTER TABLE modules ADD COLUMN IF NOT EXISTS data_liberacao DATE;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS data_encerramento DATE;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS criterio_conclusao TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS percentual_minimo INTEGER DEFAULT 70; -- % para aprovação

-- =====================================================
-- 5. AULAS (MELHORANDO TABELA EXISTENTE)
-- =====================================================

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 1;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tempo_estimado INTEGER; -- minutos
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tipo_aula TEXT DEFAULT 'gravada' CHECK (tipo_aula IN ('gravada', 'ao_vivo', 'texto', 'mista'));
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS status_liberacao TEXT DEFAULT 'liberada' CHECK (status_liberacao IN ('liberada', 'bloqueada', 'agendada'));
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS data_liberacao TIMESTAMPTZ;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS permite_download BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 6. CONTEÚDOS DAS AULAS
-- =====================================================

CREATE TABLE IF NOT EXISTS ead_lesson_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('video_upload', 'video_embed', 'pdf', 'documento', 'texto', 'link')),
    titulo TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 1,
    -- Vídeos
    video_url TEXT,
    video_provider TEXT CHECK (video_provider IN ('youtube', 'vimeo', 'upload', 'google_drive')),
    duracao_segundos INTEGER,
    permite_download BOOLEAN DEFAULT FALSE,
    controla_velocidade BOOLEAN DEFAULT TRUE,
    -- Documentos
    arquivo_url TEXT,
    arquivo_nome TEXT,
    arquivo_tipo TEXT,
    arquivo_tamanho BIGINT, -- bytes
    -- Texto
    conteudo_html TEXT,
    -- Controle
    obrigatorio BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. MATRÍCULAS E PROGRESSO
-- =====================================================

-- Matrículas
CREATE TABLE IF NOT EXISTS ead_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES ead_students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    instituicao_id UUID NOT NULL,
    instituicao_tipo TEXT NOT NULL CHECK (instituicao_tipo IN ('faculdade', 'polo', 'nucleo')),
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'cancelada', 'trancada')),
    data_matricula TIMESTAMPTZ DEFAULT NOW(),
    data_conclusao TIMESTAMPTZ,
    data_cancelamento TIMESTAMPTZ,
    progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
    nota_final DECIMAL(5,2),
    observacoes TEXT,
    UNIQUE(student_id, course_id)
);

-- Progresso nas aulas
CREATE TABLE IF NOT EXISTS ead_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES ead_students(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES ead_enrollments(id) ON DELETE CASCADE,
    concluida BOOLEAN DEFAULT FALSE,
    tempo_assistido INTEGER DEFAULT 0, -- segundos
    ultima_posicao INTEGER DEFAULT 0, -- segundos no vídeo
    tentativas INTEGER DEFAULT 0,
    data_inicio TIMESTAMPTZ,
    data_conclusao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- Progresso nos módulos
CREATE TABLE IF NOT EXISTS ead_module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES ead_students(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES ead_enrollments(id) ON DELETE CASCADE,
    concluido BOOLEAN DEFAULT FALSE,
    progresso_percentual INTEGER DEFAULT 0,
    data_inicio TIMESTAMPTZ,
    data_conclusao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, module_id)
);

-- =====================================================
-- 8. AVALIAÇÕES E PROVAS
-- =====================================================

-- Avaliações
CREATE TABLE IF NOT EXISTS ead_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('objetiva', 'discursiva', 'trabalho', 'mista')),
    ordem INTEGER DEFAULT 1,
    tempo_limite INTEGER, -- minutos
    tentativas_permitidas INTEGER DEFAULT 1,
    nota_minima DECIMAL(5,2) DEFAULT 7.0,
    peso DECIMAL(5,2) DEFAULT 1.0,
    randomizar_questoes BOOLEAN DEFAULT FALSE,
    mostrar_gabarito BOOLEAN DEFAULT FALSE,
    bloqueia_avanco BOOLEAN DEFAULT TRUE,
    data_liberacao TIMESTAMPTZ,
    data_encerramento TIMESTAMPTZ,
    status TEXT DEFAULT 'ativa' CHECK (status IN ('rascunho', 'ativa', 'encerrada')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questões
CREATE TABLE IF NOT EXISTS ead_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES ead_assessments(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('multipla_escolha', 'verdadeiro_falso', 'dissertativa', 'associacao')),
    enunciado TEXT NOT NULL,
    explicacao TEXT, -- feedback após resposta
    ordem INTEGER DEFAULT 1,
    pontos DECIMAL(5,2) DEFAULT 1.0,
    obrigatoria BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alternativas (para questões objetivas)
CREATE TABLE IF NOT EXISTS ead_question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES ead_questions(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Respostas dos alunos
CREATE TABLE IF NOT EXISTS ead_student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES ead_students(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES ead_assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES ead_questions(id) ON DELETE CASCADE,
    tentativa INTEGER DEFAULT 1,
    -- Para objetiva
    option_id UUID REFERENCES ead_question_options(id),
    -- Para discursiva
    resposta_texto TEXT,
    -- Para trabalho
    arquivo_url TEXT,
    arquivo_nome TEXT,
    -- Avaliação
    correta BOOLEAN,
    pontos_obtidos DECIMAL(5,2),
    nota DECIMAL(5,2),
    feedback TEXT,
    avaliado_por UUID REFERENCES ead_professors(id),
    data_avaliacao TIMESTAMPTZ,
    respondido_em TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resultado das avaliações
CREATE TABLE IF NOT EXISTS ead_assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES ead_students(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES ead_assessments(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES ead_enrollments(id) ON DELETE CASCADE,
    tentativa INTEGER DEFAULT 1,
    nota DECIMAL(5,2),
    pontos_total DECIMAL(5,2),
    pontos_obtidos DECIMAL(5,2),
    percentual DECIMAL(5,2),
    aprovado BOOLEAN DEFAULT FALSE,
    tempo_gasto INTEGER, -- minutos
    data_inicio TIMESTAMPTZ,
    data_conclusao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. CERTIFICADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS ead_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES ead_students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES ead_enrollments(id) ON DELETE CASCADE,
    numero_registro TEXT UNIQUE NOT NULL,
    codigo_validacao TEXT UNIQUE NOT NULL,
    data_conclusao DATE NOT NULL,
    data_emissao DATE DEFAULT CURRENT_DATE,
    carga_horaria INTEGER,
    nota_final DECIMAL(5,2),
    qr_code_url TEXT,
    pdf_url TEXT,
    assinatura_diretor TEXT,
    assinatura_coordenador TEXT,
    observacoes TEXT,
    valido BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular progresso do curso
CREATE OR REPLACE FUNCTION calculate_course_progress(p_student_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress INTEGER;
BEGIN
    -- Contar total de aulas do curso
    SELECT COUNT(DISTINCT l.id) INTO total_lessons
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.course_id = p_course_id;
    
    -- Contar aulas concluídas pelo aluno
    SELECT COUNT(DISTINCT lp.lesson_id) INTO completed_lessons
    FROM ead_lesson_progress lp
    JOIN lessons l ON lp.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    WHERE lp.student_id = p_student_id
      AND m.course_id = p_course_id
      AND lp.concluida = TRUE;
    
    -- Calcular percentual
    IF total_lessons > 0 THEN
        progress := ROUND((completed_lessons::DECIMAL / total_lessons) * 100);
    ELSE
        progress := 0;
    END IF;
    
    -- Atualizar na tabela de matrículas
    UPDATE ead_enrollments
    SET progresso_percentual = progress,
        updated_at = NOW()
    WHERE student_id = p_student_id AND course_id = p_course_id;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso automaticamente
CREATE OR REPLACE FUNCTION update_progress_on_lesson_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.concluida = TRUE AND (OLD.concluida IS NULL OR OLD.concluida = FALSE) THEN
        PERFORM calculate_course_progress(
            NEW.student_id,
            (SELECT m.course_id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE l.id = NEW.lesson_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress
AFTER UPDATE ON ead_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_progress_on_lesson_complete();

-- =====================================================
-- 11. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE ead_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead_professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead_student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ead_certificates ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (alunos veem seus próprios dados)
CREATE POLICY "Students can view own data" ON ead_students
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can view own enrollments" ON ead_enrollments
    FOR SELECT USING (student_id IN (SELECT id FROM ead_students WHERE user_id = auth.uid()));

CREATE POLICY "Students can view own progress" ON ead_lesson_progress
    FOR SELECT USING (student_id IN (SELECT id FROM ead_students WHERE user_id = auth.uid()));

-- Professores veem alunos dos seus cursos
CREATE POLICY "Professors can view their students" ON ead_students
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT e.student_id
            FROM ead_enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE c.professor_responsavel_id IN (SELECT id FROM ead_professors WHERE user_id = auth.uid())
        )
    );

-- =====================================================
-- 12. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON ead_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON ead_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON ead_lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON ead_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_student ON ead_student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_assessment ON ead_student_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON ead_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_courses_instituicao ON courses(instituicao_id, instituicao_tipo);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

COMMENT ON TABLE ead_students IS 'Alunos da plataforma EAD';
COMMENT ON TABLE ead_professors IS 'Professores e tutores';
COMMENT ON TABLE ead_faculdades IS 'Instituições de ensino (matriz)';
COMMENT ON TABLE ead_polos IS 'Polos de ensino';
COMMENT ON TABLE ead_nucleos IS 'Núcleos ligados aos polos';
COMMENT ON TABLE ead_enrollments IS 'Matrículas dos alunos em cursos';
COMMENT ON TABLE ead_lesson_progress IS 'Progresso individual nas aulas';
COMMENT ON TABLE ead_assessments IS 'Avaliações e provas';
COMMENT ON TABLE ead_certificates IS 'Certificados emitidos';
