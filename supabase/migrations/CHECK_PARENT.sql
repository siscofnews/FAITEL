-- Script Visual para Verificação de Vínculo
-- Este script vai MOSTRAR na tela a quem o "Aeroporto" pertence

SELECT 
    filha.nome_fantasia AS "Nome da Igreja",
    filha.nivel AS "Nível",
    filha.is_active AS "Está Ativa?",
    pai.nome_fantasia AS "Pertence à Matriz/Sede"
FROM 
    public.churches AS filha
LEFT JOIN 
    public.churches AS pai ON filha.parent_church_id = pai.id
WHERE 
    filha.nome_fantasia ILIKE '%Aeroporto%';
