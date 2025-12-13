CREATE TABLE IF NOT EXISTS public.credential_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type credential_type NOT NULL,
  number TEXT UNIQUE NOT NULL,
  signature_url TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.generate_credential_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v TEXT; BEGIN v := 'CRD-' || TO_CHAR(NOW(),'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW()))::BIGINT::TEXT,10,'0'); RETURN v; END;$$;

CREATE OR REPLACE FUNCTION public.ensure_credential_number(_member UUID, _type credential_type)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE n TEXT; BEGIN
  SELECT number INTO n FROM public.credential_numbers WHERE member_id = _member AND type = _type LIMIT 1;
  IF n IS NULL THEN n := public.generate_credential_number(); INSERT INTO public.credential_numbers(member_id,type,number) VALUES (_member,_type,n); END IF;
  RETURN n;
END;$$;

