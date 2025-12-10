-- Allow public member registration
-- This policy allows anyone (including unauthenticated users) to insert into the members table
-- This is required for the public member registration form to work

CREATE POLICY "Public can register as member" ON public.members
  FOR INSERT
  WITH CHECK (true);

-- Allow public to read active cells (needed for the dropdown in registration form)
CREATE POLICY "Public can view active cells" ON public.cells
  FOR SELECT
  USING (is_active = true);

-- Note: We might want to add rate limiting or stricter checks in a future update, 
-- such as validating that the church_id exists, but RLS for INSERT checks the row being inserted.
