-- ==========================================
-- ESTATÍSTICAS E PÁGINAS PÚBLICAS
-- ==========================================

-- 1. View: Estatísticas por Idade
CREATE OR REPLACE VIEW public.member_age_stats AS
SELECT 
  m.id,
  m.full_name,
  m.data_nascimento,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento))::INTEGER as idade,
  CASE
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 0 AND 12 THEN '0-12 (Crianças)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 13 AND 17 THEN '13-17 (Adolescentes)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 18 AND 25 THEN '18-25 (Jovens)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 26 AND 40 THEN '26-40 (Jovens Adultos)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) BETWEEN 41 AND 60 THEN '41-60 (Adultos)'
    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento)) > 60 THEN '60+ (Idosos)'
    ELSE 'Não informado'
  END as faixa_etaria,
  m.church_id,
  m.cell_id,
  m.sexo,
  m.estado_civil,
  m.cargo_eclesiastico
FROM public.members m
WHERE m.data_nascimento IS NOT NULL AND m.is_active = true;

-- 2. View: Aniversariantes do Mês
CREATE OR REPLACE VIEW public.birthdays_current_month AS
SELECT 
  m.id,
  m.full_name,
  m.data_nascimento,
  m.foto_url,
  m.church_id,
  m.cell_id,
  c.nome_fantasia as church_name,
  ce.nome as cell_name,
  EXTRACT(DAY FROM m.data_nascimento)::INTEGER as dia,
  EXTRACT(MONTH FROM m.data_nascimento)::INTEGER as mes,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.data_nascimento))::INTEGER as idade
FROM public.members m
LEFT JOIN public.churches c ON c.id = m.church_id
LEFT JOIN public.cells ce ON ce.id = m.cell_id
WHERE EXTRACT(MONTH FROM m.data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND m.is_active = true
ORDER BY EXTRACT(DAY FROM m.data_nascimento);

-- 3. View Pública de Membros (APENAS dados não sensíveis)
CREATE OR REPLACE VIEW public.members_public_directory AS
SELECT 
  m.id,
  m.full_name,
  m.cargo_eclesiastico,
  m.foto_url,
  c.nome_fantasia as church_name,
  c.id as church_id,
  c.nivel as church_nivel,
  ce.nome as cell_name,
  ce.tipo_celula,
  ce.id as cell_id
FROM public.members m
LEFT JOIN public.churches c ON c.id = m.church_id
LEFT JOIN public.cells ce ON ce.id = m.cell_id
WHERE m.is_active = true;
-- NÃO EXPÕE: email, telefone, data_nascimento, sexo, estado_civil, endereço

-- RLS para view pública (acesso anônimo)
-- (views herdam RLS das tabelas base, mas podemos criar política específica)

-- 4. Tabela: Escalas de Serviço
CREATE TABLE IF NOT EXISTS public.service_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'louvor', 'pregacao', 'diacono', 'portaria', 
    'midia', 'infantil', 'limpeza', 'som', 'outro'
  )),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  horario TIME,
  responsavel_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  equipe TEXT[], -- Array de nomes da equipe
  observacoes TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_schedules_church ON public.service_schedules(church_id);
CREATE INDEX IF NOT EXISTS idx_service_schedules_data ON public.service_schedules(data);
CREATE INDEX IF NOT EXISTS idx_service_schedules_tipo ON public.service_schedules(tipo);

-- RLS para service_schedules
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;

-- Todos podem ver escalas públicas
CREATE POLICY IF NOT EXISTS "Anyone can view public schedules"
ON public.service_schedules FOR SELECT
USING (is_public = true);

-- Admins podem gerenciar escalas
CREATE POLICY IF NOT EXISTS "Admins can manage schedules"
ON public.service_schedules FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid()
    AND role IN ('pastor_presidente', 'admin', 'super_admin')
    AND church_id = service_schedules.church_id
));

