# Como Aplicar as Migrations da FAITEL

## 1. Acessar Supabase

1. Abra o Supabase Dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de </> no menu lateral)

## 2. Executar Migration de Estrutura

1. Clique em **+ New query**
2. Copie todo o conteúdo de: `supabase/migrations/20251213_faitel_ead_structure.sql`
3. Cole no editor
4. Clique em **Run** (ou F9)
5. Aguarde a confirmação: "Success. No rows returned"

## 3. Popular Cursos da FAITEL

1. Clique em **+ New query** novamente
2. Copie todo o conteúdo de: `supabase/FAITEL_COURSES_STRUCTURE.sql`
3. Cole no editor
4. Clique em **Run** (ou F9)
5. Você verá: "10 cursos criados com sucesso!"

## 4. Verificar se Foi Aplicado

Execute esta query para verificar:

```sql
-- Verificar cursos criados
SELECT name, level, duration_hours FROM courses ORDER BY created_at DESC;

-- Verificar módulos
SELECT name, course_id FROM course_modules LIMIT 10;

-- Verificar tabelas EAD
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ead_institutions', 'courses', 'course_modules', 'lessons', 'enrollments', 'lesson_progress', 'library_books');
```

Deverá retornar 7 tabelas.

## 5. Criar FAITEL Matriz (Primeira Instituição)

Depois de aplicar as migrations, você pode criar a FAITEL Matriz:

```sql
-- Criar FAITEL Matriz
INSERT INTO ead_institutions (name, institution_type, logo_url, video_url, contact_email, contact_phone)
VALUES (
  'FAITEL - Faculdade Internacional Teológica de Líderes',
  'matriz',
  '/images/faitel/logo-faitel.jpg',
  '/videos/chanceler-boas-vindas.mp4',
  'contato@faculdadefaitel.com.br',
  '+55 71 99999-9999'
);
```

## Próximos Passos

Após aplicar as migrations:
- ✅ Estrutura do banco pronta
- ✅ 10 cursos teológicos criados
- ✅ 60+ módulos estruturados
- ⏳ Próximo: Implementar páginas administrativas
