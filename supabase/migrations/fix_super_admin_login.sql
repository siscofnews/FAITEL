-- =====================================================
-- SISCOF: Criar/Atualizar Super Admin
-- Email: siscofnews@gmail.com
-- =====================================================

-- IMPORTANTE: Execute este SQL no Supabase Dashboard
-- SQL Editor > New Query > Cole e Execute

-- Passo 1: Verificar se o usuário já existe
-- (Apenas para visualização - não precisa executar separadamente)
SELECT id, email, role, created_at 
FROM auth.users 
WHERE email = 'siscofnews@gmail.com';

-- Passo 2: Se o usuário NÃO existir, crie-o
-- ATENÇÃO: A senha será P26192920m
-- O Supabase vai fazer o hash automaticamente

-- EXECUTE ESTE BLOCO se o usuário não existir:
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'siscofnews@gmail.com',
  crypt('P26192920m', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"],"role":"super_admin"}',
  '{"full_name":"Super Administrador SISCOF"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
*/

-- Passo 3: Se o usuário JÁ EXISTE mas a senha está errada, atualize:
/*
UPDATE auth.users
SET 
  encrypted_password = crypt('P26192920m', gen_salt('bf')),
  raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"super_admin"}',
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'siscofnews@gmail.com';
*/

-- Passo 4: Garantir que o usuário tenha registro na tabela members
-- (Necessário para o sistema funcionar corretamente)
INSERT INTO members (
  id,
  email,
  full_name,
  role,
  is_active
)
SELECT 
  u.id,
  u.email,
  'Super Administrador SISCOF',
  'super_admin',
  true
FROM auth.users u
WHERE u.email = 'siscofnews@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;

-- Passo 5: Verificar se deu certo
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_app_meta_data->>'role' as auth_role,
  m.role as member_role,
  m.is_active
FROM auth.users u
LEFT JOIN members m ON m.id = u.id
WHERE u.email = 'siscofnews@gmail.com';

-- =====================================================
-- SOLUÇÃO ALTERNATIVA: Resetar senha via Supabase Dashboard
-- =====================================================
-- Se preferir, você pode:
-- 1. Ir em Authentication > Users
-- 2. Procurar siscofnews@gmail.com
-- 3. Clicar nos 3 pontinhos (...) > "Send password recovery"
-- 4. Usar o email para resetar a senha
