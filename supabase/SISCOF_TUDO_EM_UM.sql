-- =====================================================
-- SISCOF COMPLETO - TUDO EM UM ARQUIVO SÓ
-- COPIE ESTE ARQUIVO INTEIRO E COLE NO SUPABASE
-- Data: 2025-12-10
-- =====================================================

-- Este arquivo contém TODAS as 6 fases do SISCOF
-- Execute tudo de uma vez no Supabase SQL Editor

-- =====================================================
-- FASE 1: ESCOLA DE CULTO
-- =====================================================

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

CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    meeting_schedule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- =====================================================
-- FASE 2: AVALIAÇÕES
-- =====================================================

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
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT false,
    shuffle_questions BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'essay', 'short_answer')),
    points DECIMAL(5,2) NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.evaluation_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id),
    essay_answer TEXT,
    short_answer TEXT,
    points_earned DECIMAL(5,2),
    feedback TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- =====================================================
-- FASE 3: CERTIFICADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    church_name TEXT NOT NULL,
    completion_date DATE NOT NULL,
    total_hours INTEGER,
    final_grade DECIMAL(5,2),
    teacher_name TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    issued_by UUID REFERENCES public.members(id),
    qr_code_data TEXT,
    pdf_url TEXT,
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.members(id),
    revoke_reason TEXT
);

-- =====================================================
-- FASE 5: FINANCEIRO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    plan_type TEXT CHECK (plan_type IN ('start', 'ministerial', 'convencao')),
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    max_students INTEGER,
    max_courses INTEGER,
    max_teachers INTEGER,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.church_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE UNIQUE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    last_payment_at TIMESTAMPTZ,
    next_billing_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.church_subscriptions(id),
    plan_id UUID REFERENCES public.subscription_plans(id),
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('pix', 'boleto', 'card', 'manual')),
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    church_id UUID REFERENCES public.churches(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    pix_key TEXT DEFAULT 'c4f1fb32-777f-42f2-87da-6d0aceff31a3',
    pix_qr_code TEXT,
    pix_transaction_id TEXT,
    transaction_id TEXT,
    proof_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    confirmed_by UUID REFERENCES public.members(id),
    confirmed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FASE 7: COMUNICAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('class', 'church', 'cell', 'direct', 'course', 'general')),
    related_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'video', 'audio')),
    file_url TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('message', 'enrollment', 'grade', 'certificate', 'payment', 'system', 'announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEED: PLANOS DE ASSINATURA
-- =====================================================

INSERT INTO public.subscription_plans (name, description, plan_type, price_monthly, price_yearly, max_students, max_courses, features)
VALUES 
    (
        'SISCOF Start',
        'Plano inicial para pequenas igrejas',
        'start',
        30.00,
        300.00,
        50,
        5,
        '{"certificates": true, "max_teachers": 3}'::jsonb
    ),
    (
        'SISCOF Ministerial',
        'Plano completo para sedes',
        'ministerial',
        49.00,
        490.00,
        200,
        20,
        '{"live_streaming": true, "certificates": true, "max_teachers": 10, "bi_reports": true}'::jsonb
    ),
    (
        'SISCOF Convenção',
        'Plano premium para matrizes',
        'convencao',
        89.00,
        890.00,
        NULL,
        NULL,
        '{"live_streaming": true, "certificates": true, "bi_reports": true, "multi_church": true}'::jsonb
    )
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SISCOF INSTALADO COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📚 28 tabelas criadas';
    RAISE NOTICE '💰 3 planos configurados (R$30, R$49, R$89)';
    RAISE NOTICE '💳 Chave PIX: c4f1fb32-777f-42f2-87da-6d0aceff31a3';
    RAISE NOTICE '========================================';
END $$;
