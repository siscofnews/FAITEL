-- ========================================
-- Funções SQL para Sistema de Assinaturas e Pagamentos
-- ========================================

-- 1. Função: Aprovar Matriz (Super Admin)
CREATE OR REPLACE FUNCTION public.aprovar_matriz(
  p_church_id UUID,
  p_dias_licenca INTEGER DEFAULT 35
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_is_super_admin BOOLEAN;
  v_church_email TEXT;
  v_church_name TEXT;
  v_nova_data DATE;
BEGIN
  v_admin_id := auth.uid();
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se é super admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = v_admin_id AND (role = 'super_admin' OR is_super_admin = true)
  ) INTO v_is_super_admin;
  
  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Apenas Super Administradores podem aprovar matrizes';
  END IF;
  
  -- Pegar dados da igreja
  SELECT email, nome_fantasia INTO v_church_email, v_church_name
  FROM churches
  WHERE id = p_church_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Igreja não encontrada';
  END IF;
  
  -- Calcular nova data de vencimento
  v_nova_data := CURRENT_DATE + p_dias_licenca;
  
  -- Atualizar igreja
  UPDATE churches
  SET 
    status_licenca = 'ATIVO',
    is_approved = true,
    is_active = true,
    data_vencimento = v_nova_data,
    data_aprovacao = now(),
    aprovado_por = v_admin_id
  WHERE id = p_church_id;
  
  -- Criar notificação
  INSERT INTO notifications (
    church_id, 
    tipo, 
    titulo, 
    mensagem, 
    enviado_email,
    metadata
  ) VALUES (
    p_church_id,
    'APROVACAO_MATRIZ',
    '✅ Matriz Aprovada!',
    format(
      'Parabéns! Sua matriz "%s" foi aprovada pelo Super Administrador. Sua licença está ativa até %s (%s dias).',
      v_church_name,
      to_char(v_nova_data, 'DD/MM/YYYY'),
      p_dias_licenca
    ),
    true,
    jsonb_build_object(
      'dias_concedidos', p_dias_licenca,
      'data_vencimento', v_nova_data,
      'aprovado_por', v_admin_id
    )
  );
  
  RETURN true;
END;
$$;

-- 2. Função: Rejeitar Matriz
CREATE OR REPLACE FUNCTION public.rejeitar_matriz(
  p_church_id UUID,
  p_motivo TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_church_name TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  -- Verificar super admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_admin_id AND (role = 'super_admin' OR is_super_admin = true)
  ) THEN
    RAISE EXCEPTION 'Apenas Super Administradores podem rejeitar matrizes';
  END IF;
  
  SELECT nome_fantasia INTO v_church_name FROM churches WHERE id = p_church_id;
  
  -- Atualizar status
  UPDATE churches
  SET 
    status_licenca = 'REJEITADO',
    is_approved = false
  WHERE id = p_church_id;
  
  -- Notificar
  INSERT INTO notifications (church_id, tipo, titulo, mensagem, metadata)
  VALUES (
    p_church_id,
    'REJEICAO_MATRIZ',
    '❌ Cadastro Não Aprovado',
    format(
      'Infelizmente sua solicitação de cadastro para "%s" não foi aprovada. %s',
      v_church_name,
      COALESCE('Motivo: ' || p_motivo, 'Entre em contato para mais informações.')
    ),
    jsonb_build_object('motivo', p_motivo, 'rejeitado_por', v_admin_id)
  );
  
  RETURN true;
END;
$$;

