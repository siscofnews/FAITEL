DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'accounting_section') THEN
    CREATE TYPE accounting_section AS ENUM('header','body','footer');
  END IF;
END $$;

ALTER TABLE public.accounting_specs ADD COLUMN IF NOT EXISTS row_ord INT DEFAULT 1;
ALTER TABLE public.accounting_specs ADD COLUMN IF NOT EXISTS section2 accounting_section DEFAULT 'body';
UPDATE public.accounting_specs SET section2 = 'body' WHERE section IS NOT NULL;
ALTER TABLE public.accounting_specs DROP COLUMN section;
ALTER TABLE public.accounting_specs RENAME COLUMN section2 TO section;

