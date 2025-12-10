-- =====================================================
-- SISCOF - SISTEMA DE BI E RELATÓRIOS - FASE 8
-- Business Intelligence e Relatórios Avançados
-- Data: 2025-12-10
-- =====================================================

-- =========================
-- VIEWS PARA ANÁLISES
-- =========================

-- 1. ENGAJAMENTO DOS ALUNOS
CREATE OR REPLACE VIEW student_engagement_metrics AS
SELECT 
    e.student_id,
    m.full_name as student_name,
    c.id as course_id,
    c.name as course_name,
    cl.id as class_id,
    cl.name as class_name,
    e.progress_percentage,
    e.status as enrollment_status,
    COUNT(DISTINCT lp.id) as lessons_accessed,
    COUNT(DISTINCT lp.id) FILTER (WHERE lp.completed = true) as lessons_completed,
    COALESCE(AVG(lp.time_watched_seconds), 0) as avg_time_per_lesson,
    COUNT(DISTINCT a.id) as attendance_count,
    COALESCE(AVG(ea.score), 0) as avg_evaluation_score,
    MAX(lp.last_accessed_at) as last_activity_date,
    CASE 
        WHEN MAX(lp.last_accessed_at) > NOW() - INTERVAL '7 days' THEN 'Ativo'
        WHEN MAX(lp.last_accessed_at) > NOW() - INTERVAL '30 days' THEN 'Moderado'
        ELSE 'Inativo'
    END as engagement_level
FROM public.enrollments e
JOIN public.members m ON m.id = e.student_id
JOIN public.classes cl ON cl.id = e.class_id
JOIN public.courses c ON c.id = cl.course_id
LEFT JOIN public.lesson_progress lp ON lp.enrollment_id = e.id
LEFT JOIN public.attendance a ON a.student_id = e.student_id
LEFT JOIN public.evaluation_attempts ea ON ea.student_id = e.student_id
GROUP BY e.student_id, m.full_name, c.id, c.name, cl.id, cl.name, e.progress_percentage, e.status;

-- 2. PERFORMANCE ACADÊMICA POR TURMA
CREATE OR REPLACE VIEW class_performance_metrics AS
SELECT 
    cl.id as class_id,
    cl.name as class_name,
    c.name as course_name,
    ch.nome_fantasia as church_name,
    t.full_name as teacher_name,
    COUNT(DISTINCT e.id) as total_students,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') as students_completed,
    ROUND(COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed')::NUMERIC / NULLIF(COUNT(DISTINCT e.id), 0) * 100, 2) as completion_rate,
    COALESCE(AVG(e.final_grade), 0) as avg_final_grade,
    COALESCE(AVG(e.progress_percentage), 0) as avg_progress,
    COUNT(DISTINCT ev.id) as total_evaluations,
    COALESCE(AVG(ea.score), 0) as avg_evaluation_score,
    cl.status as class_status
FROM public.classes cl
JOIN public.courses c ON c.id = cl.course_id
JOIN public.churches ch ON ch.id = cl.church_id
LEFT JOIN public.members t ON t.id = cl.teacher_id
LEFT JOIN public.enrollments e ON e.class_id = cl.id
LEFT JOIN public.evaluations ev ON ev.class_id = cl.id
LEFT JOIN public.evaluation_attempts ea ON ea.evaluation_id = ev.id
GROUP BY cl.id, cl.name, c.name, ch.nome_fantasia, t.full_name, cl.status;

-- 3. RELATÓRIO FINANCEIRO CONSOLIDADO
CREATE OR REPLACE VIEW financial_consolidation AS
SELECT 
    ch.id as church_id,
    ch.nome_fantasia as church_name,
    ch.nivel as church_level,
    sp.name as plan_name,
    sp.price_monthly,
    cs.status as subscription_status,
    COUNT(DISTINCT i.id) as total_invoices,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'paid') as paid_invoices,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending') as pending_invoices,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'overdue') as overdue_invoices,
    COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'paid'), 0) as total_paid,
    COALESCE(SUM(i.amount) FILTER (WHERE i.status IN ('pending', 'overdue')), 0) as total_pending,
    MAX(p.paid_at) as last_payment_date,
    cs.next_billing_date
FROM public.churches ch
LEFT JOIN public.church_subscriptions cs ON cs.church_id = ch.id
LEFT JOIN public.subscription_plans sp ON sp.id = cs.plan_id
LEFT JOIN public.invoices i ON i.church_id = ch.id
LEFT JOIN public.payments p ON p.church_id = ch.id AND p.status = 'confirmed'
GROUP BY ch.id, ch.nome_fantasia, ch.nivel, sp.name, sp.price_monthly, cs.status, cs.next_billing_date;

-- 4. CRESCIMENTO GERAL DA ORGANIZAÇÃO
CREATE OR REPLACE VIEW organization_growth_metrics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    'churches' as metric_type,
    COUNT(*) as count
