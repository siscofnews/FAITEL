ALTER TABLE public.church_matriz ADD COLUMN IF NOT EXISTS finance_church_id UUID;
ALTER TABLE public.church_sede ADD COLUMN IF NOT EXISTS finance_church_id UUID;
ALTER TABLE public.church_subsede ADD COLUMN IF NOT EXISTS finance_church_id UUID;
ALTER TABLE public.church_congregation ADD COLUMN IF NOT EXISTS finance_church_id UUID;

ALTER TABLE public.convention_national ADD COLUMN IF NOT EXISTS finance_convention_id UUID;
ALTER TABLE public.convention_state ADD COLUMN IF NOT EXISTS finance_convention_id UUID;
ALTER TABLE public.convention_coordination ADD COLUMN IF NOT EXISTS finance_convention_id UUID;

ALTER TABLE public.college_matriz ADD COLUMN IF NOT EXISTS finance_faculty_id UUID;
ALTER TABLE public.college_polo ADD COLUMN IF NOT EXISTS finance_pole_id UUID;
ALTER TABLE public.college_nucleo ADD COLUMN IF NOT EXISTS finance_nucleo_id UUID;

