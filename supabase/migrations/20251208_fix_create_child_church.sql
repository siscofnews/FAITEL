-- Função para criar igrejas filhas (Sedes, Subsedes, Congregações) com segurança
CREATE OR REPLACE FUNCTION public.create_child_church(
    p_nome_fantasia text,
    p_nivel public.church_level,
    p_parent_church_id uuid,
    p_pastor_presidente_nome text,
    p_email text DEFAULT NULL,
    p_telefone text DEFAULT NULL,
    p_cep text DEFAULT NULL,
    p_endereco text DEFAULT NULL,
    p_bairro text DEFAULT NULL,
    p_numero text DEFAULT NULL,
    p_cidade text DEFAULT NULL,
    p_estado text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_church_id uuid;
BEGIN
    -- Validar se a igreja pai existe e está ativa
    IF NOT EXISTS (SELECT 1 FROM public.churches WHERE id = p_parent_church_id AND is_active = true) THEN
        RAISE EXCEPTION 'Igreja principal não encontrada ou inativa';
    END IF;

    -- Inserir a nova igreja
    INSERT INTO public.churches (
        nome_fantasia,
        nivel,
        parent_church_id,
        pastor_presidente_nome,
        email,
        telefone,
        cep,
        endereco,
        bairro,
        numero,
        cidade,
        estado,
        is_active,
        is_approved,
        status_licenca
    )
    VALUES (
        p_nome_fantasia,
        p_nivel,
        p_parent_church_id,
        p_pastor_presidente_nome,
        p_email,
        p_telefone,
        p_cep,
        p_endereco,
        p_bairro,
        p_numero,
        p_cidade,
        p_estado,
        true, -- Filiais nascem ativas
        true, -- Filiais nascem aprovadas (pois quem cria é a matriz)
        'ATIVO'
    )
    RETURNING id INTO new_church_id;

    RETURN new_church_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_child_church TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_child_church TO service_role;