FROM public.churches
GROUP BY DATE_TRUNC('month', created_at)
UNION ALL
SELECT 
    DATE_TRUNC('month', created_at) as month,
    'courses' as metric_type,
    COUNT(*) as count
FROM public.courses
GROUP BY DATE_TRUNC('month', created_at)
UNION ALL
SELECT 
    DATE_TRUNC('month', enrolled_at) as month,
    'enrollments' as metric_type,
    COUNT(*) as count
FROM public.enrollments
GROUP BY DATE_TRUNC('month', enrolled_at)
UNION ALL
SELECT 
    DATE_TRUNC('month', issued_at) as month,
    'certificates' as metric_type,
    COUNT(*) as count
FROM public.certificates
GROUP BY DATE_TRUNC('month', issued_at)
ORDER BY month DESC;

-- 5. COMPARATIVO ENTRE IGREJAS
CREATE OR REPLACE VIEW church_comparison_metrics AS
SELECT 
    ch.id as church_id,
    ch.nome_fantasia as church_name,
    ch.nivel,
    COUNT(DISTINCT c.id) as total_courses,
    COUNT(DISTINCT cl.id) as total_classes,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') as completed_enrollments,
    COUNT(DISTINCT cert.id) as total_certificates,
    COUNT(DISTINCT subs.id) as child_churches,
    COALESCE(AVG(e.final_grade), 0) as avg_final_grade,
    COALESCE(AVG(e.progress_percentage), 0) as avg_progress,
    cs.status as subscription_status,
    sp.name as plan_name
FROM public.churches ch
LEFT JOIN public.courses c ON c.church_id = ch.id
LEFT JOIN public.classes cl ON cl.church_id = ch.id
LEFT JOIN public.enrollments e ON e.class_id = cl.id
LEFT JOIN public.certificates cert ON cert.church_id = ch.id
LEFT JOIN public.churches subs ON subs.parent_id = ch.id
LEFT JOIN public.church_subscriptions cs ON cs.church_id = ch.id
LEFT JOIN public.subscription_plans sp ON sp.id = cs.plan_id
GROUP BY ch.id, ch.nome_fantasia, ch.nivel, cs.status, sp.name;

-- 6. PRESENÇA E FREQUÊNCIA
CREATE OR REPLACE VIEW attendance_analytics AS
SELECT 
    cl.id as class_id,
    cl.name as class_name,
    cs.session_date,
    COUNT(DISTINCT a.student_id) as students_present,
    COUNT(DISTINCT e.student_id) as total_enrolled,
    ROUND(COUNT(DISTINCT a.student_id)::NUMERIC / NULLIF(COUNT(DISTINCT e.student_id), 0) * 100, 2) as attendance_rate,
    COUNT(DISTINCT a.id) FILTER (WHERE a.attendance_type = 'online') as online_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.attendance_type = 'presencial') as presencial_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.attendance_type = 'qr_code') as qr_code_count
FROM public.class_sessions cs
JOIN public.classes cl ON cl.id = cs.class_id
LEFT JOIN public.attendance a ON a.class_session_id = cs.id
LEFT JOIN public.enrollments e ON e.class_id = cl.id AND e.status = 'active'
GROUP BY cl.id, cl.name, cs.session_date;

-- 7. DASHBOARD EXECUTIVO (MATRIZ)
CREATE OR REPLACE VIEW executive_dashboard AS
SELECT 
    COUNT(DISTINCT ch.id) FILTER (WHERE ch.nivel = 'matriz') as total_matriz,
    COUNT(DISTINCT ch.id) FILTER (WHERE ch.nivel = 'sede') as total_sedes,
    COUNT(DISTINCT ch.id) FILTER (WHERE ch.nivel = 'subsede') as total_subsedes,
    COUNT(DISTINCT ch.id) FILTER (WHERE ch.nivel = 'congregacao') as total_congregacoes,
    COUNT(DISTINCT ce.id) as total_celulas,
    COUNT(DISTINCT c.id) as total_courses,
    COUNT(DISTINCT cl.id) as total_classes,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') as active_enrollments,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') as completed_enrollments,
    COUNT(DISTINCT cert.id) as total_certificates,
    COUNT(DISTINCT m.id) as total_members,
    COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'paid'), 0) as total_revenue,
    COALESCE(SUM(i.amount) FILTER (WHERE i.status IN ('pending', 'overdue')), 0) as pending_revenue,
    COUNT(DISTINCT ch.id) FILTER (WHERE cs.status = 'active') as active_subscriptions,
    COUNT(DISTINCT ch.id) FILTER (WHERE cs.status = 'suspended') as suspended_subscriptions
FROM public.churches ch
LEFT JOIN public.cells ce ON true
LEFT JOIN public.courses c ON true
LEFT JOIN public.classes cl ON true
LEFT JOIN public.enrollments e ON true
LEFT JOIN public.certificates cert ON true
LEFT JOIN public.members m ON true
LEFT JOIN public.invoices i ON true
LEFT JOIN public.church_subscriptions cs ON true;

