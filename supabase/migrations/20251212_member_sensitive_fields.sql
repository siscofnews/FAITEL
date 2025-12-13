ALTER TABLE public.member_profiles ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.member_profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_since DATE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS cred_valid_until DATE;

