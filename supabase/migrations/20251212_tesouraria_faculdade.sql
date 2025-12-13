CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faculty_poles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES public.faculties(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name TEXT,
  repass_percentage NUMERIC(5,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pole_id UUID REFERENCES public.faculty_poles(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES public.faculties(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name TEXT,
  price NUMERIC(14,2)
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  total_price NUMERIC(14,2)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  pole_id UUID REFERENCES public.faculty_poles(id) ON DELETE CASCADE,
  amount NUMERIC(14,2),
  payment_method payment_method,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pole_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pole_id UUID REFERENCES public.faculty_poles(id) ON DELETE CASCADE,
  year INT,
  month INT,
  opening_balance NUMERIC(14,2) DEFAULT 0,
  closed BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE FUNCTION public.close_pole_account(acc_uuid UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE p_id UUID; f_id UUID; rep_pct NUMERIC(5,2); entries_sum NUMERIC(14,2); expenses_sum NUMERIC(14,2); balance NUMERIC(14,2); repass NUMERIC(14,2);
BEGIN
  SELECT pole_id INTO p_id FROM public.pole_accounts WHERE id = acc_uuid;
  SELECT faculty_id, repass_percentage INTO f_id, rep_pct FROM public.faculty_poles WHERE id = p_id;
  SELECT COALESCE(SUM(amount),0) INTO entries_sum FROM public.payments WHERE pole_id = p_id;
  expenses_sum := 0;
  balance := entries_sum - expenses_sum;
  repass := ROUND((balance * rep_pct / 100)::numeric,2);
  INSERT INTO public.account_closures(account_id,total_entries,total_expenses,repass_amount,closing_balance)
  VALUES (acc_uuid, entries_sum, expenses_sum, repass, balance - repass);
  UPDATE public.pole_accounts SET closed = TRUE WHERE id = acc_uuid;
END;$$;

