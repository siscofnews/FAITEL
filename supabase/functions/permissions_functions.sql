-- ========================================
-- Funções SQL para Sistema de Permissões Hierárquicas
-- ========================================

-- 1. Função: Obter igrejas acessíveis para um usuário (hierarquia completa)
CREATE OR REPLACE FUNCTION public.get_user_accessible_churches(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se for super_admin, retorna todas as igrejas
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id AND role = 'super_admin'
  ) THEN
    RETURN QUERY SELECT id FROM churches;
    RETURN;
  END IF;

  RETURN QUERY
  WITH RECURSIVE hierarchy AS (
    -- Pega igreja do usuário (admin ou manipulador)
    SELECT c.id, c.parent_church_id
    FROM churches c
    INNER JOIN user_roles ur ON (ur.church_id = c.id OR ur.scope_church_id = c.id)
    WHERE ur.user_id = p_user_id
        AND (ur.role IN ('pastor_presidente', 'admin', 'super_admin') OR ur.is_manipulator = true)
    
    UNION
    
    -- Pega todas as igrejas filhas recursivamente
    SELECT c.id, c.parent_church_id
    FROM churches c
    INNER JOIN hierarchy h ON c.parent_church_id = h.id
  )
  SELECT DISTINCT id FROM hierarchy;
END;
$$;

-- 2. Função: Obter nível hierárquico de um usuário
CREATE OR REPLACE FUNCTION public.get_user_hierarchy_level(p_user_id UUID)
RETURNS church_level
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church_id UUID;
  v_level church_level;
BEGIN
  -- Pega igreja do usuário (preferência para role de admin)
  SELECT church_id INTO v_church_id
  FROM user_roles
  WHERE user_id = p_user_id 
    AND role IN ('pastor_presidente', 'admin', 'super_admin')
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'pastor_presidente' THEN 2
      WHEN 'admin' THEN 3
    END
  LIMIT 1;
  
  IF v_church_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Pega nível da igreja
  SELECT nivel INTO v_level
  FROM churches
  WHERE id = v_church_id;
  
  RETURN v_level;
END;
$$;

-- 3. Função: Verificar se admin pode delegar para um usuário
CREATE OR REPLACE FUNCTION public.can_delegate_to_user(
  p_admin_id UUID,
  p_target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_church_id UUID;
  v_target_church_id UUID;
  v_is_in_hierarchy BOOLEAN;
  v_is_super_admin BOOLEAN;
BEGIN
  -- Verificar se admin é super admin (pode delegar para qualquer um)
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_admin_id AND role = 'super_admin'
  ) INTO v_is_super_admin;
  
  IF v_is_super_admin THEN
    RETURN true;
  END IF;
  
  -- Pega igreja do admin
  SELECT church_id INTO v_admin_church_id
  FROM user_roles
  WHERE user_id = p_admin_id 
    AND role IN ('pastor_presidente', 'admin')
  LIMIT 1;
  
  IF v_admin_church_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Pega igreja do usuário alvo (como membro)
  SELECT church_id INTO v_target_church_id
  FROM members
  WHERE user_id = p_target_user_id OR id::text = p_target_user_id::text
  LIMIT 1;
  
  -- Se não encontrou nos membros, tenta em user_roles
  IF v_target_church_id IS NULL THEN
    SELECT church_id INTO v_target_church_id
    FROM user_roles
    WHERE user_id = p_target_user_id
    LIMIT 1;
  END IF;
  
  IF v_target_church_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verifica se usuário alvo está na hierarquia do admin
  WITH RECURSIVE hierarchy AS (
    SELECT id FROM churches WHERE id = v_admin_church_id
    UNION
    SELECT c.id FROM churches c
    INNER JOIN hierarchy h ON c.parent_church_id = h.id
  )
  SELECT EXISTS(SELECT 1 FROM hierarchy WHERE id = v_target_church_id)
  INTO v_is_in_hierarchy;
  
  RETURN v_is_in_hierarchy;
END;
$$;

