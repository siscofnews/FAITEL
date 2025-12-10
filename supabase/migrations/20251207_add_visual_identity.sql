-- ==========================================
-- IDENTIDADE VISUAL E CADASTRO OBRIGATÓRIO
-- ==========================================

-- 1. Adicionar campo de logo nas igrejas
ALTER TABLE public.churches
ADD COLUMN IF NOT EXISTS logo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_churches_logo ON public.churches(logo_url) WHERE logo_url IS NOT NULL;

-- 2. Adicionar campos obrigatórios em membros
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('masculino', 'feminino', 'outro')),
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS estado_civil TEXT CHECK (estado_civil IN (
  'solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'
));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_members_sexo ON public.members(sexo);
CREATE INDEX IF NOT EXISTS idx_members_data_nascimento ON public.members(data_nascimento);
CREATE INDEX IF NOT EXISTS idx_members_estado_civil ON public.members(estado_civil);
CREATE INDEX IF NOT EXISTS idx_members_foto ON public.members(foto_url) WHERE foto_url IS NOT NULL;

-- 3. Criar buckets no Supabase Storage (executar via SQL ou Dashboard)
-- Bucket: church-logos (para logos das igrejas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-logos', 'church-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket: member-photos (para fotos dos membros)
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Policies para church-logos
-- Policy: Admins podem fazer upload de logo
CREATE POLICY IF NOT EXISTS "Church admins can upload logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'church-logos' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN churches c ON c.id = ur.church_id
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('pastor_presidente', 'admin', 'super_admin')
      AND (storage.foldername(name))[1] = c.id::text
  )
);

-- Policy: Todos podem ver logos
CREATE POLICY IF NOT EXISTS "Anyone can view church logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-logos');

-- Policy: Admins podem atualizar logo
CREATE POLICY IF NOT EXISTS "Church admins can update logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'church-logos' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN churches c ON c.id = ur.church_id
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('pastor_presidente', 'admin', 'super_admin')
      AND (storage.foldername(name))[1] = c.id::text
  )
);

-- 5. Policies para member-photos
-- Policy: Usuários autenticados podem upload
CREATE POLICY IF NOT EXISTS "Users can upload own photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'member-photos' AND
  auth.role() = 'authenticated'
);

-- Policy: Todos podem ver fotos de membros
CREATE POLICY IF NOT EXISTS "Anyone can view member photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

-- Policy: Usuários podem atualizar própria foto
CREATE POLICY IF NOT EXISTS "Users can update own photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'member-photos' AND
  auth.role() = 'authenticated'
);

-- 6. Função para pegar logo da matriz (recursivo)
CREATE OR REPLACE FUNCTION public.get_matrix_logo(p_church_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_logo_url TEXT;
  v_nivel church_level;
  v_parent_id UUID;
  v_current_id UUID;
  v_iterations INTEGER := 0;
  v_max_iterations INTEGER := 10; -- Prevenir loop infinito
BEGIN
  v_current_id := p_church_id;
  
  -- Loop até encontrar matriz ou atingir limite
  WHILE v_iterations < v_max_iterations LOOP
    -- Pega dados da igreja atual
    SELECT nivel, parent_church_id, logo_url
    INTO v_nivel, v_parent_id, v_logo_url
    FROM churches
    WHERE id = v_current_id;
    
    -- Se não encontrou, retorna null
    IF NOT FOUND THEN
      RETURN NULL;
    END IF;
    
    -- Se é matriz, retorna o logo (se houver)
    IF v_nivel = 'matriz' THEN
      RETURN v_logo_url;
    END IF;
    
    -- Se não tem pai, retorna logo atual (caso edge)
    IF v_parent_id IS NULL THEN
      RETURN v_logo_url;
    END IF;
    
    -- Sobe para o pai
    v_current_id := v_parent_id;
    v_iterations := v_iterations + 1;
  END LOOP;
  
  -- Se chegou aqui, não encontrou matriz em 10 níveis
  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_matrix_logo TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_matrix_logo TO anon;

COMMENT ON FUNCTION public.get_matrix_logo IS 'Retorna o logo da matriz ancestor de uma igreja, subindo recursivamente';

-- 7. Comentários
COMMENT ON COLUMN churches.logo_url IS 'URL do logo/logomarca da igreja armazenado no Supabase Storage';
COMMENT ON COLUMN members.foto_url IS 'URL da foto do membro (selfie ou upload)';
COMMENT ON COLUMN members.sexo IS 'Sexo do membro: masculino, feminino ou outro';
COMMENT ON COLUMN members.data_nascimento IS 'Data de nascimento do membro';
COMMENT ON COLUMN members.estado_civil IS 'Estado civil: solteiro, casado, divorciado, viuvo, uniao_estavel';

-- Script completo!
