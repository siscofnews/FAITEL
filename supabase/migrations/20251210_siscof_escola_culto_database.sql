-- =====================================================
-- SISCOF - ESCOLA DE CULTO ONLINE - FASE 1
-- Sistema Completo de Cursos, Aulas e Matrículas
-- Data: 2025-12-10
-- =====================================================

-- =========================
-- 1. CURSOS E TRILHAS
-- =========================

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('biblica', 'teologica', 'ministerial', 'discipulado', 'lideranca')),
    duration_hours INTEGER,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 2. MÓDULOS DOS CURSOS
-- =========================

CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 3. AULAS (LESSONS)
-- =========================

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    video_duration_seconds INTEGER,
    pdf_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    lesson_type TEXT DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'live', 'assignment')),
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 4. TURMAS (CLASSES)
-- =========================

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.members(id),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    max_students INTEGER DEFAULT 50,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    meeting_schedule TEXT, -- ex: "Terças 19h" ou JSON
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 5. MATRÍCULAS (ENROLLMENTS)
-- =========================

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'suspended')),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    final_grade DECIMAL(5,2),
    completion_date TIMESTAMPTZ,
    UNIQUE(class_id, student_id)
);

-- =========================
-- 6. PROGRESSO NAS AULAS
-- =========================

CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    time_watched_seconds INTEGER DEFAULT 0,
    notes TEXT,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enrollment_id, lesson_id)
);

-- =========================
-- 7. SESSÕES DE AULA (PRESENCIAL/ONLINE)
-- =========================

CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id),
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_live BOOLEAN DEFAULT false,
    live_url TEXT,
    qr_code TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 8. PRESENÇA (ATTENDANCE)
-- =========================

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    attendance_type TEXT CHECK (attendance_type IN ('online', 'presencial', 'qr_code', 'manual')),
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_valid BOOLEAN DEFAULT true,
    notes TEXT,
    UNIQUE(class_session_id, student_id)
);

-- =========================
-- ÍNDICES PARA PERFORMANCE
-- =========================

CREATE INDEX IF NOT EXISTS idx_courses_church ON public.courses(church_id);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_classes_course ON public.classes(course_id);
CREATE INDEX IF NOT EXISTS idx_classes_church ON public.classes(church_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_enrollment ON public.lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance(class_session_id);

-- =========================
-- RLS POLICIES
-- =========================

-- Courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin can manage all courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND is_super_admin = true
        )
    );

CREATE POLICY "Church admins can manage their courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND church_id = courses.church_id
        )
    );

CREATE POLICY "Everyone can view published courses" ON public.courses
    FOR SELECT USING (is_published = true AND is_active = true);

-- Classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage classes" ON public.classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() 
            AND (is_super_admin = true OR church_id = classes.church_id)
        )
    );

CREATE POLICY "Students can view their classes" ON public.classes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.members m ON m.id = e.student_id
            WHERE m.user_id = auth.uid() AND e.class_id = classes.id
        )
    );

-- Enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their enrollments" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.user_id = auth.uid() AND members.id = enrollments.student_id
        )
    );

CREATE POLICY "Admins can manage enrollments" ON public.enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.classes c ON c.id = enrollments.class_id
            WHERE ur.user_id = auth.uid() 
            AND (ur.is_super_admin = true OR ur.church_id = c.church_id)
        )
    );

-- Lesson Progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own progress" ON public.lesson_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.members m ON m.id = e.student_id
            WHERE m.user_id = auth.uid() AND e.id = lesson_progress.enrollment_id
        )
    );

CREATE POLICY "Teachers can view student progress" ON public.lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.classes c ON c.id = e.class_id
            JOIN public.members m ON m.id = c.teacher_id
            WHERE m.user_id = auth.uid() AND e.id = lesson_progress.enrollment_id
        )
    );

-- =========================
-- FUNÇÕES AUXILIARES
-- =========================

