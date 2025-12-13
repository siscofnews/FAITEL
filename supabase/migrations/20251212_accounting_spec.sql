CREATE TABLE IF NOT EXISTS public.accounting_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  entity_id UUID NOT NULL,
  section TEXT CHECK (section IN ('body')) DEFAULT 'body',
  column_name TEXT NOT NULL,
  width INT NOT NULL,
  ord INT NOT NULL,
  format TEXT,
  UNIQUE(entity, entity_id, section, column_name)
);

