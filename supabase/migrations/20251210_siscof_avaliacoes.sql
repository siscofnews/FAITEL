-- =====================================================
-- SISCOF - SISTEMA DE AVALIAÇÕES E PROVAS - FASE 2
-- Provas, Questões, Respostas e Correção Automática
-- Data: 2025-12-10
-- =====================================================

-- =========================
-- 1. AVALIAÇÕES
-- =========================

CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.course_modules(id),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('quiz', 'exam', 'assignment', 'auto_evaluation')),
    total_points DECIMAL(5,2) DEFAULT 100,
    passing_grade DECIMAL(5,2) DEFAULT 70,
    due_date TIMESTAMPTZ,
    time_limit_minutes INTEGER, -- null = sem limite
    max_attempts INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT false,
    shuffle_questions BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 2. QUESTÕES
-- =========================

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'essay', 'short_answer')),
    points DECIMAL(5,2) NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    explanation TEXT, -- Explicação da resposta correta
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 3. ALTERNATIVAS (QUESTÕES OBJETIVAS)
-- =========================

CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 4. TENTATIVAS DE AVALIAÇÃO
-- =========================

CREATE TABLE IF NOT EXISTS public.evaluation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    score DECIMAL(5,2),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
    time_spent_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1,
    UNIQUE(evaluation_id, student_id, attempt_number)
);

-- =========================
-- 5. RESPOSTAS DOS ALUNOS
-- =========================

CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.evaluation_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id),
    essay_answer TEXT,
    short_answer TEXT,
    points_earned DECIMAL(5,2),
    feedback TEXT, -- Feedback do professor
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- =========================
-- ÍNDICES
-- =========================

CREATE INDEX IF NOT EXISTS idx_evaluations_class ON public.evaluations(class_id);
CREATE INDEX IF NOT EXISTS idx_questions_evaluation ON public.questions(evaluation_id, order_index);
CREATE INDEX IF NOT EXISTS idx_options_question ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_evaluation ON public.evaluation_attempts(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.evaluation_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.student_answers(attempt_id);

-- =========================
-- RLS POLICIES
-- =========================

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- Evaluations
CREATE POLICY "Teachers can manage evaluations" ON public.evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            JOIN public.members m ON m.id = c.teacher_id
            WHERE c.id = evaluations.class_id AND m.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND is_super_admin = true
        )
    );

CREATE POLICY "Students can view published evaluations" ON public.evaluations
    FOR SELECT USING (
        is_published = true AND EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.members m ON m.id = e.student_id
            WHERE e.class_id = evaluations.class_id AND m.user_id = auth.uid()
        )
    );

-- Attempts
CREATE POLICY "Students can manage their attempts" ON public.evaluation_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.members WHERE id = evaluation_attempts.student_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view attempts" ON public.evaluation_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.evaluations ev
            JOIN public.classes c ON c.id = ev.class_id
            JOIN public.members m ON m.id = c.teacher_id
            WHERE ev.id = evaluation_attempts.evaluation_id AND m.user_id = auth.uid()
        )
    );

-- Answers
CREATE POLICY "Students can manage their answers" ON public.student_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.evaluation_attempts ea
            JOIN public.members m ON m.id = ea.student_id
            WHERE ea.id = student_answers.attempt_id AND m.user_id = auth.uid()
        )
    );

-- =========================
-- FUNÇÕES PARA CORREÇÃO AUTOMÁTICA
-- =========================

-- Função para corrigir questões objetivas automaticamente
CREATE OR REPLACE FUNCTION auto_grade_objective_questions(attempt_uuid UUID)
RETURNS VOID AS $$
DECLARE
    answer_record RECORD;
    correct_option_id UUID;
    question_points DECIMAL(5,2);
