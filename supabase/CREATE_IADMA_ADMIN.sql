-- ==========================================
-- CRIAR MATRIZ IADMA E SUPER ADMIN
-- ==========================================
-- Use este script se ainda não existem
-- ==========================================

-- 1. Criar Matriz IADMA (se não existe)
INSERT INTO public.churches (
  id,
  nome_fantasia,
  razao_social,
  cnpj,
  nivel,
  endereco,
  cidade,
  estado,
  cep,
  telefone,
  email,
  pastor_presidente_nome,
  pastor_presidente_cpf,
  is_approved,
  is_active,
  status_licenca,
  data_vencimento,
  parent_church_id,
  created_at
) VALUES (
  gen_random_uuid(), -- ou UUID específico
  'IADMA - Igreja Assembleia de Deus Missões no Acre',
  'IADMA', -- Razão social
  '00.000.000/0000-00', -- CNPJ (ajustar)
  'matriz',
  'Endereço da Igreja', -- Ajustar
  'Rio Branco', -- Ajustar
  'AC',
  '00000-000', -- Ajustar
  '(68) 0000-0000', -- Ajustar
  'contato@iadma.org', -- Ajustar
  'Nome do Pastor Presidente', -- Ajustar
  '000.000.000-00', -- CPF do Pastor (ajustar)
  true, -- Aprovada
  true, -- Ativa
  'ATIVO',
  CURRENT_DATE + INTERVAL '365 days', -- 1 ano de licença
  NULL, -- Sem pai (é matriz)
  now()
)
ON CONFLICT DO NOTHING;

-- 2. Criar Super Admin (IMPORTANTE: Ajuste os dados)
-- Primeiro, crie o usuário no Supabase Auth (Dashboard)
-- Depois execute este SQL:

-- Obter o UUID do usuário criado no Auth
-- Substitua 'UUID_DO_AUTH_USER' pelo ID real

INSERT INTO public.members (
  id,
  user_id,
  full_name,
  email,
  telefone,
  church_id,
  cargo_eclesiastico,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'UUID_DO_AUTH_USER', -- ⚠️ SUBSTITUIR pelo UUID do Auth
  'Super Administrador',
  'admin@iadma.org', -- ⚠️ SUBSTITUIR pelo email real
  '(68) 00000-0000',
  (SELECT id FROM public.churches WHERE nome_fantasia LIKE '%IADMA%' AND nivel = 'matriz' LIMIT 1),
  'pastor',
  true,
  now()
)
ON CONFLICT DO NOTHING;

-- 3. Criar role de Super Admin
INSERT INTO public.user_roles (
  user_id,
  role,
  church_id,
  is_super_admin,
  created_at
) VALUES (
  'UUID_DO_AUTH_USER', -- ⚠️ MESMO UUID do passo anterior
  'super_admin',
  (SELECT id FROM public.churches WHERE nome_fantasia LIKE '%IADMA%' AND nivel = 'matriz' LIMIT 1),
  true,
  now()
)
ON CONFLICT DO NOTHING;

-- Verificar criação:
SELECT 
  c.nome_fantasia as igreja,
  c.nivel,
  c.status_licenca,
  m.full_name as super_admin,
  m.email,
  ur.role,
  ur.is_super_admin
FROM public.churches c
LEFT JOIN public.members m ON m.church_id = c.id
LEFT JOIN public.user_roles ur ON ur.user_id = m.user_id
WHERE c.nivel = 'matriz';
