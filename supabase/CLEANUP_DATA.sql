-- ==========================================
-- LIMPEZA DE DADOS - SISCOF
-- ==========================================
-- Remove todos os dados de teste
-- Mantém apenas: Matriz IADMA + Super Admin
-- ==========================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- ==========================================

-- ⚠️ ATENÇÃO: Este script vai APAGAR dados!
-- Use com cuidado em ambiente de produção

BEGIN;

-- 1. Limpar tabelas de dados operacionais
DELETE FROM public.schedule_confirmations;
DELETE FROM public.service_schedules;
DELETE FROM public.notification_queue;
DELETE FROM public.notifications;
DELETE FROM public.permission_logs;
DELETE FROM public.payments;
DELETE FROM public.cells;

-- 2. Remover membros (EXCETO Super Admin)
-- Primeiro, identifique o ID do Super Admin
-- Substitua 'EMAIL_DO_SUPER_ADMIN' pelo email real
DELETE FROM public.members
WHERE email != 'EMAIL_DO_SUPER_ADMIN@exemplo.com';

-- OU se você souber o ID do usuário do Super Admin:
-- DELETE FROM public.members
-- WHERE user_id != 'UUID_DO_SUPER_ADMIN';

-- 3. Remover user_roles (EXCETO Super Admin)
DELETE FROM public.user_roles
WHERE user_id NOT IN (
  SELECT user_id FROM public.members 
  WHERE email = 'EMAIL_DO_SUPER_ADMIN@exemplo.com'
);

-- 4. Remover igrejas (EXCETO Matriz IADMA)
-- Identifique a Matriz IADMA pelo nome
DELETE FROM public.churches
WHERE nome_fantasia NOT LIKE '%IADMA%' 
  OR nivel != 'matriz';

-- OU se você souber o ID específico da Matriz IADMA:
-- DELETE FROM public.churches
-- WHERE id != 'UUID_DA_MATRIZ_IADMA';

-- 5. Resetar sequences (IDs auto-incremento) se houver
-- (Adapte conforme necessário)

-- 6. Limpar storage buckets (executar manualmente no dashboard)
-- - Ir em Storage > church-logos > Apagar arquivos de teste
-- - Ir em Storage > member-photos > Apagar arquivos de teste

COMMIT;

-- Verificar o que sobrou:
SELECT 'churches' as tabela, COUNT(*) as registros FROM public.churches
UNION ALL
SELECT 'members', COUNT(*) FROM public.members
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'cells', COUNT(*) FROM public.cells
UNION ALL
SELECT 'service_schedules', COUNT(*) FROM public.service_schedules;

-- Deverá mostrar:
-- churches: 1 (apenas Matriz IADMA)
-- members: 1 (apenas Super Admin)
-- user_roles: 1 (apenas Super Admin)
-- cells: 0
-- service_schedules: 0