-- Função para calcular progresso do aluno
CREATE OR REPLACE FUNCTION calculate_enrollment_progress(enrollment_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_pct DECIMAL(5,2);
BEGIN
    -- Contar total de aulas do curso
    SELECT COUNT(*) INTO total_lessons
    FROM public.lessons l
    JOIN public.course_modules cm ON cm.id = l.module_id
    JOIN public.classes c ON c.course_id = cm.course_id
    JOIN public.enrollments e ON e.class_id = c.id
    WHERE e.id = enrollment_uuid;
    
    -- Contar aulas completadas
    SELECT COUNT(*) INTO completed_lessons
    FROM public.lesson_progress lp
    WHERE lp.enrollment_id = enrollment_uuid AND lp.completed = true;
    
    -- Calcular percentual
    IF total_lessons > 0 THEN
        progress_pct := (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100;
    ELSE
        progress_pct := 0;
    END IF;
    
    -- Atualizar tabela de enrollments
    UPDATE public.enrollments
    SET progress_percentage = progress_pct
    WHERE id = enrollment_uuid;
    
    RETURN progress_pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar progresso automaticamente
CREATE OR REPLACE FUNCTION update_progress_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_enrollment_progress(NEW.enrollment_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress
    AFTER INSERT OR UPDATE OF completed ON public.lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_progress_on_completion();

-- =========================
-- VIEWS ÚTEIS
-- =========================

-- View para listar cursos com estatísticas
CREATE OR REPLACE VIEW course_stats AS
SELECT 
    c.id,
    c.name,
    c.church_id,
    c.category,
    COUNT(DISTINCT cm.id) as total_modules,
    COUNT(DISTINCT l.id) as total_lessons,
    COUNT(DISTINCT cl.id) as total_classes,
    COUNT(DISTINCT e.id) as total_students,
    c.is_published,
    c.is_active
FROM public.courses c
LEFT JOIN public.course_modules cm ON cm.course_id = c.id
LEFT JOIN public.lessons l ON l.module_id = cm.id
LEFT JOIN public.classes cl ON cl.course_id = c.id
LEFT JOIN public.enrollments e ON e.class_id = cl.id
GROUP BY c.id;

-- =========================
-- DADOS DE EXEMPLO (SEED)
-- =========================

-- Inserir curso de exemplo (apenas se não existir)
DO $$
DECLARE
    matriz_id UUID;
    curso_id UUID;
    modulo_id UUID;
BEGIN
    -- Pegar ID da primeira igreja matriz
    SELECT id INTO matriz_id FROM public.churches WHERE nivel = 'matriz' LIMIT 1;
    
    IF matriz_id IS NOT NULL THEN
        -- Criar curso exemplo
        INSERT INTO public.courses (church_id, name, description, category, duration_hours, is_published)
        VALUES (
            matriz_id,
            'Fundamentos da Fé',
            'Curso básico sobre os fundamentos da fé cristã',
            'biblica',
            20,
            true
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO curso_id;
        
        IF curso_id IS NOT NULL THEN
            -- Criar módulo exemplo
            INSERT INTO public.course_modules (course_id, name, description, order_index)
            VALUES (
                curso_id,
                'Introdução à Bíblia',
                'Conhecendo a Palavra de Deus',
                1
            )
            RETURNING id INTO modulo_id;
            
            -- Criar aula exemplo
            IF modulo_id IS NOT NULL THEN
                INSERT INTO public.lessons (module_id, title, content, lesson_type, order_index)
                VALUES (
                    modulo_id,
                    'O que é a Bíblia?',
                    'Nesta aula vamos aprender sobre a origem e importância da Bíblia Sagrada.',
                    'text',
                    1
                );
            END IF;
        END IF;
    END IF;
END $$;

-- =========================
-- NOTIFICAÇÕES
-- =========================

NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ SISCOF Escola de Culto - Fase 1 instalada com sucesso!';
RAISE NOTICE '📚 Tabelas criadas: courses, course_modules, lessons, classes, enrollments, lesson_progress, class_sessions, attendance';
RAISE NOTICE '🔐 Políticas RLS configuradas';
RAISE NOTICE '⚡ Funções e triggers ativos';
