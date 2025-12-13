ALTER TABLE public.distribution_weights
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS period_end DATE,
  ADD COLUMN IF NOT EXISTS cost_center_id UUID,
  ADD COLUMN IF NOT EXISTS account_code VARCHAR(50);

DO $$ BEGIN
  ALTER TABLE public.distribution_weights DROP CONSTRAINT IF EXISTS distribution_weights_entity_root_id_level_node_id_key;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_distribution_weights_unique
ON public.distribution_weights (entity, root_id, level, node_id, cost_center_id, account_code, period_start, period_end);

