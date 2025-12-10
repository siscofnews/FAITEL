-- =====================================================
-- SISCOF - SISTEMA DE CERTIFICADOS DIGITAIS - FASE 3
-- Certificados com QR Code e Validação Online
-- Data: 2025-12-10
-- =====================================================

-- =========================
-- 1. CERTIFICADOS
-- =========================

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
    qr_code_data TEXT, -- Data do QR Code (URL de validação)
    pdf_url TEXT, -- URL do PDF no storage
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.members(id),
    revoke_reason TEXT
);

-- =========================
-- 2. TEMPLATES DE CERTIFICADOS
-- =========================

CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT DEFAULT 'course_completion',
    header_text TEXT,
    body_template TEXT, -- Template com variáveis: {student_name}, {course_name}, etc.
    footer_text TEXT,
    background_url TEXT,
    logo_url TEXT,
    signature_fields JSONB, -- [{name: "Pastor", title: "Pastor Presidente"}]
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- ÍNDICES
-- =========================

CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment ON public.certificates(enrollment_id);

-- =========================
-- RLS POLICIES
-- =========================

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- Certificates
CREATE POLICY "Students can view their certificates" ON public.certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members WHERE id = certificates.student_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage certificates" ON public.certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.churches ch ON ch.id = ur.church_id
            WHERE ur.user_id = auth.uid() 
            AND (ur.is_super_admin = true OR ch.id IN (
                SELECT church_id FROM public.classes WHERE id = certificates.class_id
            ))
        )
    );

-- Public validation (sem autenticação)
CREATE POLICY "Anyone can validate certificates" ON public.certificates
    FOR SELECT USING (true);

-- Templates
CREATE POLICY "Admins can manage templates" ON public.certificate_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() 
            AND (is_super_admin = true OR church_id = certificate_templates.church_id)
        )
    );

-- =========================
-- FUNÇÕES PARA CERTIFICADOS
-- =========================

-- Função para gerar número do certificado
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_number INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    -- Pegar próximo número da sequência do ano
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 6 FOR 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.certificates
    WHERE certificate_number LIKE year_part || '%';
    
    sequence_part := LPAD(next_number::TEXT, 6, '0');
    
    RETURN year_part || sequence_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para emitir certificado automaticamente
CREATE OR REPLACE FUNCTION issue_certificate_for_enrollment(enrollment_uuid UUID)
RETURNS UUID AS $$
DECLARE
    enrollment_record RECORD;
    student_record RECORD;
    course_record RECORD;
    class_record RECORD;
    church_record RECORD;
    teacher_record RECORD;
    cert_number TEXT;
    cert_id UUID;
    qr_data TEXT;
BEGIN
    -- Buscar dados da matrícula
    SELECT * INTO enrollment_record FROM public.enrollments WHERE id = enrollment_uuid;
    
    IF enrollment_record IS NULL THEN
        RAISE EXCEPTION 'Matrícula não encontrada';
    END IF;
    
    -- Verificar se já completou o curso
    IF enrollment_record.status != 'completed' THEN
        RAISE EXCEPTION 'Curso ainda não foi completado';
    END IF;
    
    -- Buscar dados relacionados
    SELECT * INTO student_record FROM public.members WHERE id = enrollment_record.student_id;
    SELECT * INTO class_record FROM public.classes WHERE id = enrollment_record.class_id;
    SELECT * INTO course_record FROM public.courses WHERE id = class_record.course_id;
    SELECT * INTO church_record FROM public.churches WHERE id = class_record.church_id;
    SELECT * INTO teacher_record FROM public.members WHERE id = class_record.teacher_id;
    
    -- Gerar número do certificado
    cert_number := generate_certificate_number();
    
    -- Gerar dados do QR Code (URL de validação)
    qr_data := 'https://siscof.com/validar-certificado/' || cert_number;
    
    -- Inserir certificado
    INSERT INTO public.certificates (
        enrollment_id,
        student_id,
        course_id,
        class_id,
        certificate_number,
        student_name,
        course_name,
        church_name,
        completion_date,
        total_hours,
        final_grade,
        teacher_name,
        qr_code_data
    ) VALUES (
        enrollment_uuid,
        student_record.id,
        course_record.id,
        class_record.id,
        cert_number,
        student_record.full_name,
        course_record.name,
        church_record.nome_fantasia,
        enrollment_record.completion_date::DATE,
        course_record.duration_hours,
        enrollment_record.final_grade,
        teacher_record.full_name,
        qr_data
    )
    RETURNING id INTO cert_id;
    
    RETURN cert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para emitir certificado automaticamente ao completar
CREATE OR REPLACE FUNCTION trigger_issue_certificate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Emitir certificado automaticamente
        PERFORM issue_certificate_for_enrollment(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enrollment_completed
    AFTER UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_issue_certificate();

-- Função para validar certificado por número
CREATE OR REPLACE FUNCTION validate_certificate(cert_number TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'valid', c.is_valid,
        'certificate_number', c.certificate_number,
        'student_name', c.student_name,
        'course_name', c.course_name,
        'church_name', c.church_name,
        'completion_date', c.completion_date,
        'issued_at', c.issued_at,
        'final_grade', c.final_grade,
        'total_hours', c.total_hours,
        'teacher_name', c.teacher_name,
        'revoked', c.revoked_at IS NOT NULL,
        'revoke_reason', c.revoke_reason
    ) INTO result
    FROM public.certificates c
    WHERE c.certificate_number = cert_number;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- VIEW DE CERTIFICADOS
-- =========================

CREATE OR REPLACE VIEW certificates_overview AS
SELECT 
    c.id,
    c.certificate_number,
    c.student_name,
    c.course_name,
    c.church_name,
    c.completion_date,
    c.final_grade,
    c.issued_at,
    c.is_valid,
    c.pdf_url,
    co.name as course_full_name,
    cl.name as class_name
FROM public.certificates c
JOIN public.courses co ON co.id = c.course_id
JOIN public.classes cl ON cl.id = c.class_id;

-- =========================
-- TEMPLATE PADRÃO
-- =========================

DO $$
DECLARE
    matriz_id UUID;
BEGIN
    SELECT id INTO matriz_id FROM public.churches WHERE nivel = 'matriz' LIMIT 1;
    
    IF matriz_id IS NOT NULL THEN
        INSERT INTO public.certificate_templates (
            church_id,
            name,
            description,
            header_text,
            body_template,
            footer_text,
            is_default
        ) VALUES (
            matriz_id,
            'Certificado Padrão',
            'Template padrão para certificados de conclusão de curso',
            'CERTIFICADO DE CONCLUSÃO',
            'Certificamos que {student_name} concluiu com aproveitamento o curso {course_name}, com carga horária de {total_hours} horas, obtendo a nota final de {final_grade}.',
            'Emitido em {issue_date}',
            true
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =========================
-- FUNÇÃO PARA REVOGAR CERTIFICADO
-- =========================

CREATE OR REPLACE FUNCTION revoke_certificate(
    cert_id UUID,
    reason TEXT,
    revoked_by_user UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.certificates
    SET is_valid = false,
        revoked_at = NOW(),
        revoked_by = revoked_by_user,
        revoke_reason = reason
    WHERE id = cert_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Sistema de Certificados instalado com sucesso!';
RAISE NOTICE '🎓 Emissão automática ativada ao completar curso';
RAISE NOTICE '🔍 Validação online disponível';
RAISE NOTICE '📜 Templates personalizáveis por igreja';
