CREATE TABLE IF NOT EXISTS public.church_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  opening_balance NUMERIC(14,2) DEFAULT 0,
  closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.church_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.church_accounts(id) ON DELETE CASCADE,
  finance_type_id UUID REFERENCES public.finance_types(id),
  description TEXT,
  amount NUMERIC(14,2) NOT NULL,
  payment_method payment_method,
  date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.church_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.church_accounts(id) ON DELETE CASCADE,
  description TEXT,
  amount NUMERIC(14,2) NOT NULL,
  discount NUMERIC(14,2) DEFAULT 0,
  interest NUMERIC(14,2) DEFAULT 0,
  total_value NUMERIC(14,2) GENERATED ALWAYS AS (amount - discount + interest) STORED,
  date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS repass_percentage NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS parent_id UUID;

CREATE OR REPLACE FUNCTION public.calculate_repass_and_close(account_uuid UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE ch_id UUID; rep_pct NUMERIC(5,2); entries_sum NUMERIC(14,2); expenses_sum NUMERIC(14,2); balance NUMERIC(14,2); repass NUMERIC(14,2);
BEGIN
  SELECT church_id INTO ch_id FROM public.church_accounts WHERE id = account_uuid;
  SELECT repass_percentage INTO rep_pct FROM public.churches WHERE id = ch_id;
  SELECT COALESCE(SUM(amount),0) INTO entries_sum FROM public.church_entries WHERE account_id = account_uuid;
  SELECT COALESCE(SUM(total_value),0) INTO expenses_sum FROM public.church_expenses WHERE account_id = account_uuid;
  balance := entries_sum - expenses_sum;
  repass := ROUND((balance * rep_pct / 100)::numeric,2);
  INSERT INTO public.account_closures(account_id,total_entries,total_expenses,repass_amount,closing_balance)
  VALUES (account_uuid, entries_sum, expenses_sum, repass, balance - repass);
  UPDATE public.church_accounts SET closed = TRUE WHERE id = account_uuid;
  IF rep_pct > 0 THEN
    INSERT INTO public.repass_logs(from_church, to_church, account_id, amount)
    SELECT ch_id, parent_id, account_uuid, repass FROM public.churches WHERE id = ch_id AND parent_id IS NOT NULL;
  END IF;
END;$$;

CREATE TABLE IF NOT EXISTS public.account_closures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  total_entries NUMERIC(14,2),
  total_expenses NUMERIC(14,2),
  repass_amount NUMERIC(14,2),
  closing_balance NUMERIC(14,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

