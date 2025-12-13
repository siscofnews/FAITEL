INSERT INTO storage.buckets (id, name, public)
VALUES ('credential-templates', 'credential-templates', true)
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  BEGIN
    CREATE POLICY "public read credential templates" ON storage.objects
      FOR SELECT USING (bucket_id = 'credential-templates');
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    CREATE POLICY "authenticated upload credential templates" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'credential-templates' AND auth.role() = 'authenticated');
  EXCEPTION WHEN duplicate_object THEN END;
END $$;

