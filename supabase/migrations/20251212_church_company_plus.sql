ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS municipal_registration TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS cnpj_matriz TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS cnpj_filial TEXT;

