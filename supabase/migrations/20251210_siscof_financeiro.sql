-- =====================================================
-- SISCOF - SISTEMA FINANCEIRO COMPLETO - FASE 5
-- Planos, Faturas, Pagamentos PIX e Travamento Automático
-- Data: 2025-12-10
-- =====================================================

-- =========================
-- 1. PLANOS DE ASSINATURA
-- =========================

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
    features JSONB, -- {live_streaming: true, certificates: true, etc}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 2. ASSINATURAS DAS IGREJAS
-- =========================

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

-- =========================
-- 3. FATURAS
-- =========================

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

-- =========================
-- 4. PAGAMENTOS
-- =========================

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
    proof_url TEXT, -- Comprovante de pagamento
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    confirmed_by UUID REFERENCES public.members(id),
    confirmed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 5. HISTÓRICO DE MUDANÇAS DE STATUS
-- =========================

CREATE TABLE IF NOT EXISTS public.subscription_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id),
    old_status TEXT,
    new_status TEXT,
    reason TEXT,
    changed_by UUID REFERENCES public.members(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- ÍNDICES
-- =========================

CREATE INDEX IF NOT EXISTS idx_subscriptions_church ON public.church_subscriptions(church_id);
CREATE INDEX IF NOT EXISTS idx_invoices_church ON public.invoices(church_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_church ON public.payments(church_id);

-- =========================
-- RLS POLICIES
-- =========================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Plans (público para visualização)
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Super admin can manage plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND is_super_admin = true
        )
    );

-- Subscriptions
CREATE POLICY "Church admins can view their subscription" ON public.church_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND church_id = church_subscriptions.church_id
        )
        OR EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND is_super_admin = true
        )
    );

-- Invoices
CREATE POLICY "Church admins can view their invoices" ON public.invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND church_id = invoices.church_id
        )
        OR EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND is_super_admin = true
        )
    );

CREATE POLICY "Super admin can manage invoices" ON public.invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND is_super_admin = true
        )
    );

-- Payments
CREATE POLICY "Church admins can manage their payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND church_id = payments.church_id
        )
        OR EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND is_super_admin = true
        )
    );

-- =========================
-- FUNÇÕES DO SISTEMA FINANCEIRO
-- =========================