-- 4. Função: Conceder status de manipulador
CREATE OR REPLACE FUNCTION public.grant_manipulator_status(
  p_target_user_id UUID,
  p_role TEXT DEFAULT 'manipulator'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_admin_church_id UUID;
  v_can_delegate BOOLEAN;
  v_target_church_id UUID;
BEGIN
  v_admin_id := auth.uid();
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verifica se pode delegar
  SELECT can_delegate_to_user(v_admin_id, p_target_user_id)
  INTO v_can_delegate;
  
  IF NOT v_can_delegate THEN
    RAISE EXCEPTION 'Você não pode delegar status para este usuário. Ele deve estar na sua hierarquia.';
  END IF;
  
  -- Pega igreja do admin (escopo da delegação)
  SELECT church_id INTO v_admin_church_id
  FROM user_roles
  WHERE user_id = v_admin_id
    AND role IN ('pastor_presidente', 'admin', 'super_admin')
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'pastor_presidente' THEN 2
      WHEN 'admin' THEN 3
    END
  LIMIT 1;
  
  -- Pega igreja do usuário alvo
  SELECT church_id INTO v_target_church_id
  FROM members
  WHERE user_id = p_target_user_id OR id::text = p_target_user_id::text
  LIMIT 1;
  
  -- Insere ou atualiza role
  INSERT INTO user_roles (
    user_id, 
    role, 
    church_id, 
    is_manipulator, 
    granted_by, 
    scope_church_id,
    granted_at
  ) VALUES (
    p_target_user_id,
    p_role::app_role,
    v_target_church_id,
    true,
    v_admin_id,
    v_admin_church_id,
    now()
  )
  ON CONFLICT (user_id, role, church_id) 
  DO UPDATE SET
    is_manipulator = true,
    granted_by = v_admin_id,
    scope_church_id = v_admin_church_id,
    granted_at = now();
  
  -- Log de auditoria
  INSERT INTO permission_logs (
    action, 
    user_id, 
    granted_by, 
    church_id, 
    role_granted,
    reason
  ) VALUES (
    'granted', 
    p_target_user_id, 
    v_admin_id, 
    v_admin_church_id, 
    p_role,
    'Manual grant by admin'
  );
  
  RETURN true;
END;
$$;

-- 5. Função: Revogar status de manipulador
CREATE OR REPLACE FUNCTION public.revoke_manipulator_status(
  p_target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_rows_affected INTEGER;
BEGIN
  v_admin_id := auth.uid();
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Remove status de manipulador
  UPDATE user_roles
  SET 
    is_manipulator = false,
    granted_by = NULL,
    scope_church_id = NULL
  WHERE user_id = p_target_user_id
    AND is_manipulator = true;
  
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  -- Log de auditoria
  IF v_rows_affected > 0 THEN
    INSERT INTO permission_logs (
      action, 
      user_id, 
      granted_by, 
      reason
    ) VALUES (
      'revoked', 
      p_target_user_id, 
      v_admin_id, 
      'Manual revocation by admin'
    );
  END IF;
  
  RETURN v_rows_affected > 0;
END;
$$;

-- 6. Trigger: Auto-revogar permissões quando estrutura muda
CREATE OR REPLACE FUNCTION public.auto_revoke_permissions_on_structure_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_pastor UUID;
  v_old_church UUID;
BEGIN
  -- Captura valores antigos
  IF TG_OP = 'UPDATE' THEN
    v_old_pastor := OLD.pastor_presidente_id;
    v_old_church := OLD.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_pastor := OLD.pastor_presidente_id;
    v_old_church := OLD.id;
  END IF;
  
  -- Se mudou pastor ou deletou igreja
  IF (TG_OP = 'UPDATE' AND OLD.pastor_presidente_id IS DISTINCT FROM NEW.pastor_presidente_id)
     OR TG_OP = 'DELETE' THEN
    
    -- Revoga todos os status concedidos POR aquele pastor
    UPDATE user_roles
    SET 
      is_manipulator = false,
      granted_by = NULL,
      scope_church_id = NULL
    WHERE granted_by = v_old_pastor;
    
    -- Revoga status de quem tinha escopo naquela igreja
    UPDATE user_roles
    SET 
      is_manipulator = false,
      granted_by = NULL,
      scope_church_id = NULL
    WHERE scope_church_id = v_old_church;
    
    -- Log de auditoria
    INSERT INTO permission_logs (
      action, 
      granted_by, 
      church_id, 
      reason
    ) VALUES (
      'auto_revoked', 
      v_old_pastor, 
      v_old_church, 
      CASE 
        WHEN TG_OP = 'DELETE' THEN 'Church deleted'
        ELSE 'Pastor changed'
      END
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_auto_revoke_permissions ON public.churches;
CREATE TRIGGER trg_auto_revoke_permissions
AFTER UPDATE OR DELETE ON public.churches
FOR EACH ROW
EXECUTE FUNCTION public.auto_revoke_permissions_on_structure_change();

-- 7. Conceder permissões de execução
GRANT EXECUTE ON FUNCTION public.get_user_accessible_churches TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_hierarchy_level TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_delegate_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_manipulator_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_manipulator_status TO authenticated;

-- Comentários
COMMENT ON FUNCTION public.get_user_accessible_churches IS 'Retorna todas as igrejas que o usuário pode acessar (sua igreja + todas as filhas)';
COMMENT ON FUNCTION public.get_user_hierarchy_level IS 'Retorna o nível hierárquico da igreja do usuário (matriz, sede, subsede, etc)';
COMMENT ON FUNCTION public.can_delegate_to_user IS 'Verifica se um admin pode delegar status de manipulador para um usuário';
COMMENT ON FUNCTION public.grant_manipulator_status IS 'Concede status de manipulador para um usuário';
COMMENT ON FUNCTION public.revoke_manipulator_status IS 'Revoga status de manipulador de um usuário';
COMMENT ON FUNCTION public.auto_revoke_permissions_on_structure_change IS 'Trigger que revoga automaticamente permissões quando a estrutura da igreja muda';
