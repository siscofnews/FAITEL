-- Adicionar campos de lider e função na tabela de células
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'lider_nome') THEN
        ALTER TABLE public.cells ADD COLUMN lider_nome text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'funcao_lider') THEN
        ALTER TABLE public.cells ADD COLUMN funcao_lider text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'lider_email') THEN
        ALTER TABLE public.cells ADD COLUMN lider_email text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'lider_telefone') THEN
        ALTER TABLE public.cells ADD COLUMN lider_telefone text;
    END IF;
END $$;
