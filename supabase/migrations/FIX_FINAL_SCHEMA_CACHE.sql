-- CORREÇÃO FINAL E COMPLETA
-- RODE ESTE SCRIPT NO EDITOR SQL DO SUPABASE

-- 1. Garante colunas na tabela CHURCHES
ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS status_licenca TEXT DEFAULT 'ATIVO',
ADD COLUMN IF NOT EXISTS data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '35 days');

-- 2. Garante TODAS as colunas na tabela MEMBERS
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS genero TEXT,
ADD COLUMN IF NOT EXISTS estado_civil TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS cargo_eclesiastico TEXT DEFAULT 'Membro',
ADD COLUMN IF NOT EXISTS cell_id UUID REFERENCES public.cells(id),
ADD COLUMN IF NOT EXISTS photo_url TEXT,  -- Adicionando a coluna que faltava
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Força atualização imediata do cache
NOTIFY pgrst, 'reload schema';
