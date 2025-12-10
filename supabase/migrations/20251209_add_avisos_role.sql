INSERT INTO public.assignment_roles (name, category, is_multiple, is_system_default)
SELECT 'Avisos', 'liturgy', false, true
WHERE NOT EXISTS (
    SELECT 1 FROM public.assignment_roles WHERE name = 'Avisos'
);