-- Função para gerar número de fatura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    sequence_num INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.invoices
    WHERE invoice_number LIKE year_month || '%';
    
    RETURN year_month || LPAD(sequence_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar fatura mensal
CREATE OR REPLACE FUNCTION create_monthly_invoice(church_uuid UUID)
RETURNS UUID AS $$
DECLARE
    subscription_record RECORD;
    plan_record RECORD;
    invoice_id UUID;
    invoice_num TEXT;
    amount DECIMAL(10,2);
BEGIN
    -- Buscar assinatura ativa
    SELECT * INTO subscription_record
    FROM public.church_subscriptions
    WHERE church_id = church_uuid AND status = 'active';
    
    IF subscription_record IS NULL THEN
        RAISE EXCEPTION 'Igreja não possui assinatura ativa';
    END IF;
    
    -- Buscar plano
    SELECT * INTO plan_record
    FROM public.subscription_plans
    WHERE id = subscription_record.plan_id;
    
    -- Determinar valor
    IF subscription_record.billing_cycle = 'monthly' THEN
        amount := plan_record.price_monthly;
    ELSE
        amount := plan_record.price_yearly;
    END IF;
    
    -- Gerar número da fatura
    invoice_num := generate_invoice_number();
    
    -- Criar fatura
    INSERT INTO public.invoices (
        church_id,
        subscription_id,
        plan_id,
        invoice_number,
        amount,
        due_date,
        status
    ) VALUES (
        church_uuid,
        subscription_record.id,
        plan_record.id,
        invoice_num,
        amount,
        CURRENT_DATE + INTERVAL '7 days',
        'pending'
    )
    RETURNING id INTO invoice_id;
    
    -- Atualizar próxima data de cobrança
    UPDATE public.church_subscriptions
    SET next_billing_date = CURRENT_DATE + INTERVAL '30 days'
    WHERE id = subscription_record.id;
    
    RETURN invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar inadimplência (33 dias)
CREATE OR REPLACE FUNCTION check_subscription_overdue(church_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    overdue_days INTEGER;
    oldest_overdue_date DATE;
BEGIN
    -- Buscar fatura vencida mais antiga
    SELECT MIN(due_date) INTO oldest_overdue_date
    FROM public.invoices
    WHERE church_id = church_uuid 
    AND status IN ('pending', 'overdue')
    AND due_date < CURRENT_DATE;
    
    IF oldest_overdue_date IS NULL THEN
        RETURN false;
    END IF;
    
    -- Calcular dias de atraso
    overdue_days := CURRENT_DATE - oldest_overdue_date;
    
    -- Retornar se passou de 33 dias
    RETURN overdue_days > 33;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para travar igreja por inadimplência
CREATE OR REPLACE FUNCTION lock_church_subscription(church_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Atualizar status da assinatura
    UPDATE public.church_subscriptions
    SET status = 'suspended'
    WHERE church_id = church_uuid AND status = 'active';
    
    -- Registrar no histórico
    INSERT INTO public.subscription_status_history (church_id, old_status, new_status, reason)
    VALUES (church_uuid, 'active', 'suspended', 'Inadimplência superior a 33 dias');
    
    -- Marcar faturas como vencidas
    UPDATE public.invoices
    SET status = 'overdue'
    WHERE church_id = church_uuid AND status = 'pending' AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para destravar igreja após pagamento
CREATE OR REPLACE FUNCTION unlock_church_subscription(church_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.church_subscriptions
    SET status = 'active',
        last_payment_at = NOW()
    WHERE church_id = church_uuid AND status = 'suspended';
    
    INSERT INTO public.subscription_status_history (church_id, old_status, new_status, reason)
    VALUES (church_uuid, 'suspended', 'active', 'Pagamento confirmado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para confirmar pagamento
CREATE OR REPLACE FUNCTION confirm_payment(payment_uuid UUID, confirmed_by_user UUID)
RETURNS VOID AS $$
DECLARE
    payment_record RECORD;
BEGIN
    -- Buscar pagamento
    SELECT * INTO payment_record FROM public.payments WHERE id = payment_uuid;
    
    IF payment_record IS NULL THEN
        RAISE EXCEPTION 'Pagamento não encontrado';
    END IF;
    
    -- Confirmar pagamento
    UPDATE public.payments
    SET status = 'confirmed',
        confirmed_by = confirmed_by_user,
        confirmed_at = NOW()
    WHERE id = payment_uuid;
    
    -- Marcar fatura como paga
    UPDATE public.invoices
    SET status = 'paid',
        paid_at = NOW(),
        payment_method = payment_record.payment_method
    WHERE id = payment_record.invoice_id;
    
    -- Destravar igreja se estava suspensa
    PERFORM unlock_church_subscription(payment_record.church_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- JOB AUTOMATIZADO (EXECUTAR DIARIAMENTE VIA CRON)
-- =========================

-- Função para verificar e travar igrejas inadimplentes
CREATE OR REPLACE FUNCTION daily_check_overdue_subscriptions()
RETURNS VOID AS $$
DECLARE
    church_record RECORD;
    is_overdue BOOLEAN;
BEGIN
    -- Para cada igreja com assinatura ativa
    FOR church_record IN 
        SELECT DISTINCT church_id 
        FROM public.church_subscriptions 
        WHERE status = 'active'
    LOOP
        -- Verificar se está inadimplente
        is_overdue := check_subscription_overdue(church_record.church_id);
        
        -- Se passou de 33 dias, travar
        IF is_overdue THEN
            PERFORM lock_church_subscription(church_record.church_id);
            RAISE NOTICE 'Igreja % travada por inadimplência', church_record.church_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- VIEWS
-- =========================

CREATE OR REPLACE VIEW financial_dashboard AS
SELECT 
    ch.id as church_id,
    ch.nome_fantasia as church_name,
    cs.status as subscription_status,
    sp.name as plan_name,
    sp.price_monthly,
    cs.next_billing_date,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending') as pending_invoices,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'overdue') as overdue_invoices,
    SUM(i.amount) FILTER (WHERE i.status IN ('pending', 'overdue')) as total_debt
FROM public.churches ch
LEFT JOIN public.church_subscriptions cs ON cs.church_id = ch.id
LEFT JOIN public.subscription_plans sp ON sp.id = cs.plan_id
LEFT JOIN public.invoices i ON i.church_id = ch.id
GROUP BY ch.id, ch.nome_fantasia, cs.status, sp.name, sp.price_monthly, cs.next_billing_date;

-- =========================
-- SEED DE PLANOS
-- =========================

INSERT INTO public.subscription_plans (name, description, plan_type, price_monthly, price_yearly, max_students, max_courses, features)
VALUES 
    (
        'SISCOF Start',
        'Plano inicial para pequenas igrejas e células',
        'start',
        30.00,
        300.00,
        50,
        5,
        '{"live_streaming": false, "certificates": true, "max_teachers": 3}'::jsonb
    ),
    (
        'SISCOF Ministerial',
        'Plano completo para sedes e subsedes',
        'ministerial',
        49.00,
        490.00,
        200,
        20,
        '{"live_streaming": true, "certificates": true, "max_teachers": 10, "bi_reports": true}'::jsonb
    ),
    (
        'SISCOF Convenção',
        'Plano premium para matrizes e convenções',
        'convencao',
        89.00,
        890.00,
        NULL,
        NULL,
        '{"live_streaming": true, "certificates": true, "max_teachers": null, "bi_reports": true, "multi_church": true, "api_access": true}'::jsonb
    )
ON CONFLICT (name) DO NOTHING;

NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Sistema Financeiro instalado com sucesso!';
RAISE NOTICE '💰 Planos: Start (R$30), Ministerial (R$49), Convenção (R$89)';
RAISE NOTICE '🔐 Travamento automático após 33 dias configurado';
RAISE NOTICE '💳 Chave PIX: c4f1fb32-777f-42f2-87da-6d0aceff31a3';
