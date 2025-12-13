CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credential_type') THEN
    CREATE TYPE credential_type AS ENUM ('member','convention','student');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.credential_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  type credential_type NOT NULL,
  image_url TEXT NOT NULL,
  width_px INTEGER,
  height_px INTEGER,
  dpi INTEGER,
  primary_color TEXT,
  secondary_color TEXT,
  side TEXT DEFAULT 'front' CHECK (side IN ('front','back')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credential_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.credential_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_key TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  w INTEGER,
  h INTEGER,
  font_size INTEGER,
  font_family TEXT,
  color TEXT,
  align TEXT,
  bold BOOLEAN DEFAULT FALSE,
  is_image BOOLEAN DEFAULT FALSE,
  is_qr BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.credential_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_fields ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "templates_by_church" ON public.credential_templates;
  CREATE POLICY "templates_by_church" ON public.credential_templates
    FOR ALL USING (
      EXISTS(
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.church_id = credential_templates.church_id
      )
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "fields_by_template_church" ON public.credential_fields;
  CREATE POLICY "fields_by_template_church" ON public.credential_fields
    FOR ALL USING (
      EXISTS(
        SELECT 1 FROM public.credential_templates ct
        JOIN public.user_roles ur ON ur.church_id = ct.church_id
        WHERE ct.id = credential_fields.template_id AND ur.user_id = auth.uid()
      )
    );
END $$;

