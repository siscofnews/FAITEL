-- =====================================================
-- SISCOF - DADOS DE TESTE COMPLETOS
-- Execute no Supabase SQL Editor
-- Cria curso, turma, aulas, avaliações e muito mais!
-- =====================================================

DO $$
DECLARE
    -- IDs que vamos criar
    v_igreja_id UUID;
    v_curso_id UUID;
    v_modulo1_id UUID;
    v_modulo2_id UUID;
    v_aula1_id UUID;
    v_aula2_id UUID;
    v_aula3_id UUID;
    v_turma_id UUID;
    v_avaliacao_id UUID;
    v_questao1_id UUID;
    v_questao2_id UUID;
    v_professor_id UUID;
    v_aluno_id UUID;
    v_matricula_id UUID;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚀 CRIANDO DADOS DE TESTE DO SISCOF';
    RAISE NOTICE '========================================';

    -- 1. PEGAR IGREJA MATRIZ
    SELECT id INTO v_igreja_id 
    FROM public.churches 
    WHERE nivel = 'matriz' 
    LIMIT 1;
    
    IF v_igreja_id IS NULL THEN
        RAISE EXCEPTION '❌ Nenhuma igreja matriz encontrada. Crie uma igreja primeiro.';
    END IF;
    
    RAISE NOTICE '✓ Igreja encontrada: %', v_igreja_id;

    -- 2. BUSCAR OU CRIAR PROFESSOR
    SELECT id INTO v_professor_id
    FROM public.members
    WHERE church_id = v_igreja_id
    LIMIT 1;
    
    IF v_professor_id IS NULL THEN
        -- Criar membro professor de exemplo
        INSERT INTO public.members (
            church_id, full_name, email, role, cargo_eclesiastico, is_active
        ) VALUES (
            v_igreja_id, 'Prof. João Silva', 'professor@exemplo.com', 'Professor', 'pastor', true
        ) RETURNING id INTO v_professor_id;
        RAISE NOTICE '✓ Professor criado';
    ELSE
        RAISE NOTICE '✓ Professor encontrado';
    END IF;

    -- 3. CRIAR ALUNO DE TESTE
    INSERT INTO public.members (
        church_id, full_name, email, role, cargo_eclesiastico, is_active
    ) VALUES (
        v_igreja_id, 'Maria Santos', 'aluna@exemplo.com', 'Membro', 'membro', true
    ) RETURNING id INTO v_aluno_id;
    RAISE NOTICE '✓ Aluno criado';

    -- 4. CRIAR CURSO
    INSERT INTO public.courses (
        church_id,
        name,
        description,
        category,
        duration_hours,
        is_published,
        is_active,
        created_by
    ) VALUES (
        v_igreja_id,
        'Fundamentos da Fé Cristã',
        'Curso completo sobre os pilares do cristianismo, ideal para novos convertidos e membros que desejam aprofundar seus conhecimentos bíblicos.',
        'biblica',
        30,
        true,
        true,
        v_professor_id
    ) RETURNING id INTO v_curso_id;
    
    RAISE NOTICE '✓ Curso criado: %', v_curso_id;

    -- 5. CRIAR MÓDULOS
    INSERT INTO public.course_modules (
        course_id, name, description, order_index, duration_hours
    ) VALUES (
        v_curso_id, 
        'Módulo 1: A Bíblia Sagrada', 
        'Introdução à Palavra de Deus', 
        1, 
        10
    ) RETURNING id INTO v_modulo1_id;

    INSERT INTO public.course_modules (
        course_id, name, description, order_index, duration_hours
    ) VALUES (
        v_curso_id, 
        'Módulo 2: Salvação e Graça', 
        'Entendendo o plano de salvação', 
        2, 
        10
    ) RETURNING id INTO v_modulo2_id;
    
    RAISE NOTICE '✓ 2 Módulos criados';

    -- 6. CRIAR AULAS
    INSERT INTO public.lessons (
        module_id, title, content, lesson_type, order_index, video_duration_seconds
    ) VALUES (
        v_modulo1_id,
        'O que é a Bíblia?',
        'A Bíblia é a Palavra de Deus escrita. Nesta aula vamos aprender sobre sua origem, divisão e importância para nossa vida.',
        'text',
        1,
        0
    ) RETURNING id INTO v_aula1_id;

    INSERT INTO public.lessons (
        module_id, title, content, lesson_type, order_index, video_duration_seconds
    ) VALUES (
        v_modulo1_id,
        'Como estudar a Bíblia',
        'Métodos práticos para um estudo bíblico eficaz.',
        'video',
        2,
        1800
    ) RETURNING id INTO v_aula2_id;

    INSERT INTO public.lessons (
        module_id, title, content, lesson_type, order_index, video_duration_seconds
    ) VALUES (
        v_modulo2_id,
        'O que é salvação?',
        'Entendendo o plano de salvação através de Jesus Cristo.',
        'text',
        1,
        0
    ) RETURNING id INTO v_aula3_id;
    
    RAISE NOTICE '✓ 3 Aulas criadas';

    -- 7. CRIAR TURMA
    INSERT INTO public.classes (
        course_id,
        church_id,
        teacher_id,
        name,
        description,
        start_date,
        end_date,
        max_students,
        status,
        meeting_schedule
    ) VALUES (
        v_curso_id,
        v_igreja_id,
        v_professor_id,
        'Turma Fundamentos 2025.1',
        'Primeira turma do ano de 2025',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '60 days',
        30,
        'active',
        'Terças e Quintas, 19h às 21h'
    ) RETURNING id INTO v_turma_id;
    
    RAISE NOTICE '✓ Turma criada: %', v_turma_id;

    -- 8. MATRICULAR ALUNO
    INSERT INTO public.enrollments (
        class_id,
        student_id,
        status
    ) VALUES (
        v_turma_id,
        v_aluno_id,
        'active'
    ) RETURNING id INTO v_matricula_id;
    
    RAISE NOTICE '✓ Aluno matriculado';

    -- 9. REGISTRAR PROGRESSO (aluno começou a assistir)
    INSERT INTO public.lesson_progress (
        enrollment_id,
        lesson_id,
        completed,
        time_watched_seconds
    ) VALUES (
        v_matricula_id,
        v_aula1_id,
        true,
        0
    );

    INSERT INTO public.lesson_progress (
        enrollment_id,
        lesson_id,
        completed,
        time_watched_seconds
    ) VALUES (
        v_matricula_id,
        v_aula2_id,
        false,
        900
    );
    
    RAISE NOTICE '✓ Progresso registrado (1 aula completa, 1 em andamento)';

    -- 10. CRIAR AVALIAÇÃO
    INSERT INTO public.evaluations (
        class_id,
        title,
        description,
        type,
        total_points,
        passing_grade,
        is_published,
        created_by
    ) VALUES (
        v_turma_id,
        'Avaliação Módulo 1',
        'Teste seus conhecimentos sobre a Bíblia',
        'quiz',
        10,
        7,
        true,
        v_professor_id
    ) RETURNING id INTO v_avaliacao_id;
    
    RAISE NOTICE '✓ Avaliação criada';

    -- 11. CRIAR QUESTÕES
    INSERT INTO public.questions (
        evaluation_id,
        question_text,
        question_type,
        points,
        order_index
    ) VALUES (
        v_avaliacao_id,
        'Quantos livros tem a Bíblia?',
        'multiple_choice',
        5,
        1
    ) RETURNING id INTO v_questao1_id;

    -- Alternativas da questão 1
    INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
    VALUES 
        (v_questao1_id, '66 livros', true, 1),
        (v_questao1_id, '72 livros', false, 2),
        (v_questao1_id, '50 livros', false, 3),
        (v_questao1_id, '100 livros', false, 4);

    INSERT INTO public.questions (
        evaluation_id,
        question_text,
        question_type,
        points,
        order_index
    ) VALUES (
        v_avaliacao_id,
        'A Bíblia é dividida em Antigo e Novo Testamento?',
        'true_false',
        5,
        2
    ) RETURNING id INTO v_questao2_id;

    -- Alternativas da questão 2
    INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
    VALUES 
        (v_questao2_id, 'Verdadeiro', true, 1),
        (v_questao2_id, 'Falso', false, 2);
    
    RAISE NOTICE '✓ 2 Questões criadas (múltipla escolha + verdadeiro/falso)';

    -- 12. CRIAR SALA DE CHAT DA TURMA
    INSERT INTO public.chat_rooms (
        type,
        related_id,
        name,
        description,
        created_by
    ) VALUES (
        'class',
        v_turma_id,
        'Chat - Turma Fundamentos 2025.1',
        'Espaço para tirar dúvidas e interagir',
        v_professor_id
    );
    
    RAISE NOTICE '✓ Chat da turma criado';

    -- 13. ASSINATURA DE TESTE PARA A IGREJA
    INSERT INTO public.church_subscriptions (
        church_id,
        plan_id,
        status,
        billing_cycle,
        next_billing_date
    ) VALUES (
        v_igreja_id,
        (SELECT id FROM public.subscription_plans WHERE plan_type = 'start' LIMIT 1),
        'active',
        'monthly',
        CURRENT_DATE + INTERVAL '30 days'
    );
    
    RAISE NOTICE '✓ Assinatura ativa criada (Plan Start - R$30/mês)';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ DADOS DE TESTE CRIADOS COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📚 RESUMO:';
    RAISE NOTICE '  • 1 Curso: "Fundamentos da Fé Cristã"';
    RAISE NOTICE '  • 2 Módulos';
    RAISE NOTICE '  • 3 Aulas';
    RAISE NOTICE '  • 1 Turma ativa';
    RAISE NOTICE '  • 1 Professor';
    RAISE NOTICE '  • 1 Aluno matriculado';
    RAISE NOTICE '  • 1 Avaliação com 2 questões';
    RAISE NOTICE '  • 1 Chat ativo';
    RAISE NOTICE '  • 1 Assinatura ativa';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRÓXIMO PASSO:';
    RAISE NOTICE '  Execute o script de visualização para ver os dados!';
    RAISE NOTICE '========================================';

