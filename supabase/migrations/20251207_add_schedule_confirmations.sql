-- ==========================================
-- SISTEMA DE CONFIRMAÇÃO DE ESCALAS
-- ==========================================

-- 1. Tabela de Confirmações
CREATE TABLE IF NOT EXISTS public.schedule_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.service_schedules(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  confirmed BOOLEAN DEFAULT false,
 confirmed_at TIMESTAMP WITH TIME ZONE,
  declined BOOLEAN DEFAULT false,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  UNIQUE(schedule_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_confirmations_schedule ON public.schedule_confirmations(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_confirmations_member ON public.schedule_confirmations(member_id);

-- 2. Tabela de Fila deNotificações
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'push')),
  recipient_id UUID REFERENCES auth.users(id),
  recipient_phone TEXT,
  recipient_email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notification_queue_tipo ON public.notification_queue(tipo);

-- 3. RLS
ALTER TABLE public.schedule_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Membros veem suas confirmações
CREATE POLICY IF NOT EXISTS "Members can view own confirmations"
ON public.schedule_confirmations FOR SELECT
USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Membros criam suas confirmações
CREATE POLICY IF NOT EXISTS "Members can create confirmations"
ON public.schedule_confirmations FOR INSERT
WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Admins veem todas confirmações
CREATE POLICY IF NOT EXISTS "Admins can view confirmations"
ON public.schedule_confirmations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN service_schedules ss ON ss.church_id = ur.church_id
  WHERE ur.user_id = auth.uid()
    AND ss.id = schedule_confirmations.schedule_id
    AND ur.role IN ('pastor_presidente', 'admin', 'super_admin')
));

-- Apenas sistema acessa fila de notificações
CREATE POLICY IF NOT EXISTS "Service role can manage queue"
ON public.notification_queue FOR ALL
USING (auth.role() = 'service_role');

-- 4. Função: Confirmar Presença
CREATE OR REPLACE FUNCTION public.confirm_schedule_attendance(
  p_schedule_id UUID,
  p_member_id UUID,
  p_confirmed BOOLEAN DEFAULT true,
  p_decline_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_confirmation_id UUID;
  v_schedule RECORD;
  v_member RECORD;
  v_admin_id UUID;
  v_admin_email TEXT;
  v_admin_phone TEXT;
  v_message TEXT;
  v_subject TEXT;
BEGIN
  -- Buscar escala
  SELECT * INTO v_schedule FROM service_schedules WHERE id = p_schedule_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Escala não encontrada'; END IF;
  
  -- Buscar membro
  SELECT * INTO v_member FROM members WHERE id = p_member_id;
  
  -- Criar/Atualizar confirmação
  INSERT INTO schedule_confirmations (
    schedule_id, member_id, confirmed, confirmed_at, declined, declined_at, decline_reason
  ) VALUES (
    p_schedule_id, p_member_id,
    p_confirmed, CASE WHEN p_confirmed THEN now() ELSE NULL END,
    NOT p_confirmed, CASE WHEN NOT p_confirmed THEN now() ELSE NULL END,
    p_decline_reason
  )
  ON CONFLICT (schedule_id, member_id)
  DO UPDATE SET
    confirmed = p_confirmed,
    confirmed_at = CASE WHEN p_confirmed THEN now() ELSE schedule_confirmations.confirmed_at END,
    declined = NOT p_confirmed,
    declined_at = CASE WHEN NOT p_confirmed THEN now() ELSE schedule_confirmations.declined_at END,
    decline_reason = EXCLUDED.decline_reason,
    updated_at = now()
  RETURNING id INTO v_confirmation_id;
  
  -- Montar mensagem
  IF p_confirmed THEN
    v_subject := '✅ Confirmação de Presença - ' || v_schedule.titulo;
    v_message := v_member.full_name || ' CONFIRMOU presença na escala: ' || 
                 v_schedule.titulo || ' em ' || to_char(v_schedule.data, 'DD/MM/YYYY');
  ELSE
    v_subject := '❌ Recusa de Escala - ' || v_schedule.titulo;
    v_message := v_member.full_name || ' NÃO PODERÁ comparecer na escala: ' || 
                 v_schedule.titulo || ' em ' || to_char(v_schedule.data, 'DD/MM/YYYY');
    IF p_decline_reason IS NOT NULL THEN
      v_message := v_message || '. Motivo: ' || p_decline_reason;
    END IF;
  END IF;
  
  -- Notificar admins da igreja
  FOR v_admin_id, v_admin_email, v_admin_phone IN
    SELECT ur.user_id, m.email, m.telefone
    FROM user_roles ur
    LEFT JOIN members m ON m.user_id = ur.user_id
    WHERE ur.church_id = v_schedule.church_id
      AND ur.role IN ('pastor_presidente', 'admin', 'super_admin')
  LOOP
    -- Email
    IF v_admin_email IS NOT NULL THEN
      INSERT INTO notification_queue (tipo, recipient_id, recipient_email, subject, message, metadata)
      VALUES ('email', v_admin_id, v_admin_email, v_subject, v_message,
              jsonb_build_object('schedule_id', p_schedule_id, 'member_id', p_member_id, 'confirmed', p_confirmed));
    END IF;
    
    -- WhatsApp
    IF v_admin_phone IS NOT NULL THEN
      INSERT INTO notification_queue (tipo, recipient_id, recipient_phone, subject, message, metadata)
      VALUES ('whatsapp', v_admin_id, v_admin_phone, v_subject, v_message,
              jsonb_build_object('schedule_id', p_schedule_id, 'member_id', p_member_id, 'confirmed', p_confirmed));
    END IF;
    
    -- Push
    INSERT INTO notification_queue (tipo, recipient_id, subject, message, metadata)
    VALUES ('push', v_admin_id, v_subject, v_message,
            jsonb_build_object('schedule_id', p_schedule_id, 'member_id', p_member_id, 'confirmed', p_confirmed));
  END LOOP;
  
  RETURN v_confirmation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_schedule_attendance TO authenticated;

-- 5. Triggers
CREATE OR REPLACE FUNCTION update_schedule_confirmations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_schedule_confirmations_updated_at ON public.schedule_confirmations;
CREATE TRIGGER update_schedule_confirmations_updated_at
  BEFORE UPDATE ON public.schedule_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_confirmations_updated_at();

-- Comentários
COMMENT ON TABLE schedule_confirmations IS 'Confirmações de presença nas escalas de serviço';
COMMENT ON TABLE notification_queue IS 'Fila de notificações (WhatsApp, Email, Push)';
COMMENT ON FUNCTION confirm_schedule_attendance IS 'Confirma ou recusa presença em uma escala e notifica admins';

-- Script completo!
