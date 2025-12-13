CREATE TABLE IF NOT EXISTS public.credential_seq (
  church_id UUID NOT NULL,
  type credential_type NOT NULL,
  last_seq BIGINT DEFAULT 0,
  PRIMARY KEY(church_id, type)
);

CREATE OR REPLACE FUNCTION public.generate_credential_number_seq(_member UUID, _type credential_type)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE ch UUID; code TEXT; seq BIGINT; num TEXT;
BEGIN
  SELECT church_id INTO ch FROM public.members WHERE id = _member;
  IF ch IS NULL THEN RETURN NULL; END IF;
  code := public.ensure_church_code(ch);
  PERFORM 1 FROM public.credential_seq WHERE church_id = ch AND type = _type;
  IF NOT FOUND THEN INSERT INTO public.credential_seq(church_id, type, last_seq) VALUES (ch, _type, 0); END IF;
  UPDATE public.credential_seq SET last_seq = last_seq + 1 WHERE church_id = ch AND type = _type RETURNING last_seq INTO seq;
  num := 'CRD-' || CASE WHEN _type='member' THEN 'MB' WHEN _type='convention' THEN 'CV' ELSE 'ST' END || '-' || code || '-' || TO_CHAR(NOW(),'YYYY') || '-' || LPAD(seq::TEXT, 6, '0');
  RETURN num;
END;$$;

CREATE OR REPLACE FUNCTION public.ensure_credential_number(_member UUID, _type credential_type)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE n TEXT; rid UUID; BEGIN
  SELECT number INTO n FROM public.credential_numbers WHERE member_id = _member AND type = _type LIMIT 1;
  IF n IS NULL THEN n := public.generate_credential_number_seq(_member, _type); INSERT INTO public.credential_numbers(member_id,type,number) VALUES (_member,_type,n) RETURNING id INTO rid; END IF;
  RETURN n;
END;$$;

