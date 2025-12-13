ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS state_registration TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS address TEXT;

