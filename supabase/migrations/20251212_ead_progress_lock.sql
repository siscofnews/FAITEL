ALTER TABLE public.ead_progress ADD COLUMN IF NOT EXISTS lock_until TIMESTAMPTZ;

