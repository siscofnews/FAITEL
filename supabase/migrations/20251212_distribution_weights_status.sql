ALTER TABLE public.distribution_weights
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft','published')) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS published_by UUID,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

