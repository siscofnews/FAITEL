-- 1. ADICIONAR CAMPOS DE ENDEREÇO NA TABELA CHURCHES
-- Verifica se as colunas já existem para evitar erros
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'churches' AND column_name = 'numero') THEN
        ALTER TABLE public.churches ADD COLUMN numero text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'churches' AND column_name = 'bairro') THEN
        ALTER TABLE public.churches ADD COLUMN bairro text;
    END IF;
END $$;

-- 2. ADICIONAR CAMPOS DE ENDEREÇO NA TABELA CELLS
-- Adiciona cep, endereco, numero, bairro, cidade, estado para células
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'cep') THEN
        ALTER TABLE public.cells ADD COLUMN cep text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'endereco') THEN
        ALTER TABLE public.cells ADD COLUMN endereco text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'numero') THEN
        ALTER TABLE public.cells ADD COLUMN numero text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'bairro') THEN
        ALTER TABLE public.cells ADD COLUMN bairro text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'cidade') THEN
        ALTER TABLE public.cells ADD COLUMN cidade text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cells' AND column_name = 'estado') THEN
        ALTER TABLE public.cells ADD COLUMN estado text;
    END IF;
END $$;

-- 3. CRIAR BUCKETS DE STORAGE (CORREÇÃO ERRO "BUCKET NOT FOUND")
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-logos', 'church-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. POLÍTICAS DE ACESSO PARA OS BUCKETS
-- CHURCH LOGOS (Upload autenticado, Leitura pública)
DROP POLICY IF EXISTS "Public Access Logos" ON storage.objects;
CREATE POLICY "Public Access Logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'church-logos' );

DROP POLICY IF EXISTS "Authenticated Upload Logos" ON storage.objects;
CREATE POLICY "Authenticated Upload Logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'church-logos' );

-- MEMBER PHOTOS (Upload público - para cadastro externo, Leitura pública)
DROP POLICY IF EXISTS "Public Access Member Photos" ON storage.objects;
CREATE POLICY "Public Access Member Photos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'member-photos' );

-- Permite upload público (necessário para o formulário de cadastro de membro externo)
DROP POLICY IF EXISTS "Public Upload Member Photos" ON storage.objects;
CREATE POLICY "Public Upload Member Photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'member-photos' );

-- Permite upload autenticado (para admins editarem membros)
DROP POLICY IF EXISTS "Authenticated Upload Member Photos" ON storage.objects;
CREATE POLICY "Authenticated Upload Member Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'member-photos' );