-- 5. Tabela: Documentos da Igreja (Regulamentos)
CREATE TABLE IF NOT EXISTS public.church_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'estatuto', 'regimento', 'normas', 'manual', 'declaracao_fe', 'outro'
  )),
  titulo TEXT NOT NULL,
  conteudo TEXT, -- Markdown ou texto simples
  documento_url TEXT, -- URL do PDF no Storage
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_church_documents_church ON public.church_documents(church_id);
CREATE INDEX IF NOT EXISTS idx_church_documents_tipo ON public.church_documents(tipo);

-- RLS para church_documents
ALTER TABLE public.church_documents ENABLE ROW LEVEL SECURITY;

-- Todos podem ver documentos públicos
CREATE POLICY IF NOT EXISTS "Anyone can view public documents"
ON public.church_documents FOR SELECT
USING (is_public = true);

-- Admins podem gerenciar documentos
CREATE POLICY IF NOT EXISTS "Admins can manage documents"
ON public.church_documents FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid()
    AND role IN ('pastor_presidente', 'admin', 'super_admin')
    AND church_id = church_documents.church_id
));

-- 6. Função: Estatísticas Gerais da Igreja
CREATE OR REPLACE FUNCTION public.get_church_statistics(p_church_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_members', (
      SELECT COUNT(*)
      FROM members
      WHERE church_id = p_church_id AND is_active = true
    ),
    'by_gender', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('sexo', sexo, 'count', count)), '[]'::jsonb)
      FROM (
        SELECT sexo, COUNT(*)::INTEGER as count
        FROM members
        WHERE church_id = p_church_id AND sexo IS NOT NULL AND is_active = true
        GROUP BY sexo
        ORDER BY sexo
      ) t
    ),
    'by_marital_status', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('estado', estado_civil, 'count', count)), '[]'::jsonb)
      FROM (
        SELECT estado_civil, COUNT(*)::INTEGER as count
        FROM members
        WHERE church_id = p_church_id AND estado_civil IS NOT NULL AND is_active = true
        GROUP BY estado_civil
        ORDER BY estado_civil
      ) t
    ),
    'by_age_group', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('faixa', faixa_etaria, 'count', count)), '[]'::jsonb)
      FROM (
        SELECT faixa_etaria, COUNT(*)::INTEGER as count
        FROM member_age_stats
        WHERE church_id = p_church_id
        GROUP BY faixa_etaria
        ORDER BY faixa_etaria
      ) t
    ),
    'by_cargo', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('cargo', cargo_eclesiastico, 'count', count)), '[]'::jsonb)
      FROM (
        SELECT cargo_eclesiastico, COUNT(*)::INTEGER as count
        FROM members
        WHERE church_id = p_church_id AND cargo_eclesiastico IS NOT NULL AND is_active = true
        GROUP BY cargo_eclesiastico
        ORDER BY count DESC
        LIMIT 10
      ) t
    ),
    'total_cells', (
      SELECT COUNT(*)
      FROM cells
      WHERE church_id = p_church_id AND is_active = true
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_church_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_church_statistics TO anon;

-- 7. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_service_schedules_updated_at ON public.service_schedules;
CREATE TRIGGER update_service_schedules_updated_at
  BEFORE UPDATE ON public.service_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_church_documents_updated_at ON public.church_documents;
CREATE TRIGGER update_church_documents_updated_at
  BEFORE UPDATE ON public.church_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Comentários
COMMENT ON VIEW member_age_stats IS 'Estatísticas de membros por faixa etária';
COMMENT ON VIEW birthdays_current_month IS 'Aniversariantes do mês atual';
COMMENT ON VIEW members_public_directory IS 'Diretório público de membros (dados não sensíveis)';
COMMENT ON TABLE service_schedules IS 'Escalas de serviço da igreja (louvor, pregação, etc)';
COMMENT ON TABLE church_documents IS 'Documentos e regulamentos da igreja (estatuto, regimento, etc)';
COMMENT ON FUNCTION get_church_statistics IS 'Retorna estatísticas agregadas da igreja em formato JSON';

-- Script completo!
