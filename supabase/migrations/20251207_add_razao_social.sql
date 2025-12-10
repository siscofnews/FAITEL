-- Adicionar coluna Razão Social se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'churches' AND column_name = 'razao_social') THEN
        ALTER TABLE public.churches ADD COLUMN razao_social text;
    END IF;
END $$;
