CREATE TABLE IF NOT EXISTS public.monthly_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  entity_id UUID NOT NULL,
  cost_center_id UUID,
  nature TEXT CHECK (nature IN ('RECEITA','DESPESA')) NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL,
  UNIQUE(entity, entity_id, cost_center_id, nature, year, month)
);

