DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type') THEN
    BEGIN
      ALTER TYPE public.entity_type ADD VALUE IF NOT EXISTS 'POLO';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      ALTER TYPE public.entity_type ADD VALUE IF NOT EXISTS 'NUCLEO';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