-- 3. Função: Verificar vencimentos e enviar avisos (executada diariamente)
CREATE OR REPLACE FUNCTION public.verificar_vencimentos()
RETURNS TABLE(
  church_id UUID,
  nome_igreja TEXT,
  status_atual TEXT,
  dias_restantes INTEGER,
  acao_tomada TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church RECORD;
  v_dias_restantes INTEGER;
  v_acao TEXT;
BEGIN
  FOR v_church IN 
    SELECT 
      c.id, 
      c.nome_fantasia, 
      c.data_vencimento, 
      c.status_licenca, 
      c.email,
      c.ultimo_aviso_vencimento
    FROM churches c
    WHERE c.data_vencimento IS NOT NULL
      AND c.status_licenca IN ('ATIVO', 'VENCIDO', 'LIBERACAO_TEMPORARIA')
  LOOP
    v_dias_restantes := v_church.data_vencimento - CURRENT_DATE;
    v_acao := 'nenhuma';
    
    -- Aviso 5 dias antes do vencimento
    IF v_dias_restantes = 5 AND v_church.status_licenca = 'ATIVO' THEN
      INSERT INTO notifications (church_id, tipo, titulo, mensagem, enviado_email)
      VALUES (
        v_church.id,
        'AVISO_VENCIMENTO_5_DIAS',
        '⚠️ Sua licença vence em 5 dias!',
        format(
          'Atenção! Sua licença do SISCOF vence em %s (5 dias). Renove agora para continuar usando todas as funcionalidades sem interrupção.',
          to_char(v_church.data_vencimento, 'DD/MM/YYYY')
        ),
        true
      );
      
      UPDATE churches SET ultimo_aviso_vencimento = now() WHERE id = v_church.id;
      v_acao := 'aviso_5_dias';
    END IF;
    
    -- Licença venceu hoje - mudar para VENCIDO
    IF v_dias_restantes = 0 AND v_church.status_licenca = 'ATIVO' THEN
      UPDATE churches SET status_licenca = 'VENCIDO' WHERE id = v_church.id;
      
      INSERT INTO notifications (church_id, tipo, titulo, mensagem, enviado_email)
      VALUES (
        v_church.id,
        'SISTEMA_ATIVO',
        '📅 Licença Vencida',
        format(
          'Sua licença venceu hoje (%s). Você tem 30 dias para renovar antes do bloqueio do sistema.',
          to_char(v_church.data_vencimento, 'DD/MM/YYYY')
        ),
        true
      );
      
      v_acao := 'marcado_vencido';
    END IF;
    
    -- Aviso crítico: 5 dias antes do bloqueio (30 dias após vencimento)
    IF v_dias_restantes = -25 AND v_church.status_licenca = 'VENCIDO' THEN
      INSERT INTO notifications (church_id, tipo, titulo, mensagem, enviado_email)
      VALUES (
        v_church.id,
        'AVISO_BLOQUEIO_5_DIAS',
        '🚨 URGENTE: Sistema será bloqueado em 5 dias!',
        format(
          'ATENÇÃO CRÍTICA! Sua licença está vencida há 30 dias. O sistema será BLOQUEADO em 5 dias se o pagamento não for regularizado. Data de bloqueio: %s',
          to_char(v_church.data_vencimento + 35, 'DD/MM/YYYY')
        ),
        true
      );
      
      v_acao := 'aviso_bloqueio';
    END IF;
    
    -- Bloquear sistema (35 dias após vencimento)
    IF v_dias_restantes <= -35 AND v_church.status_licenca = 'VENCIDO' THEN
      UPDATE churches 
      SET 
        status_licenca = 'BLOQUEADO',
        is_active = false
      WHERE id = v_church.id;
      
      INSERT INTO notifications (church_id, tipo, titulo, mensagem, enviado_email)
      VALUES (
        v_church.id,
        'BLOQUEIO_SISTEMA',
        '🔒 Sistema Bloqueado',
        'Seu acesso ao SISCOF foi bloqueado devido a falta de pagamento (35 dias de atraso). Entre em contato com o suporte para regularizar: suporte@siscof.com',
        true
      );
      
      v_acao := 'bloqueado';
    END IF;
    
    -- Verificar liberação temporária expirada
    IF v_church.status_licenca = 'LIBERACAO_TEMPORARIA' 
       AND EXISTS (
         SELECT 1 FROM churches 
         WHERE id = v_church.id 
           AND data_liberacao_temporaria < CURRENT_DATE
       ) THEN
      UPDATE churches SET status_licenca = 'BLOQUEADO' WHERE id = v_church.id;
      v_acao := 'liberacao_expirada';
    END IF;
    
    RETURN QUERY SELECT 
      v_church.id,
      v_church.nome_fantasia,
      v_church.status_licenca,
      v_dias_restantes,
      v_acao;
  END LOOP;
END;
$$;

-- 4. Função: Liberar Temporariamente
CREATE OR REPLACE FUNCTION public.liberar_temporariamente(
  p_church_id UUID,
  p_dias INTEGER DEFAULT 7,
  p_motivo TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_church_name TEXT;
  v_data_liberacao DATE;
BEGIN
  v_admin_id := auth.uid();
  
  -- Apenas super admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_admin_id AND (role = 'super_admin' OR is_super_admin = true)
  ) THEN
    RAISE EXCEPTION 'Apenas Super Administradores podem liberar temporariamente';
  END IF;
  
  v_data_liberacao := CURRENT_DATE + p_dias;
  
  SELECT nome_fantasia INTO v_church_name FROM churches WHERE id = p_church_id;
  
  UPDATE churches
  SET 
    status_licenca = 'LIBERACAO_TEMPORARIA',
    is_active = true,
    data_liberacao_temporaria = v_data_liberacao,
    dias_liberacao_temporaria = p_dias
  WHERE id = p_church_id;
  
  INSERT INTO notifications (church_id, tipo, titulo, mensagem, metadata)
  VALUES (
    p_church_id,
    'LIBERACAO_TEMPORARIA',
    '🔓 Sistema Liberado Temporariamente',
    format(
      'Seu sistema foi liberado temporariamente por %s dias (até %s). %s Regularize o pagamento para manter o acesso.',
      p_dias,
      to_char(v_data_liberacao, 'DD/MM/YYYY'),
      COALESCE('Motivo: ' || p_motivo || '. ', '')
    ),
    jsonb_build_object(
      'dias_concedidos', p_dias,
      'data_expiracao', v_data_liberacao,
      'liberado_por', v_admin_id,
      'motivo', p_motivo
    )
  );
  
  RETURN true;
END;
$$;

-- 5. Função: Registrar Pagamento
CREATE OR REPLACE FUNCTION public.registrar_pagamento(
  p_church_id UUID,
  p_amount DECIMAL,
  p_dias_concedidos INTEGER DEFAULT 35,
  p_comprovante_url TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id UUID;
  v_admin_id UUID;
  v_nova_data_vencimento DATE;
  v_status_atual TEXT;
  v_church_name TEXT;
BEGIN
  v_admin_id := auth.uid();
  
  -- Pegar status e nome da igreja
  SELECT status_licenca, nome_fantasia, data_vencimento
  INTO v_status_atual, v_church_name, v_nova_data_vencimento
  FROM churches
  WHERE id = p_church_id;
  
  -- Calcular nova data de vencimento
  -- Se ainda está ativo, soma aos dias restantes
  -- Se vencido/bloqueado, começa de hoje
  IF v_status_atual = 'ATIVO' AND v_nova_data_vencimento > CURRENT_DATE THEN
    v_nova_data_vencimento := v_nova_data_vencimento + p_dias_concedidos;
  ELSE
    v_nova_data_vencimento := CURRENT_DATE + p_dias_concedidos;
  END IF;
  
  -- Registrar pagamento
  INSERT INTO payments (
    church_id,
    amount,
    payment_date,
    status,
    confirmed_by,
    confirmed_at,
    tipo_pagamento,
    dias_concedidos,
    comprovante_url,
    observacoes
  ) VALUES (
    p_church_id,
    p_amount,
    now(),
    'confirmed',
    v_admin_id,
    now(),
    CASE 
      WHEN v_status_atual = 'PENDENTE_DE_VALIDACAO' THEN 'primeira_licenca'
      ELSE 'renovacao'
    END,
    p_dias_concedidos,
    p_comprovante_url,
    p_observacoes
  )
  RETURNING id INTO v_payment_id;
  
  -- Atualizar igreja
  UPDATE churches
  SET 
    status_licenca = 'ATIVO',
    is_active = true,
    is_approved = true,
    data_vencimento = v_nova_data_vencimento,
    last_payment_date = now(),
    data_liberacao_temporaria = NULL,
    dias_liberacao_temporaria = 0
  WHERE id = p_church_id;
  
  -- Notificar
  INSERT INTO notifications (church_id, tipo, titulo, mensagem, enviado_email, metadata)
  VALUES (
    p_church_id,
    'PAGAMENTO_CONFIRMADO',
    '✅ Pagamento Confirmado!',
    format(
      'Pagamento de R$ %s confirmado com sucesso! Sua licença foi renovada e está ativa até %s (%s dias).',
      p_amount::TEXT,
      to_char(v_nova_data_vencimento, 'DD/MM/YYYY'),
      p_dias_concedidos
    ),
    true,
    jsonb_build_object(
      'payment_id', v_payment_id,
      'valor', p_amount,
      'dias_concedidos', p_dias_concedidos,
      'data_vencimento', v_nova_data_vencimento
    )
  );
  
  RETURN v_payment_id;
END;
$$;

-- 6. Função: Verificar se usuário pode acessar sistema
CREATE OR REPLACE FUNCTION public.can_access_system(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  can_access BOOLEAN,
  reason TEXT,
  status_licenca TEXT,
  dias_restantes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_church_id UUID;
  v_church RECORD;
  v_is_super_admin BOOLEAN;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Verificar se é super admin (sempre tem acesso)
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = v_user_id AND (role = 'super_admin' OR is_super_admin = true)
  ) INTO v_is_super_admin;
  
  IF v_is_super_admin THEN
    RETURN QUERY SELECT true, 'Super Admin - acesso total'::TEXT, 'SUPER_ADMIN'::TEXT, 999999;
    RETURN;
  END IF;
  
  -- Pegar igreja do usuário
  SELECT church_id INTO v_church_id
  FROM user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  IF v_church_id IS NULL THEN
    RETURN QUERY SELECT false, 'Usuário não vinculado a nenhuma igreja'::TEXT, NULL::TEXT, NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Pegar dados da igreja
  SELECT 
    c.status_licenca,
    c.data_vencimento,
    c.data_liberacao_temporaria
  INTO v_church
  FROM churches c
  WHERE c.id = v_church_id;
  
  -- Verificar status
  CASE v_church.status_licenca
    WHEN 'BLOQUEADO' THEN
      RETURN QUERY SELECT 
        false, 
        'Sistema bloqueado por falta de pagamento. Entre em contato com o suporte.'::TEXT,
        v_church.status_licenca,
        NULL::INTEGER;
        
    WHEN 'PENDENTE_DE_VALIDACAO' THEN
      RETURN QUERY SELECT 
        false,
        'Aguardando aprovação do Super Administrador.'::TEXT,
        v_church.status_licenca,
        NULL::INTEGER;
        
    WHEN 'REJEITADO' THEN
      RETURN QUERY SELECT 
        false,
        'Cadastro rejeitado. Entre em contato com o suporte.'::TEXT,
        v_church.status_licenca,
        NULL::INTEGER;
        
    ELSE
      -- ATIVO, VENCIDO ou LIBERACAO_TEMPORARIA
      RETURN QUERY SELECT 
        true,
        'Acesso liberado'::TEXT,
        v_church.status_licenca,
        v_church.data_vencimento - CURRENT_DATE;
  END CASE;
END;
$$;

-- 7. Conceder permissões
GRANT EXECUTE ON FUNCTION public.aprovar_matriz TO authenticated;
GRANT EXECUTE ON FUNCTION public.rejeitar_matriz TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_vencimentos TO authenticated;
GRANT EXECUTE ON FUNCTION public.liberar_temporariamente TO authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_pagamento TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_system TO authenticated;

-- Comentários
COMMENT ON FUNCTION public.aprovar_matriz IS 'Super Admin aprova matriz e concede licença por X dias';
COMMENT ON FUNCTION public.rejeitar_matriz IS 'Super Admin rejeita cadastro de matriz';
COMMENT ON FUNCTION public.verificar_vencimentos IS 'Função executada diariamente para verificar vencimentos e enviar avisos';
COMMENT ON FUNCTION public.liberar_temporariamente IS 'Super Admin libera sistema bloqueado por X dias temporariamente';
COMMENT ON FUNCTION public.registrar_pagamento IS 'Registra pagamento e renova licença da igreja';
COMMENT ON FUNCTION public.can_access_system IS 'Verifica se usuário pode acessar o sistema baseado no status da licença';
