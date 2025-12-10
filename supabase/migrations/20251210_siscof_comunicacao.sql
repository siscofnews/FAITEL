-- =====================================================
-- SISCOF - SISTEMA DE COMUNICAÇÃO E CHAT - FASE 7
-- Chat interno, Notificações e Mensagens
-- Data: 2025-12-10
-- =====================================================

-- =========================
-- 1. SALAS DE CHAT
-- =========================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('class', 'church', 'cell', 'direct', 'course', 'general')),
    related_id UUID, -- ID da turma, igreja, célula, etc
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 2. PARTICIPANTES DAS SALAS
-- =========================

CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(room_id, user_id)
);

-- =========================
-- 3. MENSAGENS
-- =========================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'video', 'audio')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    reply_to_id UUID REFERENCES public.chat_messages(id),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 4. REAÇÕES ÀS MENSAGENS
-- =========================

CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL, -- emoji: '👍', '❤️', '😂', etc
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction)
);

-- =========================
-- 5. NOTIFICAÇÕES
-- =========================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('message', 'enrollment', 'grade', 'certificate', 'payment', 'system', 'announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    related_id UUID, -- ID do item relacionado
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 6. AVISOS E COMUNICADOS
-- =========================

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id),
    class_id UUID REFERENCES public.classes(id),
    created_by UUID REFERENCES public.members(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    announcement_type TEXT DEFAULT 'general' CHECK (announcement_type IN ('general', 'urgent', 'event', 'deadline')),
    target_audience TEXT, -- 'all', 'students', 'teachers', 'specific_class'
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- ÍNDICES
-- =========================

CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON public.chat_rooms(type, related_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room ON public.chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_church ON public.announcements(church_id, is_published);

-- =========================
-- RLS POLICIES
-- =========================

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Chat Rooms - Participantes podem ver suas salas
CREATE POLICY "Users can view rooms they participate in" ON public.chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp
            JOIN public.members m ON m.id = cp.user_id
            WHERE cp.room_id = chat_rooms.id AND m.user_id = auth.uid()
        )
    );

-- Chat Messages - Participantes podem ver mensagens
CREATE POLICY "Participants can view messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp
            JOIN public.members m ON m.id = cp.user_id
            WHERE cp.room_id = chat_messages.room_id AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp
            JOIN public.members m ON m.id = cp.user_id
            WHERE cp.room_id = chat_messages.room_id AND m.user_id = auth.uid()
        )
    );

-- Notifications - Usuários veem suas próprias notificações
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members WHERE id = notifications.user_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members WHERE id = notifications.user_id AND user_id = auth.uid()
        )
    );

-- Announcements
CREATE POLICY "Users can view published announcements" ON public.announcements
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() 
            AND (is_super_admin = true OR church_id = announcements.church_id)
        )
    );

-- =========================
-- FUNÇÕES
-- =========================

-- Criar sala de chat para turma automaticamente
CREATE OR REPLACE FUNCTION create_class_chat_room(class_uuid UUID)
RETURNS UUID AS $$
DECLARE
    class_record RECORD;
    room_id UUID;
BEGIN
    SELECT * INTO class_record FROM public.classes WHERE id = class_uuid;
    
    IF class_record IS NULL THEN
        RAISE EXCEPTION 'Turma não encontrada';
    END IF;
    
    -- Criar sala
    INSERT INTO public.chat_rooms (type, related_id, name, description, created_by)
    VALUES (
        'class',
        class_uuid,
        'Chat - ' || class_record.name,
        'Sala de discussão da turma',
        class_record.teacher_id
    )
    RETURNING id INTO room_id;
    
    -- Adicionar professor
    INSERT INTO public.chat_participants (room_id, user_id)
    VALUES (room_id, class_record.teacher_id);
    
    -- Adicionar todos os alunos matriculados
    INSERT INTO public.chat_participants (room_id, user_id)
    SELECT room_id, e.student_id
    FROM public.enrollments e
    WHERE e.class_id = class_uuid AND e.status = 'active';
    
    RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enviar notificação
CREATE OR REPLACE FUNCTION send_notification(
    target_user_id UUID,
    notif_type TEXT,
    notif_title TEXT,
    notif_message TEXT,
    notif_action_url TEXT DEFAULT NULL,
    notif_related_id UUID DEFAULT NULL,
    notif_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        related_id,
        priority
    ) VALUES (
        target_user_id,
        notif_type,
        notif_title,
        notif_message,
        notif_action_url,
        notif_related_id,
        notif_priority
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notificar todos da turma
CREATE OR REPLACE FUNCTION notify_class(
    class_uuid UUID,
    notif_title TEXT,
    notif_message TEXT
)
RETURNS INTEGER AS $$
DECLARE
    count_sent INTEGER := 0;
    student_record RECORD;
BEGIN
    FOR student_record IN 
        SELECT DISTINCT student_id 
        FROM public.enrollments 
        WHERE class_id = class_uuid AND status = 'active'
    LOOP
        PERFORM send_notification(
            student_record.student_id,
            'announcement',
            notif_title,
            notif_message,
            '/turmas/' || class_uuid,
            class_uuid,
            'normal'
        );
        count_sent := count_sent + 1;
    END LOOP;
    
    RETURN count_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Marcar notificações como lidas
CREATE OR REPLACE FUNCTION mark_notifications_as_read(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count_updated INTEGER;
BEGIN
    UPDATE public.notifications
    SET is_read = true,
        read_at = NOW()
    WHERE user_id = user_uuid AND is_read = false;
    
    GET DIAGNOSTICS count_updated = ROW_COUNT;
    RETURN count_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================
-- TRIGGER: Notificar nova mensagem
-- =========================

CREATE OR REPLACE FUNCTION trigger_notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    participant_record RECORD;
    sender_name TEXT;
BEGIN
    -- Buscar nome do remetente
    SELECT full_name INTO sender_name FROM public.members WHERE id = NEW.sender_id;
    
    -- Notificar todos os participantes (exceto o remetente)
    FOR participant_record IN 
        SELECT user_id 
        FROM public.chat_participants 
        WHERE room_id = NEW.room_id AND user_id != NEW.sender_id
    LOOP
        PERFORM send_notification(
            participant_record.user_id,
            'message',
            'Nova mensagem de ' || sender_name,
            LEFT(NEW.message, 100),
            '/chat/' || NEW.room_id,
            NEW.room_id,
            'normal'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_chat_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notify_new_message();

-- =========================
-- VIEWS
-- =========================

CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT 
    user_id,
    COUNT(*) as unread_count
FROM public.notifications
WHERE is_read = false
GROUP BY user_id;

CREATE OR REPLACE VIEW recent_chat_activity AS
SELECT 
    cr.id as room_id,
    cr.name as room_name,
    cr.type,
    MAX(cm.sent_at) as last_message_at,
    COUNT(cm.id) as message_count
FROM public.chat_rooms cr
LEFT JOIN public.chat_messages cm ON cm.room_id = cr.id
WHERE cr.is_active = true
GROUP BY cr.id, cr.name, cr.type;

NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Sistema de Comunicação instalado com sucesso!';
RAISE NOTICE '💬 Chat em tempo real configurado';
RAISE NOTICE '🔔 Sistema de notificações ativo';
RAISE NOTICE '📢 Avisos e comunicados disponíveis';
