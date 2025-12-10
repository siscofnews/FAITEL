-- Função para permitir que pastores cadastrem igrejas filhas
-- Bypassa RLS de forma segura verificando permissões antes

CREATE OR REPLACE FUNCTION create_child_church(
  p_nome_fantasia TEXT,
  p_nivel church_level,
  p_parent_church_id UUID,
  p_pastor_presidente_nome TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_telefone TEXT DEFAULT NULL,
  p_cep TEXT DEFAULT NULL,
  p_endereco TEXT DEFAULT NULL,
  p_cidade TEXT DEFAULT NULL,
  p_estado TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_church_id UUID;
  v_user_role TEXT;
  v_parent_nivel church_level;
  v_new_church_id UUID;
  v_is_super_admin BOOLEAN;
BEGIN
  -- Pegar ID do usuário logado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verificar se é super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  -- Se for super admin, pode criar qualquer igreja
  IF v_is_super_admin THEN
    INSERT INTO churches (
      nome_fantasia,
      nivel,
      parent_church_id,
      pastor_presidente_nome,
      email,
      telefone,
      cep,
      endereco,
      cidade,
      estado,
      is_approved,
      is_active
    ) VALUES (
      p_nome_fantasia,
      p_nivel,
      p_parent_church_id,
      p_pastor_presidente_nome,
      p_email,
      p_telefone,
      p_cep,
      p_endereco,
      p_cidade,
      p_estado,
      TRUE, -- Super admin auto-aprova
      TRUE
    ) RETURNING id INTO v_new_church_id;
    
    RETURN v_new_church_id;
  END IF;

  -- Para não-super-admins, verificar permissões baseadas na hierarquia

  -- Pegar igreja e role do usuário
  SELECT church_id, role INTO v_user_church_id, v_user_role
  FROM user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_user_church_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não vinculado a nenhuma igreja';
  END IF;

  -- Verificar se o usuário tem permissão (deve ser pastor_presidente ou admin)
  IF v_user_role NOT IN ('pastor_presidente', 'admin') THEN
    RAISE EXCEPTION 'Apenas pastores presidentes podem cadastrar igrejas filhas';
  END IF;

  -- Verificar se a igreja pai pertence ao usuário
  IF p_parent_church_id != v_user_church_id THEN
    RAISE EXCEPTION 'Você só pode cadastrar igrejas filhas da sua própria igreja';
  END IF;

  -- Pegar nível da igreja pai
  SELECT nivel INTO v_parent_nivel
  FROM churches
  WHERE id = p_parent_church_id;

  -- Validar hierarquia: matriz -> sede -> subsede -> congregacao -> celula
  IF (v_parent_nivel = 'matriz' AND p_nivel NOT IN ('sede', 'celula')) OR
     (v_parent_nivel = 'sede' AND p_nivel NOT IN ('subsede', 'celula')) OR
     (v_parent_nivel = 'subsede' AND p_nivel NOT IN ('congregacao', 'celula')) OR
     (v_parent_nivel = 'congregacao' AND p_nivel != 'celula') OR
     (v_parent_nivel = 'celula') THEN
    RAISE EXCEPTION 'Hierarquia inválida: % não pode ter filho do tipo %', v_parent_nivel, p_nivel;
  END IF;

  -- Inserir nova igreja
  INSERT INTO churches (
    nome_fantasia,
    nivel,
    parent_church_id,
    pastor_presidente_nome,
    email,
    telefone,
    cep,
    endereco,
    cidade,
    estado,
    is_approved,
    is_active
  ) VALUES (
    p_nome_fantasia,
    p_nivel,
    p_parent_church_id,
    p_pastor_presidente_nome,
    p_email,
    p_telefone,
    p_cep,
    p_endereco,
    p_cidade,
    p_estado,
    TRUE, -- Auto-aprovado quando criado por pastor autorizado
    TRUE
  ) RETURNING id INTO v_new_church_id;

  RETURN v_new_church_id;
END;
$$;

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION create_child_church TO authenticated;

-- Comentário explicativo
COMMENT ON FUNCTION create_child_church IS 'Permite que pastores cadastrem igrejas filhas respeitando a hierarquia: Matriz -> Sede -> Subsede -> Congregação -> Célula';