BEGIN
    -- Para cada resposta do aluno nesta tentativa
    FOR answer_record IN 
        SELECT sa.id, sa.question_id, sa.selected_option_id, q.points
        FROM public.student_answers sa
        JOIN public.questions q ON q.id = sa.question_id
        WHERE sa.attempt_id = attempt_uuid 
        AND q.question_type IN ('multiple_choice', 'true_false')
    LOOP
        -- Buscar a opção correta
        SELECT id, q.points INTO correct_option_id, question_points
        FROM public.question_options qo
        JOIN public.questions q ON q.id = qo.question_id
        WHERE qo.question_id = answer_record.question_id 
        AND qo.is_correct = true
        LIMIT 1;
        
        -- Verificar se a resposta está correta
        IF answer_record.selected_option_id = correct_option_id THEN
            UPDATE public.student_answers
            SET points_earned = answer_record.points,
                is_correct = true
            WHERE id = answer_record.id;
        ELSE
            UPDATE public.student_answers
            SET points_earned = 0,
                is_correct = false
            WHERE id = answer_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular nota final da tentativa
CREATE OR REPLACE FUNCTION calculate_attempt_score(attempt_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_score DECIMAL(5,2);
BEGIN
    -- Somar pontos de todas as respostas
    SELECT COALESCE(SUM(points_earned), 0) INTO total_score
    FROM public.student_answers
    WHERE attempt_id = attempt_uuid;
    
    -- Atualizar o score da tentativa
    UPDATE public.evaluation_attempts
    SET score = total_score,
        status = 'graded'
    WHERE id = attempt_uuid;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para correção automática ao submeter
CREATE OR REPLACE FUNCTION trigger_auto_grade()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'submitted' AND OLD.status = 'in_progress' THEN
        -- Corrigir questões objetivas
        PERFORM auto_grade_objective_questions(NEW.id);
        -- Calcular nota final
        PERFORM calculate_attempt_score(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_evaluation_submitted
    AFTER UPDATE ON public.evaluation_attempts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_grade();

-- =========================
-- VIEW DE NOTAS
-- =========================

CREATE OR REPLACE VIEW student_grades AS
SELECT 
    ea.id as attempt_id,
    ea.evaluation_id,
    ev.title as evaluation_title,
    ea.student_id,
    m.full_name as student_name,
    ea.score,
    ev.total_points,
    ev.passing_grade,
    CASE 
        WHEN ea.score >= ev.passing_grade THEN 'Aprovado'
        ELSE 'Reprovado'
    END as status,
    ea.submitted_at,
    c.name as class_name
FROM public.evaluation_attempts ea
JOIN public.evaluations ev ON ev.id = ea.evaluation_id
JOIN public.members m ON m.id = ea.student_id
JOIN public.classes c ON c.id = ev.class_id
WHERE ea.status = 'graded';

-- =========================
-- DADOS DE EXEMPLO
-- =========================

DO $$
DECLARE
    primeira_turma_id UUID;
    avaliacao_id UUID;
    questao_id UUID;
BEGIN
    -- Pegar primeira turma disponível
    SELECT id INTO primeira_turma_id FROM public.classes LIMIT 1;
    
    IF primeira_turma_id IS NOT NULL THEN
        -- Criar avaliação exemplo
        INSERT INTO public.evaluations (class_id, title, description, type, total_points, passing_grade, is_published)
        VALUES (
            primeira_turma_id,
            'Avaliação - Fundamentos da Fé',
            'Teste seus conhecimentos sobre os fundamentos bíblicos',
            'quiz',
            10,
            7,
            true
        )
        RETURNING id INTO avaliacao_id;
        
        IF avaliacao_id IS NOT NULL THEN
            -- Criar questão múltipla escolha
            INSERT INTO public.questions (evaluation_id, question_text, question_type, points, order_index)
            VALUES (
                avaliacao_id,
                'Quantos livros tem a Bíblia?',
                'multiple_choice',
                2,
                1
            )
            RETURNING id INTO questao_id;
            
            -- Criar alternativas
            IF questao_id IS NOT NULL THEN
                INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
                VALUES 
                    (questao_id, '66 livros', true, 1),
                    (questao_id, '72 livros', false, 2),
                    (questao_id, '50 livros', false, 3),
                    (questao_id, '100 livros', false, 4);
            END IF;
        END IF;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Sistema de Avaliações instalado com sucesso!';
RAISE NOTICE '📝 Tabelas: evaluations, questions, question_options, evaluation_attempts, student_answers';
RAISE NOTICE '🤖 Correção automática ativada!';
