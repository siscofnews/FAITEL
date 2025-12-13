CREATE TABLE IF NOT EXISTS public.finance_type_account_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  finance_type_id UUID REFERENCES public.finance_types(id),
  entity entity_type NOT NULL,
  entity_id UUID NOT NULL,
  nature TEXT CHECK (nature IN ('RECEITA','DESPESA')) NOT NULL,
  account_code VARCHAR(50) NOT NULL
);

CREATE OR REPLACE FUNCTION public.map_account_code_entry()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE code TEXT;
BEGIN
  SELECT account_code INTO code FROM public.finance_type_account_map
  WHERE finance_type_id = NEW.finance_type_id AND entity = 'IGREJA' AND entity_id = NEW.church_id AND nature = 'RECEITA'
  LIMIT 1;
  IF NEW.account_code IS NULL AND code IS NOT NULL THEN NEW.account_code := code; END IF;
  RETURN NEW;
END;$$;

CREATE OR REPLACE FUNCTION public.map_account_code_expense()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE code TEXT;
BEGIN
  SELECT account_code INTO code FROM public.finance_type_account_map
  WHERE finance_type_id = NEW.finance_type_id AND entity = 'IGREJA' AND entity_id = NEW.church_id AND nature = 'DESPESA'
  LIMIT 1;
  IF NEW.account_code IS NULL AND code IS NOT NULL THEN NEW.account_code := code; END IF;
  RETURN NEW;
END;$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_map_account_code_entry') THEN
    CREATE TRIGGER trg_map_account_code_entry BEFORE INSERT OR UPDATE ON public.church_entries
    FOR EACH ROW EXECUTE PROCEDURE public.map_account_code_entry();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_map_account_code_expense') THEN
    CREATE TRIGGER trg_map_account_code_expense BEFORE INSERT OR UPDATE ON public.church_expenses
    FOR EACH ROW EXECUTE PROCEDURE public.map_account_code_expense();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.map_account_code_conv_entry()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE code TEXT;
BEGIN
  SELECT account_code INTO code FROM public.finance_type_account_map
  WHERE finance_type_id = NEW.finance_type_id AND entity = 'CONVENCAO' AND entity_id = NEW.convention_id AND nature = 'RECEITA' LIMIT 1;
  IF NEW.account_code IS NULL AND code IS NOT NULL THEN NEW.account_code := code; END IF;
  RETURN NEW;
END;$$;

CREATE OR REPLACE FUNCTION public.map_account_code_conv_expense()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE code TEXT;
BEGIN
  SELECT account_code INTO code FROM public.finance_type_account_map
  WHERE finance_type_id = NEW.finance_type_id AND entity = 'CONVENCAO' AND entity_id = NEW.convention_id AND nature = 'DESPESA' LIMIT 1;
  IF NEW.account_code IS NULL AND code IS NOT NULL THEN NEW.account_code := code; END IF;
  RETURN NEW;
END;$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_map_account_code_conv_entry') THEN
    CREATE TRIGGER trg_map_account_code_conv_entry BEFORE INSERT OR UPDATE ON public.convention_entries
    FOR EACH ROW EXECUTE PROCEDURE public.map_account_code_conv_entry();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_map_account_code_conv_expense') THEN
    CREATE TRIGGER trg_map_account_code_conv_expense BEFORE INSERT OR UPDATE ON public.convention_expenses
    FOR EACH ROW EXECUTE PROCEDURE public.map_account_code_conv_expense();
  END IF;
END $$;

