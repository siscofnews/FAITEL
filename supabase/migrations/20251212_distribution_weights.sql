CREATE TABLE IF NOT EXISTS public.distribution_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  root_id UUID NOT NULL,
  level TEXT NOT NULL,
  node_id UUID NOT NULL,
  weight NUMERIC(14,4) NOT NULL DEFAULT 1,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity, root_id, level, node_id)
);

