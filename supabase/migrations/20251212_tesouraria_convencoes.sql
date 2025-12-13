CREATE TABLE IF NOT EXISTS public.conventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID,
  repass_percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.convention_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  convention_id UUID REFERENCES public.conventions(id) ON DELETE CASCADE,
  year INT,
  month INT,
  opening_balance NUMERIC(14,2) DEFAULT 0,
  closed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.convention_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  convention_id UUID REFERENCES public.conventions(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.convention_accounts(id) ON DELETE CASCADE,
  finance_type_id UUID REFERENCES public.finance_types(id),
  member_id UUID,
  description TEXT,
  amount NUMERIC(14,2),
  date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.convention_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  convention_id UUID REFERENCES public.conventions(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.convention_accounts(id) ON DELETE CASCADE,
  supplier_id UUID,
  description TEXT,
  amount NUMERIC(14,2),
  discount NUMERIC(14,2) DEFAULT 0,
  interest NUMERIC(14,2) DEFAULT 0,
  total_value NUMERIC(14,2) GENERATED ALWAYS AS (amount - discount + interest) STORED
);

CREATE OR REPLACE FUNCTION public.close_convention_account(acc_uuid UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE conv_id UUID; parent_conv UUID; rep_pct NUMERIC(5,2); entries_sum NUMERIC(14,2); expenses_sum NUMERIC(14,2); balance NUMERIC(14,2); repass NUMERIC(14,2);
BEGIN
  SELECT convention_id INTO conv_id FROM public.convention_accounts WHERE id = acc_uuid;
  SELECT parent_id, repass_percentage INTO parent_conv, rep_pct FROM public.conventions WHERE id = conv_id;
  SELECT COALESCE(SUM(amount),0) INTO entries_sum FROM public.convention_entries WHERE account_id = acc_uuid;
  SELECT COALESCE(SUM(total_value),0) INTO expenses_sum FROM public.convention_expenses WHERE account_id = acc_uuid;
  balance := entries_sum - expenses_sum;
  repass := ROUND((balance * rep_pct / 100)::numeric,2);
  INSERT INTO public.account_closures(account_id,total_entries,total_expenses,repass_amount,closing_balance)
  VALUES (acc_uuid, entries_sum, expenses_sum, repass, balance - repass);
  UPDATE public.convention_accounts SET closed = TRUE WHERE id = acc_uuid;
  IF rep_pct > 0 AND parent_conv IS NOT NULL THEN
    INSERT INTO public.repass_logs(from_church, to_church, account_id, amount)
    VALUES (conv_id, parent_conv, acc_uuid, repass);
  END IF;
END;$$;

