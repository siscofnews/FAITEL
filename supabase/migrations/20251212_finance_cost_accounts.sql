CREATE TABLE IF NOT EXISTS public.cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  entity_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chart_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  entity_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  nature TEXT CHECK (nature IN ('RECEITA','DESPESA','ATIVO','PASSIVO'))
);

ALTER TABLE public.church_entries ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);
ALTER TABLE public.church_entries ADD COLUMN IF NOT EXISTS account_code VARCHAR(50);
ALTER TABLE public.church_expenses ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);
ALTER TABLE public.church_expenses ADD COLUMN IF NOT EXISTS account_code VARCHAR(50);

ALTER TABLE public.convention_entries ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);
ALTER TABLE public.convention_entries ADD COLUMN IF NOT EXISTS account_code VARCHAR(50);
ALTER TABLE public.convention_expenses ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);
ALTER TABLE public.convention_expenses ADD COLUMN IF NOT EXISTS account_code VARCHAR(50);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS account_code VARCHAR(50);

CREATE OR REPLACE VIEW public.accounting_ledger AS
SELECT date AS tx_date, church_id AS entity_id, 'IGREJA'::entity_type AS entity, account_code, cost_center_id, amount AS value, payment_method, description, 'ENTRADA' AS kind
FROM public.church_entries
UNION ALL
SELECT date AS tx_date, church_id AS entity_id, 'IGREJA'::entity_type AS entity, account_code, cost_center_id, total_value AS value, NULL AS payment_method, description, 'DESPESA' AS kind
FROM public.church_expenses;

