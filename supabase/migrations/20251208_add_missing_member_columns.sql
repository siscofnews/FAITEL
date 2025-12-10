-- Add missing columns to members table if they don't exist
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS number text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS photo_url text;

-- Refresh the schema cache (notify PostgREST)
NOTIFY pgrst, 'reload config';
