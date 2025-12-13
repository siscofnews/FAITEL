DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
    CREATE TYPE role_type AS ENUM('SUPER_ADMIN','CHURCH_ADMIN','CONVENTION_ADMIN','COLLEGE_ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_type') THEN
    CREATE TYPE system_type AS ENUM('church','convention','college');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.global_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  name TEXT,
  email TEXT,
  role role_type NOT NULL,
  system_type system_type,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_type system_type NOT NULL,
  organization_id UUID NOT NULL,
  logo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.church_matriz (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  pastor TEXT,
  address TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS public.church_sede (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matriz_id UUID REFERENCES public.church_matriz(id) ON DELETE CASCADE,
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.church_subsede (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sede_id UUID REFERENCES public.church_sede(id) ON DELETE CASCADE,
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.church_congregation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subsede_id UUID REFERENCES public.church_subsede(id) ON DELETE CASCADE,
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.convention_national (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.convention_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  national_id UUID REFERENCES public.convention_national(id) ON DELETE CASCADE,
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.convention_coordination (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id UUID REFERENCES public.convention_state(id) ON DELETE CASCADE,
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.college_matriz (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.college_polo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matriz_id UUID REFERENCES public.college_matriz(id) ON DELETE CASCADE,
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.college_nucleo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  polo_id UUID REFERENCES public.college_polo(id) ON DELETE CASCADE,
  name TEXT
);

