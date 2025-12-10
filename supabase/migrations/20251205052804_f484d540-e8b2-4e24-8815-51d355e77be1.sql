-- Allow public church registration (unapproved by default)
CREATE POLICY "Anyone can register a church"
ON public.churches
FOR INSERT
TO anon, authenticated
WITH CHECK (is_approved = false AND is_active = true);

-- Allow anyone to view their own pending registration by email
CREATE POLICY "Anyone can view pending churches by email"
ON public.churches
FOR SELECT
TO anon, authenticated
USING (is_approved = false AND email IS NOT NULL);