-- 8. TOP CURSOS MAIS POPULARES
CREATE OR REPLACE VIEW popular_courses AS
SELECT 
    c.id as course_id,
    c.name as course_name,
    c.category,
    COUNT(DISTINCT cl.id) as total_classes,
    COUNT(DISTINCT e.id) as total_enrollments,
    COALESCE(AVG(e.final_grade), 0) as avg_grade,
    COUNT(DISTINCT cert.id) as total_certificates,
    ROUND(COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed')::NUMERIC / NULLIF(COUNT(DISTINCT e.id), 0) * 100, 2) as completion_rate
FROM public.courses c
LEFT JOIN public.classes cl ON cl.course_id = c.id
LEFT JOIN public.enrollments e ON e.class_id = cl.id
LEFT JOIN public.certificates cert ON cert.course_id = c.id
WHERE c.is_published = true
GROUP BY c.id, c.name, c.category
ORDER BY total_enrollments DESC;

-- 9. ENGAJAMENTO DE CÉLULAS
CREATE OR REPLACE VIEW cell_engagement AS
SELECT 
    ce.id as cell_id,
    ce.name as cell_name,
    ch.nome_fantasia as church_name,
    COUNT(DISTINCT m.id) as total_members,
    COUNT(DISTINCT e.id) as total_enrollments,
    COALESCE(AVG(e.progress_percentage), 0) as avg_progress,
    COUNT(DISTINCT cert.id) as total_certificates
FROM public.cells ce
JOIN public.churches ch ON ch.id = ce.church_id
LEFT JOIN public.members m ON m.cell_id = ce.id
LEFT JOIN public.enrollments e ON e.student_id = m.id
LEFT JOIN public.certificates cert ON cert.student_id = m.id
GROUP BY ce.id, ce.name, ch.nome_fantasia;

-- =========================
-- FUNÇÕES PARA RELATÓRIOS
-- =========================

-- Gerar relatório de engajamento por período
CREATE OR REPLACE FUNCTION report_engagement_by_period(
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    student_name TEXT,
    course_name TEXT,
    progress DECIMAL,
    last_activity TIMESTAMPTZ,
    engagement_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.full_name,
        c.name,
        e.progress_percentage,
        MAX(lp.last_accessed_at),
        CASE 
            WHEN MAX(lp.last_accessed_at) > NOW() - INTERVAL '7 days' THEN 'Alto'
            WHEN MAX(lp.last_accessed_at) > NOW() - INTERVAL '30 days' THEN 'Médio'
            ELSE 'Baixo'
        END
    FROM public.enrollments e
    JOIN public.members m ON m.id = e.student_id
    JOIN public.classes cl ON cl.id = e.class_id
    JOIN public.courses c ON c.id = cl.course_id
    LEFT JOIN public.lesson_progress lp ON lp.enrollment_id = e.id
    WHERE e.enrolled_at::DATE BETWEEN start_date AND end_date
    GROUP BY m.full_name, c.name, e.progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Relatório de receita mensal
CREATE OR REPLACE FUNCTION report_monthly_revenue(target_year INTEGER)
RETURNS TABLE (
    month INTEGER,
    month_name TEXT,
    total_invoices INTEGER,
    total_paid INTEGER,
    revenue DECIMAL,
    pending DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(MONTH FROM i.created_at)::INTEGER,
        TO_CHAR(i.created_at, 'Month'),
        COUNT(*)::INTEGER,
        COUNT(*) FILTER (WHERE i.status = 'paid')::INTEGER,
        COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'paid'), 0),
        COALESCE(SUM(i.amount) FILTER (WHERE i.status IN ('pending', 'overdue')), 0)
    FROM public.invoices i
    WHERE EXTRACT(YEAR FROM i.created_at) = target_year
    GROUP BY EXTRACT(MONTH FROM i.created_at), TO_CHAR(i.created_at, 'Month')
    ORDER BY EXTRACT(MONTH FROM i.created_at);
END;
$$ LANGUAGE plpgsql;

-- =========================
-- ÍNDICES PARA PERFORMANCE EM RELATÓRIOS
-- =========================

CREATE INDEX IF NOT EXISTS idx_enrollments_date ON public.enrollments(enrolled_at);
CREATE INDEX IF NOT EXISTS idx_certificates_date ON public.certificates(issued_at);
CREATE INDEX IF NOT EXISTS idx_invoices_date_status ON public.invoices(created_at, status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_date ON public.lesson_progress(last_accessed_at);

NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Sistema de BI e Relatórios instalado com sucesso!';
RAISE NOTICE '📊 9 views de análise criadas';
RAISE NOTICE '📈 Dashboards executivos disponíveis';
RAISE NOTICE '🔍 Relatórios de engajamento, financeiro e acadêmico ativos';
