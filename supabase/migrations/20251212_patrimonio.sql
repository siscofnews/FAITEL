CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.asset_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.church_codes (
  church_id UUID PRIMARY KEY REFERENCES public.churches(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL
);

CREATE OR REPLACE FUNCTION public.ensure_church_code(_church_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE v_code TEXT;
BEGIN
  SELECT code INTO v_code FROM public.church_codes WHERE church_id = _church_id;
  IF v_code IS NULL THEN
    v_code := 'CH-' || SUBSTRING(_church_id::TEXT FROM 1 FOR 8);
    INSERT INTO public.church_codes(church_id, code) VALUES (_church_id, v_code) ON CONFLICT (church_id) DO NOTHING;
  END IF;
  RETURN v_code;
END;$$;

CREATE TABLE IF NOT EXISTS public.asset_code_sequence (
  church_code TEXT PRIMARY KEY,
  last_seq BIGINT DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.generate_asset_code_by_church(_church_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE v_code TEXT; v_seq BIGINT; v_asset_code TEXT;
BEGIN
  v_code := public.ensure_church_code(_church_id);
  PERFORM 1 FROM public.asset_code_sequence WHERE church_code = v_code;
  IF NOT FOUND THEN INSERT INTO public.asset_code_sequence(church_code,last_seq) VALUES (v_code,0); END IF;
  UPDATE public.asset_code_sequence SET last_seq = last_seq + 1 WHERE church_code = v_code RETURNING last_seq INTO v_seq;
  v_asset_code := 'PAT-' || v_code || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN v_asset_code;
END;$$;

CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.asset_categories(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_value NUMERIC(14,2) DEFAULT 0,
  total_value NUMERIC(16,2) GENERATED ALWAYS AS (quantity * unit_value) STORED,
  status TEXT DEFAULT 'ATIVO' CHECK (status IN ('ATIVO','EMPRESTADO','EM_REPARO','DOADO','BAIXADO')),
  files JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('emprestimo','doacao','retirada','retorno')),
  protocol_code TEXT UNIQUE,
  quantity INTEGER DEFAULT 1,
  destination TEXT,
  authorized_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  signatures JSONB
);

CREATE TABLE IF NOT EXISTS public.asset_defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto','em_conserto','resolvido')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_repairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  defect_id UUID REFERENCES public.asset_defects(id) ON DELETE SET NULL,
  provider TEXT,
  cost NUMERIC(14,2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  notes TEXT
);

CREATE OR REPLACE FUNCTION public.generate_protocol_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE v_code TEXT;
BEGIN
  v_code := 'PRT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW()))::BIGINT::TEXT, 10, '0');
  RETURN v_code;
END;$$;

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_repairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_view_scope" ON public.assets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid())
  );

CREATE POLICY "assets_manage_scope" ON public.assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid())
  );

