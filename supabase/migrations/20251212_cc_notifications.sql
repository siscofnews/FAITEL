CREATE TABLE IF NOT EXISTS public.cost_center_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  entity_id UUID NOT NULL,
  cost_center_id UUID,
  email TEXT NOT NULL
);

