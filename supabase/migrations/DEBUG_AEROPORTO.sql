-- Script to Debug/Fix "Jardim Aeroporto" Church visibility
-- This ensures the church is Approved, Active, and visible in the list.

DO $$
DECLARE
    v_church_id UUID;
    v_parent_id UUID;
    v_parent_name TEXT;
BEGIN
    -- 1. Find the church
    SELECT id, parent_church_id INTO v_church_id, v_parent_id
    FROM public.churches
    WHERE nome_fantasia ILIKE '%Aeroporto%'
    LIMIT 1;

    IF v_church_id IS NULL THEN
        RAISE EXCEPTION 'Erro: Igreja "Jardim Aeroporto" não encontrada no banco de dados!';
    END IF;

    -- 2. Force Approval and Active status
    UPDATE public.churches
    SET 
        is_approved = true, 
        is_active = true
    WHERE id = v_church_id;
    
    RAISE NOTICE 'Igreja ID % atualizada para Ativa e Aprovada.', v_church_id;

    -- 3. Check Parent
    IF v_parent_id IS NULL THEN
        RAISE WARNING 'Atenção: Esta igreja NÃO tem uma Matriz/Pai vinculada. Ela não aparecerá nas listas dependentes!';
    ELSE
        SELECT nome_fantasia INTO v_parent_name FROM public.churches WHERE id = v_parent_id;
        RAISE NOTICE 'Esta igreja está vinculada a: %', v_parent_name;
    END IF;

    -- 4. Check Level
    perform * from public.churches where id = v_church_id and nivel = 'sede';
    IF NOT FOUND THEN
         RAISE WARNING 'Atenção: Esta igreja NÃO está marcada como "SEDE". Verifique o nível dela!';
    END IF;

END $$;
