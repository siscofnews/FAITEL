-- SCRIPT DE INVESTIGAÇÃO DE MEMBRO OCULTO
-- Rode este script no SQL Editor do Supabase

SELECT 
    id, 
    full_name, 
    email, 
    church_id, 
    c.nome_fantasia as nome_igreja, 
    m.is_active
FROM public.members m
LEFT JOIN public.churches c ON m.church_id = c.id
WHERE m.full_name ILIKE '%Valdinei%';

-- Verifique se o 'church_id' corresponde à igreja que você está olhando na tela.
-- Verifique se 'is_active' está TRUE.
