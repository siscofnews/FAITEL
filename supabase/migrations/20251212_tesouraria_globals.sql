CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM('PIX','CHEQUE','CARTAO','BOLETO','DEPOSITO','TRANSFERENCIA','DEBITO','DINHEIRO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type') THEN
    CREATE TYPE entity_type AS ENUM('IGREJA','CONVENCAO','FACULDADE');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.finance_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity entity_type NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.repass_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_church UUID,
  to_church UUID,
  account_id UUID,
  amount NUMERIC(14,2) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ
);