END $$;

-- =====================================================
-- VISUALIZAR OS DADOS CRIADOS
-- =====================================================

-- 1. Ver curso criado
SELECT 
    c.name as curso,
    c.category as categoria,
    c.duration_hours as horas,
    COUNT(DISTINCT cm.id) as modulos,
    COUNT(DISTINCT l.id) as aulas,
    ch.nome_fantasia as igreja
FROM public.courses c
LEFT JOIN public.course_modules cm ON cm.course_id = c.id
LEFT JOIN public.lessons l ON l.module_id = cm.id
LEFT JOIN public.churches ch ON ch.id = c.church_id
WHERE c.name = 'Fundamentos da Fé Cristã'
GROUP BY c.id, c.name, c.category, c.duration_hours, ch.nome_fantasia;

-- 2. Ver turma criada
SELECT 
    cl.name as turma,
    c.name as curso,
    m.full_name as professor,
    cl.start_date as inicio,
    cl.end_date as fim,
    cl.status,
    COUNT(e.id) as alunos_matriculados
FROM public.classes cl
JOIN public.courses c ON c.id = cl.course_id
LEFT JOIN public.members m ON m.id = cl.teacher_id
LEFT JOIN public.enrollments e ON e.class_id = cl.id
WHERE cl.name = 'Turma Fundamentos 2025.1'
GROUP BY cl.id, cl.name, c.name, m.full_name, cl.start_date, cl.end_date, cl.status;

-- 3. Ver avaliação criada
SELECT 
    ev.title as avaliacao,
    ev.type as tipo,
    ev.total_points as pontos_totais,
    ev.passing_grade as nota_minima,
    COUNT(q.id) as total_questoes
FROM public.evaluations ev
LEFT JOIN public.questions q ON q.evaluation_id = ev.id
WHERE ev.title = 'Avaliação Módulo 1'
GROUP BY ev.id, ev.title, ev.type, ev.total_points, ev.passing_grade;

-- 4. Ver estatísticas gerais atualizadas
SELECT 
    (SELECT COUNT(*) FROM public.courses) as total_cursos,
    (SELECT COUNT(*) FROM public.classes) as total_turmas,
    (SELECT COUNT(*) FROM public.enrollments) as total_matriculas,
    (SELECT COUNT(*) FROM public.evaluations) as total_avaliacoes,
    (SELECT COUNT(*) FROM public.lessons) as total_aulas,
    (SELECT COUNT(*) FROM public.chat_rooms) as total_chats;
