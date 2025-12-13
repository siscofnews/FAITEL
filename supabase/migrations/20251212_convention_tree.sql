CREATE OR REPLACE FUNCTION public.get_convention_tree(_root UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE result JSONB;
BEGIN
  WITH RECURSIVE tree AS (
    SELECT id FROM public.conventions WHERE id = _root
    UNION ALL
    SELECT c.id FROM public.conventions c JOIN tree t ON c.parent_id = t.id
  )
  SELECT jsonb_agg(id) INTO result FROM tree;
  RETURN result;
END;$$;

